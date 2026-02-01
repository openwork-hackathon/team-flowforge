import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowForge — Agent Workflow Builder",
  description:
    "Design, deploy, and monitor multi-agent task pipelines on Openwork.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-forge-950 text-slate-200`}>
        {children}
      </body>
    </html>
  );
}
