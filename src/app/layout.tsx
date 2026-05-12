import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Article - 智能论文写作助手",
  description: "面向本科生的多 Agent 论文写作助手",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
