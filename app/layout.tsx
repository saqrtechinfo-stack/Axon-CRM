// app/layout.tsx
import { ClerkProvider, SignInButton, Show } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ALWAYS put ClerkProvider at the absolute top
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Show when="signed-out">
            {/* This is what they see if they are NOT logged in */}
            <div className="h-screen w-full flex items-center justify-center bg-slate-900 px-4">
              <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-sm w-full space-y-6">
                <h1 className="text-3xl font-black tracking-tighter text-slate-900">
                  NEXUS CRM
                </h1>
                <SignInButton mode="modal">
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
                    Access Workspace
                  </button>
                </SignInButton>
              </div>
            </div>
          </Show>

          <Show when="signed-in">
            {/* This is what they see only AFTER they log in */}
            <div className="h-full relative bg-slate-50 min-h-screen">
              <Sidebar />
              <main className="lg:pl-72 pt-20 lg:pt-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
              </main>
            </div>
          </Show>
        </body>
      </html>
    </ClerkProvider>
  );
}
