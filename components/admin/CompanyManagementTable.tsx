"use client";

import { useState } from "react";
import { format, differenceInDays, isPast } from "date-fns";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toggleCompanyStatus } from "@/actions/super-admin";
import { EditCompanyForm } from "./EditCompanyForm";

export function CompanyManagementTable({
  initialData,
}: {
  initialData: any[];
}) {
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const closeDrawer = () => {
    setSelectedCompany(null);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
      <table className="w-full text-left">
        <thead className="bg-slate-800/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
          <tr>
            <th className="p-5">Company Name</th>
            <th className="p-5">License Plan</th>
            <th className="p-5">Metrics</th>
            <th className="p-5">Expiry Status</th>
            <th className="p-5 text-right">Kill Switch</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {initialData.map((co) => {
            const expiryDate = co.subscriptionEnd || co.trialEndsAt;
            const daysLeft = expiryDate
              ? differenceInDays(new Date(expiryDate), new Date())
              : null;
            const expired = expiryDate ? isPast(new Date(expiryDate)) : false;

            return (
              <tr
                key={co.id}
                onClick={() => setSelectedCompany(co)}
                className="hover:bg-slate-800/40 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-red-600"
              >
                <td className="p-5">
                  <div className="font-bold text-slate-200 group-hover:text-white">
                    {co.name}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    ID: {co.id.slice(0, 8)}...
                  </div>
                </td>
                <td className="p-5">
                  <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-[10px] font-black text-slate-400">
                    {co.plan}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex gap-4 text-[11px] text-slate-500 font-bold uppercase">
                    <span>{co._count.users} Users</span>
                    <span>{co._count.leads} Leads</span>
                  </div>
                </td>
                <td className="p-5">
                  {expired ? (
                    <span className="text-red-500 text-[10px] font-black uppercase flex items-center gap-1">
                      <XCircle size={12} /> Expired
                    </span>
                  ) : daysLeft !== null ? (
                    <span
                      className={`text-[10px] font-black uppercase ${daysLeft < 5 ? "text-orange-500" : "text-emerald-500"}`}
                    >
                      {daysLeft} Days Left
                    </span>
                  ) : (
                    <span className="text-slate-600 text-[10px] uppercase">
                      Manual Control
                    </span>
                  )}
                </td>
                <td className="p-5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompanyStatus(co.id, co.status);
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                      co.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-red-600 hover:text-white"
                        : "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    {co.status === "ACTIVE" ? "Online" : "Disabled"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* --- SIDE DRAWER --- */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/5 backdrop-blur-sm transition-opacity"
            onClick={closeDrawer}
          />
          <div className="relative w-full max-w-md bg-slate-950 border-l border-slate-800 h-full p-10 shadow-2xl animate-in slide-in-from-right duration-300">
            <button
              onClick={closeDrawer}
              className="absolute top-6 right-6 text-slate-600 hover:text-white transition-colors uppercase text-[10px] font-bold"
            >
              Close ✕
            </button>

            {isEditing ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-red-500">
                  Edit Tenant
                </h2>
                <EditCompanyForm
                  company={selectedCompany}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <div className="space-y-10">
                <header className="space-y-2">
                  <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                    Tenant Profile
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter text-white">
                    {selectedCompany.name}
                  </h2>
                  <div className="flex gap-2">
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                      {selectedCompany.status}
                    </span>
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                      {selectedCompany.plan}
                    </span>
                  </div>
                </header>

                <div className="space-y-8">
                  <DrawerSection title="Subscription Details">
                    <DrawerDetail
                      icon={<Calendar size={14} />}
                      label="End Date"
                      value={
                        selectedCompany.subscriptionEnd
                          ? format(
                              new Date(selectedCompany.subscriptionEnd),
                              "PPP",
                            )
                          : "No Expiry"
                      }
                    />
                    <DrawerDetail
                      icon={<ShieldAlert size={14} />}
                      label="Prefix"
                      value={selectedCompany.empIdPrefix}
                    />
                  </DrawerSection>

                  <DrawerSection title="Administrative Contact">
                    <DrawerDetail
                      icon={<Mail size={14} />}
                      label="Email"
                      value={selectedCompany.contactEmail || "Not Set"}
                    />
                    <DrawerDetail
                      icon={<Phone size={14} />}
                      label="Phone"
                      value={selectedCompany.contactPhone || "Not Set"}
                    />
                  </DrawerSection>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-4 bg-white text-black font-black uppercase text-xs hover:bg-red-600 hover:text-white transition-all rounded-2xl"
                >
                  Edit Information
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper components for a cleaner Drawer
function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-900 pb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DrawerDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <div className="flex items-center gap-2 text-slate-500">
        {icon} <span>{label}</span>
      </div>
      <span className="font-bold text-slate-200">{value}</span>
    </div>
  );
}
