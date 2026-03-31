"use client";
import { useClerk } from "@clerk/nextjs";
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

function NavContent({ pathname, onClose, user, companyName }: any) {
  const { signOut } = useClerk();

  // Avatar initial logic: Try database name first, then Clerk email, then 'U'
  const initial = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
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
            onClick={onClose}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-bold rounded-lg transition-all",
              pathname === route.href
                ? "text-white bg-white/10"
                : "text-slate-400 hover:bg-white/5",
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

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white border-2 border-blue-400/30 uppercase">
            {initial}
          </div>
          <div className="flex-1 overflow-hidden">
            {/* Database name or fallback */}
            <p className="text-xs font-bold truncate text-white">
              {user?.name || "Initializing..."}
            </p>
            {/* Company Name from layout.tsx props */}
            <p className="text-[10px] text-slate-400 truncate font-semibold tracking-wide uppercase">
              {companyName || "No Company"}
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
  user: any;
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
