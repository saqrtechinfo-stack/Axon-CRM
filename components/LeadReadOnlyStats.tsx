"use client";

import {
  Mail,
  Phone,
  User,
  BriefcaseBusiness,
  CircleDollarSignIcon,
  LucideDatabase,
  Notebook,
} from "lucide-react";

export function LeadReadOnlyStats({ lead }: { lead: any }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Primary Info Cards */}
      <div className="grid grid-cols-1 gap-2">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <User className="h-3 w-3" />
            <p className="text-[10px] font-black uppercase tracking-tight">
              Contact Person
            </p>
          </div>
          <p className="text-sm font-bold text-slate-700 truncate">
            {lead.name}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-purple-600">
            <BriefcaseBusiness className="h-3 w-3" />
            <p className="text-[10px] font-black uppercase tracking-tight">
              Designation
            </p>
          </div>
          <p className="text-sm font-bold text-slate-700 truncate">
            {lead.designation}
          </p>
        </div>

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

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-cyan-600">
            <LucideDatabase className="h-3 w-3" />
            <p className="text-[10px] font-black uppercase tracking-tight">
              Source
            </p>
          </div>
          <p className="text-sm font-bold text-slate-700 truncate">
            {lead.source||"Not provided"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-yellow-600 ">
            <Notebook className="h-3 w-3" />
            <p className="text-[10px] font-black uppercase tracking-tight">
              Notes
            </p>
          </div>
          <p className="text-sm italic font-small text-slate-700 truncate">
            {lead.notes||"Not provided"} 
          </p>
        </div>
      </div>

      {/* Secondary Details Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
            <CircleDollarSignIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">
              Expected Value
            </p>
            <p className="text-sm font-bold text-slate-700">
              AED {lead.value?.toLocaleString() || "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
