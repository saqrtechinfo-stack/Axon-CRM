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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="h-full relative">
          <Sidebar />
          {/* lg:pl-72: Adds padding on large screens for the fixed sidebar.
              pt-20: Adds space at the top on mobile so content doesn't sit under the hamburger.
          */}
          <main className="lg:pl-72 pt-20 lg:pt-0">
            <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}