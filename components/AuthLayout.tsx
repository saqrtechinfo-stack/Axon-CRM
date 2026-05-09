"use client";

import { useUser, SignIn, SignUp } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

interface AuthLayoutProps {
  children: React.ReactNode;
  dbUser: any;
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#059669",
    colorBackground: "#ffffff",
    colorText: "#1e293b",
    colorTextSecondary: "#64748b",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
  },
  elements: {
    // Nuke the card — Clerk floats inside our panel instead
    card: "shadow-none border-0 p-0 bg-transparent w-full",
    rootBox: "w-full",
    // Hide Clerk's own header — we render our own above
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    // Inputs
    formFieldInput:
      "h-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm px-4 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all",
    formFieldLabel:
      "text-[10px] font-bold uppercase tracking-widest text-slate-600",
    // Primary button
    formButtonPrimary:
      "h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 transition-all",
    // Social / SSO buttons
    socialButtonsBlockButton:
      "rounded-xl border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 transition-all",
    footerActionLink: "text-emerald-600 hover:text-emerald-700 font-semibold",
    dividerLine: "bg-slate-100",
    dividerText: "text-slate-400 text-xs",
  },
};

export function AuthLayout({ children, dbUser }: AuthLayoutProps) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/Axon_CRM_Logo.png"
            alt="Axon CRM"
            className="w-32 object-contain animate-pulse"
          />
          <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  // ── AUTH WRAPPER ──────────────────────────────────────────────────────────
  const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* ── LEFT PANEL — dark, animations, hidden on mobile ── */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 bg-slate-900 relative overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-500/20 blur-[140px] rounded-full animate-[drift_14s_ease-in-out_infinite_alternate]" />
        <div className="absolute bottom-0 -right-24 w-80 h-80 bg-emerald-400/10 blur-[100px] rounded-full animate-[drift_10s_ease-in-out_3s_infinite_alternate]" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-teal-400/10 blur-[80px] rounded-full animate-[drift_8s_ease-in-out_6s_infinite_alternate]" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(5,150,105,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(5,150,105,0.08) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
          }}
        />

        {/* Brand */}
        <div className="relative z-10">
          <img
            src="/Axon_CRM_Logo.png"
            alt="Axon CRM"
            className="h-12 object-contain object-left bg-white/90 rounded-xl"
            // brightness-0 invert = forces the dark logo to render white
          />
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-2">
            Enterprise Client Relations
          </p>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-6 h-px bg-emerald-500" />
            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Al Saqr Technologies
            </span>
          </div>
          <h1 className="text-white font-black text-[clamp(36px,4vw,56px)] leading-[1.06] tracking-tight mb-5">
            Manage every
            <br />
            client with
            <br />
            <span className="text-emerald-400 italic font-semibold">
              precision.
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-8">
            From first enquiry to closed deal — every touchpoint in one
            intelligent workspace.
          </p>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              ["360°", "Client View"],
              ["99%", "Uptime SLA"],
              ["2×", "Faster Closings"],
            ].map(([num, label]) => (
              <div key={label}>
                <div className="text-white font-black text-2xl tracking-tight">
                  {num}
                </div>
                <div className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wider">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-slate-300 text-sm italic leading-relaxed mb-3">
            A smarter CRM experience built for ambitious teams. Track leads,
            strengthen relationships, and accelerate business growth with one
            unified platform.
          </p>
  
        </div>
      </div>

      {/* ── RIGHT PANEL — white, always visible, full-width on mobile ── */}
      <div className="w-full lg:w-[460px] bg-white flex flex-col min-h-screen lg:min-h-0 lg:h-screen overflow-y-auto">
        {/* Mobile-only top bar */}
        <div className="lg:hidden bg-white-900 px-6 pt-10  relative overflow-hidden">
          {/* Mobile orb accent */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <img
              src="/Axon_CRM_Logo.png"
              alt="Axon CRM"
              className="h-14 object-contain  mb-3"
            />
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
              Enterprise Client Relations
            </p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-10 py-8 lg:py-0">
          <div className="w-full max-w-sm mx-auto lg:max-w-none">
            {/* Header — visible on desktop only (mobile has top bar) */}
            <div className="hidden lg:block mb-6">
              <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-1">
                Welcome back
              </p>
              <h2 className="text-slate-900 font-black text-2xl tracking-tight">
                Sign in to Axon CRM
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Enter your credentials to continue
              </p>
            </div>

            {/* Mobile header inside white area */}
            <div className="lg:hidden mb-6 text-center">
              <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-1">
                Welcome back
              </p>
              <h2 className="text-slate-900 font-black text-2xl tracking-tight">
                Sign in to Axon CRM
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Enter your credentials to continue
              </p>
            </div>

            {/* Clerk component */}
            {children}

            {/* <p className="text-center text-slate-400 text-[10px] mt-8">
              © 2026 Al Saqr Technologies
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );

  // ── SIGN-UP ───────────────────────────────────────────────────────────────
  if (!user && pathname === "/sign-up") {
    return (
      <AuthWrapper>
        <SignUp routing="hash" appearance={clerkAppearance} />
      </AuthWrapper>
    );
  }

  // ── SIGN-IN ───────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <AuthWrapper>
        <SignIn routing="hash" appearance={clerkAppearance} />
      </AuthWrapper>
    );
  }

  // ── DB SYNC LOADER ────────────────────────────────────────────────────────
  if (user && !dbUser) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 gap-4">
        <img
          src="/Axon_CRM_Logo.png"
          alt="Axon CRM"
          className="w-28 object-contain brightness-0 invert"
        />
        <div className="h-1 w-28 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-emerald-500 rounded-full animate-[loading_1s_ease-in-out_infinite]" />
        </div>
        <p className="text-emerald-500 font-bold italic uppercase text-xs tracking-widest">
          Syncing Identity...
        </p>
      </div>
    );
  }

  // ── AUTHENTICATED LAYOUT ──────────────────────────────────────────────────
  return (
    <div className="h-full relative bg-slate-50 min-h-screen text-slate-900">
      <Sidebar
        user={dbUser}
        companyName={dbUser?.company?.name || "No Company Linked"}
      />
      <div className="fixed top-4 right-4 z-50">
        <NotificationBell
          onLeadClick={(lead) => {
            router.push(`/enquiries?openLead=${lead.id}`);
          }}
        />
      </div>
      <main className="lg:pl-72 pt-20 lg:pt-0">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
