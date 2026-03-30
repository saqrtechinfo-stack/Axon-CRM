// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus CRM | Enquiry Management",
  description: "Modern CRM for high-growth teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-[#F9FAFB]">
          <Sidebar />
          <main className="flex-1 ml-64 overflow-y-auto">
            {/* Header / Topbar */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  System Overview
                </h2>
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  RK
                </div>
              </div>
            </header>

            {/* Page Content */}
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
