import type { Metadata, Viewport } from "next";
import "misans/lib/Normal/MiSans-Regular.min.css";
import "misans/lib/Normal/MiSans-Bold.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "星汐回响 — 原创二次元抽卡模拟器",
  description: "进入黎明星门，体验单抽与九连共鸣的原创二次元游戏级抽卡动画。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07101d",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
