import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "carebrief_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/admin",
    maxAge,
  };
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

function signaturesMatch(payload: string, mac: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(mac, "base64url");
  if (actual.length !== expected.length) {
    timingSafeEqual(expected, expected);
    return false;
  }
  return timingSafeEqual(expected, actual);
}

export function credentialsMatch(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  const userOk = safeEqual(username, expectedUser) && expectedUser.length > 0;
  const passOk = safeEqual(password, expectedPass) && expectedPass.length > 0;
  return userOk && passOk && sessionSecret().length > 0;
}

export async function createSession() {
  const secret = sessionSecret();
  const payload = Buffer.from(
    JSON.stringify({ v: 1, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  ).toString("base64url");
  const mac = createHmac("sha256", secret).update(payload).digest("base64url");
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${mac}`, cookieOptions(MAX_AGE_SECONDS));
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", cookieOptions(0));
}

export async function hasAdminSession() {
  const secret = sessionSecret();
  if (!secret) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0 || token.indexOf(".", dot + 1) !== -1) return false;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  if (!signaturesMatch(payload, mac, secret)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { v?: unknown; exp?: unknown };
    return parsed.v === 1 && typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdminSession() {
  if (!(await hasAdminSession())) redirect("/admin");
}
