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
  Package2, // Added for Inventory
  Briefcase, // Added for Sales/Quotes
  UserCheck, // Better icon for Staff
  Layers, // Added for Categories
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Types stay the same as your provided code
interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  companyId: string;
  company?: { name: string };
}

interface NavContentProps {
  pathname: string;
  onClose: () => void;
  user: User;
  companyName: string;
}

// 1. Grouped Route Definition (Professional ERP Standard)
const navigationGroups = [
  {
    group: "Overview",
    routes: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_EXECUTIVE"],
      },
    ],
  },
  {
    group: "Sales & CRM",
    routes: [
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
        label: "Quotations",
        icon: Briefcase,
        href: "/quotations",
        roles: ["ADMIN", "MANAGER", "SALES_EXECUTIVE"],
      },
    ],
  },
  {
    group: "Inventory",
    routes: [
      {
        label: "Products",
        icon: Package2,
        href: "/inventory/products",
        roles: ["ADMIN", "MANAGER"],
      },
      {
        label: "Categories",
        icon: Layers,
        href: "/inventory/categories",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    group: "Management",
    routes: [
      {
        label: "Staff Management",
        icon: UserCheck,
        href: "/staff",
        roles: ["ADMIN", "MANAGER"],
      },
      {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
];

const systemRoutes = [
  { label: "Axon Core", icon: ShieldCheck, href: "/super-admin" },
  { label: "All Companies", icon: Building2, href: "/super-admin/companies" },
];

function NavContent({ pathname, onClose, user, companyName }: NavContentProps) {
  const { signOut } = useClerk();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const initial = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white border-r border-slate-800/50">
      {/* Brand Section */}
      <div className="px-7 py-8">
        <h1 className="text-2xl font-black tracking-tighter text-white italic italic uppercase">
          AXON<span className="ml-2 text-blue-500"> ERP</span>
        </h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
          Enterprise ERP
        </p>
      </div>

      <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        {navigationGroups.map((group) => {
          // Filter routes in this group by role
          const filteredRoutes = group.routes.filter((r) =>
            r.roles.includes(user?.role),
          );
          if (filteredRoutes.length === 0) return null;

          return (
            <div key={group.group} className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">
                {group.group}
              </p>
              {filteredRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={onClose}
                  className={cn(
                    "text-xs group flex p-3 w-full justify-start font-bold rounded-xl transition-all duration-200",
                    pathname === route.href
                      ? "text-white bg-blue-600 shadow-lg shadow-blue-600/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                  )}
                >
                  <route.icon
                    className={cn(
                      "h-4 w-4 mr-3 transition-colors",
                      pathname === route.href
                        ? "text-white"
                        : "text-slate-500 group-hover:text-blue-400",
                    )}
                  />
                  {route.label}
                </Link>
              ))}
            </div>
          );
        })}

        {/* System Management (Super Admin) */}
        {isSuperAdmin && (
          <div className="pt-4 border-t border-slate-800/50">
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-rose-500 mb-3">
              System Core
            </p>
            {systemRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={onClose}
                className={cn(
                  "text-xs group flex p-3 w-full justify-start font-bold rounded-xl transition-all",
                  pathname === route.href
                    ? "bg-rose-600/10 text-rose-500"
                    : "text-slate-500 hover:bg-white/5",
                )}
              >
                <route.icon className="h-4 w-4 mr-3" />
                {route.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Profile Section - Enhanced */}
      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-sm text-white shadow-inner">
            {initial}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black truncate text-white uppercase tracking-tight italic">
              {user?.name || "User"}
            </p>
            <p className="text-[9px] text-slate-500 truncate font-black tracking-widest uppercase">
              {companyName || "Al Saqr Tech"}
            </p>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="text-slate-500 hover:text-rose-500 p-2 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Sidebar export remains largely the same logic...
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
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-950 text-white border-slate-800 hover:bg-slate-900"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-72 bg-slate-950 border-none"
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
      <div className="hidden lg:flex h-full w-72 flex-col fixed inset-y-0 z-50 shadow-2xl">
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
