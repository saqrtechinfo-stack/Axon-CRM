"use client";

import { useUser, SignIn, SignUp } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react"; // Switched to a cleaner security icon

interface AuthLayoutProps {
  children: React.ReactNode;
  dbUser: any;
}

// 1. THE EMERALD & WHITE THEME
const clerkAppearance = {
  variables: {
    colorPrimary: "#059669", // Emerald 600
    colorBackground: "#ffffff",
    colorText: "#1e293b", // Slate 800 (Very readable)
    colorTextSecondary: "#64748b", // Slate 500
    borderRadius: "1rem",
    fontFamily: "inherit",
  },
  elements: {
    // CLEAN WHITE CARD
    card: "bg-white border border-slate-200 shadow-2xl p-8 rounded-[1rem] mb-[-5]",
    headerTitle:
      "text-2xl font-black tracking-tight text-slate-900 uppercase italic",
    headerSubtitle:
      "text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1",

    // INPUTS (Clean & Professional)
    formFieldInput:
      "h-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium text-sm px-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all",
    formFieldLabel:
      "text-[10px] font-black uppercase text-slate-600 tracking-widest mb-1 opacity-100",

    // THE EMERALD BUTTON
    formButtonPrimary:
      "h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-xs italic tracking-widest mt-2 shadow-md shadow-emerald-500/20 transition-all",

    // FOOTER
    footerActionLink: "text-emerald-600 hover:text-emerald-700 font-bold",
    dividerLine: "bg-slate-100",
    socialButtonsBlockButton:
      "rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50",
  },
};

export function AuthLayout({ children, dbUser }: AuthLayoutProps) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // 2. THE BACKGROUND WRAPPER (Subtle Dark Mode with Emerald Accents)
  const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-4">
        {/* BRANDING HEADER */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 transform -rotate-3">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            AXON<span className="text-emerald-500">CRM</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-1">
            Enterprise Client Relations
          </p>
        </div>

        {/* INJECTED CLERK COMPONENT */}
        {children}

        <p className="text-center mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 Al Saqr Technologies
        </p>
      </div>
    </div>
  );

  if (!user && pathname === "/sign-up") {
    return (
      <AuthWrapper>
        <SignUp routing="hash" appearance={clerkAppearance} />
      </AuthWrapper>
    );
  }

  if (!user) {
    return (
      <AuthWrapper>
        <SignIn routing="hash" appearance={clerkAppearance} />
      </AuthWrapper>
    );
  }

  // DB Sync Loader
  if (user && !dbUser) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950">
        <div className="h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-500 font-black italic uppercase text-xs tracking-widest">
          Syncing Identity...
        </p>
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
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
