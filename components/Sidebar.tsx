"use client";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Settings,
  Building2,
  ShieldCheck,
  Menu,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  companyId: string;
  company?: {
    name: string;
  };
}

interface NavContentProps {
  pathname: string;
  onClose: () => void;
  user: User;
  companyName: string;
}

// 1. Define Standard Application Routes
const allRoutes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_EXECUTIVE"],
  },
  {
    label: "Enquiries",
    icon: Users,
    href: "/enquiries",
    roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE"],
  },
  {
    label: "Pipeline",
    icon: GitBranch,
    href: "/pipeline",
    roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE"],
  },
  {
    label: "Staff Management",
    icon: ShieldCheck,
    href: "/staff",
    roles: ["ADMIN"], // Client admins manage their own staff
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ["ADMIN", "SUPER_ADMIN"], // Only admins can access settings
  },
];

// 2. Define Super Admin Exclusive Routes (Axon Core)
const systemRoutes = [
  { label: "Axon Core", icon: ShieldCheck, href: "/super-admin" },
  { label: "All Companies", icon: Building2, href: "/super-admin/companies" },
];

function NavContent({ pathname, onClose, user, companyName }: NavContentProps) {
  const { signOut } = useClerk();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // Avatar initial logic
  const initial = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";

  // Filter regular routes based on user role
  const filteredRoutes = allRoutes.filter((route) =>
    route.roles.includes(user?.role),
  );

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
      <div className="px-6 py-2">
        <h1 className="text-xl font-black tracking-tighter text-blue-400">
          AXON CRM
        </h1>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {/* Render Standard Routes */}
        {filteredRoutes.map((route) => {
          const href = route.href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-bold rounded-lg transition-all",
                pathname === href
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:bg-white/5",
              )}
            >
              <route.icon
                className={cn(
                  "h-5 w-5 mr-3",
                  pathname === href ? "text-blue-400" : "text-slate-400",
                )}
              />
              {route.label}
            </Link>
          );
        })}

        {/* 3. Render System Management Section (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="pt-6">
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              System Management
            </p>
            {systemRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={onClose}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-bold rounded-lg transition-all",
                  pathname === route.href
                    ? "text-white bg-blue-600/20 border border-blue-500/30"
                    : "text-slate-400 hover:bg-white/5",
                )}
              >
                <route.icon
                  className={cn(
                    "h-5 w-5 mr-3",
                    pathname === route.href
                      ? "text-blue-400"
                      : "text-blue-500/50",
                  )}
                />
                {route.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white border-2 border-blue-400/30 uppercase">
            {initial}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate text-white">
              {user?.name || "Initializing..."}
            </p>
            <p className="text-[10px] text-slate-400 truncate font-semibold tracking-wide uppercase">
              {isSuperAdmin ? "System Owner" : companyName || "No Company"}
            </p>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  user,
  companyName,
}: {
  user: User;
  companyName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-white shadow-md border-slate-200"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-72 bg-slate-900 border-none"
          >
            <NavContent
              pathname={pathname}
              onClose={() => setOpen(false)}
              user={user}
              companyName={companyName}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <NavContent
          pathname={pathname}
          onClose={() => setOpen(false)}
          user={user}
          companyName={companyName}
        />
      </div>
    </>
  );
}
