import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
      <body
        className={`${inter.className} min-h-screen bg-forge-bg text-forge-text-primary`}
      >
        {/* Starfield + mesh gradient backgrounds */}
        <div className="starfield" aria-hidden="true" />
        <div className="mesh-gradient" aria-hidden="true" />

        {/* App shell */}
        <div className="relative z-10 flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area — offset for sidebar on desktop */}
          <main className="flex-1 md:ml-14 pb-16 md:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
