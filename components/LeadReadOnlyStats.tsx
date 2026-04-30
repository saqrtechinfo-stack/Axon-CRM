"use client";

import {
  Mail,
  Phone,
  Briefcase,
  CreditCard,
  User,
  ShieldCheck,
} from "lucide-react";

export function LeadReadOnlyStats({ lead }: { lead: any }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Primary Info Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-blue-600">
            <Mail className="h-3 w-3" />
            <p className="text-[10px] font-black uppercase tracking-tight">
              Email Address
            </p>
          </div>
          <p className="text-sm font-bold text-slate-700 truncate">
            {lead.email}
          </p>
        </div>

        <div
          className={`bg-white p-4 rounded-2xl border shadow-sm transition-colors ${
            !lead.phone
              ? "border-rose-200 bg-rose-50/30"
              : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div
            className={`flex items-center gap-2 mb-2 ${!lead.phone ? "text-rose-600" : "text-emerald-600"}`}
          >
            <Phone className="h-3 w-3" />
            <p className="text-[10px] font-black uppercase tracking-tight">
              Phone Number
            </p>
          </div>
          <p
            className={`text-sm font-bold ${!lead.phone ? "text-rose-500 italic" : "text-slate-700"}`}
          >
            {lead.phone || "Missing Number"}
          </p>
        </div>
      </div>

      {/* Secondary Details Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <div className="flex justify-between items-center pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">
                Designation
              </p>
              <p className="text-sm font-bold text-slate-700">
                {lead.designation || "Not Specified"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Expected Value
            </p>
            <p className="text-lg font-black text-slate-900 tracking-tighter">
              AED {lead.value?.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">
              Company / Organization
            </p>
            <p className="text-sm font-bold text-slate-700">
              {lead.clientCompany || "Private Individual"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
