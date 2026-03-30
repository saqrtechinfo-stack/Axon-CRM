// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GitBranch, Menu,Settings } from "lucide-react";
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

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
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
            onClick={() => setOpen(false)} // Close menu on click (mobile)
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
    </div>
  );

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
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <NavContent />
      </div>
    </>
  );
}
