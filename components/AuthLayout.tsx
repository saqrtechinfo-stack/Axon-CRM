"use client";

import { useUser, SignIn, SignUp } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation"; // Add this

interface AuthLayoutProps {
  children: React.ReactNode;
  dbUser: any;
}

export function AuthLayout({ children, dbUser }: AuthLayoutProps) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname(); // Get current URL

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-white text-lg font-medium">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  // 1. ALLOW SIGN-UP PATH
  if (!user && pathname === "/sign-up") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 px-4">
        <SignUp routing="hash" />
      </div>
    );
  }

  // 2. FORCE SIGN-IN FOR EVERYTHING ELSE
  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 px-4">
        <SignIn routing="hash" />
      </div>
    );
  }


  // 3. LOGGED IN BUT NO DB RECORD (STABILIZATION CHECK)
  if (user && !dbUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-6 text-center px-4">
          {/* A more professional sync loader */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Setting up your workspace...
            </h2>
            <p className="text-slate-400 text-sm max-w-[280px]">
              We're syncing your credentials and preparing your dashboard. This
              will only take a moment.
            </p>
          </div>

          {/* Optional: A hidden fallback that only shows the "Contact Admin" button 
            after 5-7 seconds if dbUser remains null */}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative bg-slate-50 min-h-screen text-slate-900">
      <Sidebar
        user={dbUser}
        companyName={dbUser?.company?.name || "No Company Linked"}
      />
      <main className="lg:pl-72 pt-20 lg:pt-0">
        <div className="max-w-7xl mx-auto ">{children}</div>
      </main>
    </div>
  );
}
