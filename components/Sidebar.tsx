// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Kanban, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

// This is a "Type" - it defines what a Route object looks like
interface Route {
  label: string;
  icon: React.ElementType;
  href: string;
}

const routes: Route[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Enquiries", icon: Users, href: "/enquiries" },
  { label: "Pipeline", icon: Kanban, href: "/pipeline" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 fixed inset-y-0 z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-blue-600">
          Axon<span className="text-slate-900">CRM</span>
        </h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
              pathname === route.href
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <route.icon
              className={cn(
                "h-5 w-5 mr-3",
                pathname === route.href
                  ? "text-blue-600"
                  : "text-slate-400 group-hover:text-slate-900",
              )}
            />
            {route.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
