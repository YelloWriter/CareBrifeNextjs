"use server";

import { redirect } from "next/navigation";
import { clearSession, createSession, credentialsMatch } from "./session";

const INVALID_LOGIN = "아이디 또는 비밀번호가 올바르지 않습니다.";

export async function login(
  _state: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || typeof password !== "string") {
    return { error: INVALID_LOGIN };
  }
  if (!credentialsMatch(username, password)) {
    return { error: INVALID_LOGIN };
  }
  await createSession();
  redirect("/admin/faqs");
}

export async function logout() {
  await clearSession();
  redirect("/admin");
}
