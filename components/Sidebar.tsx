// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Enquiries", icon: Users, href: "/enquiries" },
  { label: "Pipeline", icon: GitBranch, href: "/pipeline" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

function NavContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-6 py-2">
        <h1 className="text-xl font-black tracking-tighter text-blue-400">
          AXON CRM
        </h1>
      </div>
      <div className="flex-1 px-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={onClose} // Close menu on click (mobile)
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-bold cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all",
              pathname === route.href
                ? "text-white bg-white/10"
                : "text-slate-400",
            )}
          >
            <route.icon
              className={cn(
                "h-5 w-5 mr-3",
                pathname === route.href ? "text-blue-400" : "text-slate-400",
              )}
            />
            {route.label}
          </Link>
        ))}
      </div>
      {/* BOTTOM SECTION: User Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white border-2 border-slate-700">
            R
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">Rithik</p>
            <p className="text-[10px] text-slate-500 truncate font-medium">
              Saqr Tech Admin
            </p>
          </div>
          <button className="text-slate-500 hover:text-rose-400 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MOBILE NAVIGATION (Hamburger) */}
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
            <NavContent pathname={pathname} onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <NavContent pathname={pathname} onClose={() => setOpen(false)} />
      </div>
    </>
  );
}
