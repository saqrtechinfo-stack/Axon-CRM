"use client";

import { updateDesignationAuthority } from "@/actions/designation";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, ShieldAlert, Info, Zap } from "lucide-react";
import { toast } from "sonner";

export default function CompanySetting({
  designations = [],
}: {
  designations: any[];
}) {
  return (
    <div className="max-w-4xl space-y-8">
      {/* HEADER SECTION */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
            Hierarchy Configuration
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
            Enable <b>“Authorized to Manage”</b> for roles like Manager,
            Director, or Team Lead. Only employees with these roles will be
            available in the
            <b>“Reporting To”</b> dropdown when assigning a manager during
            onboarding.
          </p>
        </div>
      </div>

      {/* DESIGNATION GRID */}
      <div className="grid gap-3">
        {designations.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              No Designations Found
            </p>
          </div>
        ) : (
          designations.map((des) => (
            <div
              key={des.id}
              className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${
                des.isManagement
                  ? "bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50"
                  : "bg-slate-50/50 border-slate-100 opacity-80"
              }`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                    des.isManagement
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {des.isManagement ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : (
                    <ShieldAlert className="h-6 w-6" />
                  )}
                </div>

                <div>
                  <p className="text-base font-black text-slate-900 tracking-tight">
                    {des.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-tighter ${
                        des.isManagement
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {des.isManagement
                        ? "Managerial Access"
                        : "Standard Personnel"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Authorize
                </span>
                <Switch
                  checked={des.isManagement}
                  onCheckedChange={async (checked) => {
                    // Optimized feedback: toast loading state
                    const promise = updateDesignationAuthority(des.id, checked);
                    toast.promise(promise, {
                      loading: "Updating authority...",
                      success: () => `${des.name} authority updated!`,
                      error: "Check database connection.",
                    });
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-400">
        <Zap className="h-3 w-3" />
        <p className="text-[9px] font-bold uppercase tracking-[0.3em]">
          Changes apply instantly to Axon ERP
        </p>
      </div>
    </div>
  );
}
