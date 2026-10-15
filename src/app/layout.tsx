import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: "진료한장 | 부모님의 진료를 준비하는 가장 다정한 한 장",
  description:
    "부모님의 증상, 복용약, 최근 변화와 궁금한 점을 병원에서 보여줄 한 장으로 정리하는 진료 전 정보 정리 서비스",
  openGraph: {
    title: "진료한장",
    description: "부모님의 진료를 준비하는 가장 다정한 한 장, 진료한장",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "진료한장",
    description: "부모님의 진료를 준비하는 가장 다정한 한 장, 진료한장",
    images: ["/og.png"],
  },
  icons: { icon: { url: "/jinryo-hanjang-symbol-cropped.png", type: "image/png" } },
};

export const viewport: Viewport = { themeColor: "#f7fbfc" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body><div id="root">{children}</div></body>
    </html>
  );
}
