"use client";

import Image from "next/image";
import { Mail, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusToggle } from "./StatusToggle";
import { EditModal } from "@/components/admin/management/EditModal";
import { StaffDetailsDrawer } from "@/components/admin/management/StaffDetailsDrawer";

export function StaffCard({ emp, departments, designations, managers }: any) {
  return (
    <Sheet>
      {/* 1. Wrap the entire card in the Trigger */}
      <SheetTrigger asChild>
        <div
          className={`group relative p-6 rounded-3xl border transition-all duration-500 cursor-pointer h-full ${
            emp.status === "INACTIVE"
              ? "bg-slate-100/50 border-slate-200 grayscale opacity-60"
              : "bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10"
          }`}
        >
          {/* 2. Important: STOP PROPAGATION on the dropdown menu so it doesn't open the drawer */}
          <div
            className="absolute top-4 right-4 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors outline-none border-none bg-transparent">
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-2xl border-slate-100 p-2 shadow-xl w-48 z-50"
              >
                {/* Your Menu Items */}
                <StatusToggle id={emp.id} status={emp.status} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Profile Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
              {emp.imageUrl ? (
                <Image
                  alt="profile"
                  src={emp.imageUrl}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-300 font-black italic text-sm uppercase">
                  {emp.firstName[0]}
                  {emp.lastName[0]}
                </div>
              )}
            </div>
            <Badge
              className={`border-none text-[9px] font-black px-2 uppercase tracking-widest ${emp.status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-slate-200 text-slate-500"}`}
            >
              {emp.status}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-1 mb-6">
            <p className="text-[10px] font-black text-[#FF9E7D] uppercase tracking-widest">
              {emp.employeeId}
            </p>
            <h3 className="text-lg font-black italic tracking-tighter uppercase text-slate-900 leading-tight">
              {emp.firstName} {emp.lastName}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {emp.designation?.name} • {emp.department?.name}
            </p>
          </div>

          {/* Footer */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 italic">
              <Mail className="h-3 w-3 text-slate-300" /> {emp.email}
            </div>
          </div>
        </div>
      </SheetTrigger>

      {/* 3. The Drawer Content (Sits outside the trigger) */}
      <StaffDetailsDrawer
        employee={emp}
        departments={departments}
        designations={designations}
        managers={managers}
      />
    </Sheet>
  );
}