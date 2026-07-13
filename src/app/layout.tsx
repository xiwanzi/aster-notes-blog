import type { Metadata, Viewport } from "next";
import "misans/lib/Normal/MiSans-Regular.min.css";
import "misans/lib/Normal/MiSans-Bold.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aster Notes — 设计、代码与生活切片",
  description: "一座持续生长的个人数字花园，记录设计、代码与生活中的灵感。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3f0" },
    { media: "(prefers-color-scheme: dark)", color: "#17171d" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var r=document.documentElement,m=localStorage.getItem('aster-theme')||'auto',g=localStorage.getItem('aster-blur')!=='false',t='dark',v=m==='auto'?t:m;r.dataset.theme=v;r.dataset.themeMode=m;r.dataset.wallpaperTone=t;r.classList.add(g?'glass-frosted':'glass-solid');if(!g)r.classList.add('no-blur')}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.dataset.wallpaperTone='dark'}})();` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
