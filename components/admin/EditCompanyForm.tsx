"use client";

import { updateCompanyProfile } from "@/actions/super-admin";
import { useState } from "react";

import { toast } from "sonner";

export function EditCompanyForm({
  company,
  onCancel,
}: {
  company: any;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    company.subscriptionEnd
      ? new Date(company.subscriptionEnd).toISOString().split("T")[0]
      : "",
  );
const addDays = (days: number) => {
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + days);
  setSelectedDate(newDate.toISOString().split("T")[0]);
};
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await updateCompanyProfile(company.id, formData);

    if (result.success) {
      toast.success("Tenant Sync Successful");
      onCancel(); // Return to view mode
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 animate-in fade-in duration-300"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
            Company Identity
          </label>
          <input
            name="name"
            defaultValue={company.name}
            className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-red-600 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Plan
            </label>
            <select
              name="plan"
              defaultValue={company.plan}
              className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-sm outline-none"
            >
              <option value="BASIC font-bold">BASIC</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              ID Prefix
            </label>
            <input
              name="empIdPrefix"
              defaultValue={company.empIdPrefix}
              className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-sm outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">
            Subscription Expiry
          </label>

          {/* Quick Presets */}
          <div className="flex gap-2 mb-2">
            {[
              { label: "+1M", days: 30 },
              { label: "+3M", days: 90 },
              { label: "+6M", days: 180 },
              { label: "+1Y", days: 365 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => addDays(preset.days)}
                className="text-[10px] bg-slate-800 hover:bg-red-600 border border-slate-700 px-3 py-1 rounded-lg font-bold transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* The Manual Picker */}
          <input
            type="date"
            name="subscriptionEnd"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-sm outline-none text-white [color-scheme:dark] focus:border-red-600"
          />
        </div>

        <div className="space-y-1 pt-4 border-t border-slate-900">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
            Admin Contact Details
          </label>
          <input
            name="contactEmail"
            placeholder="Email Address"
            defaultValue={company.contactEmail}
            className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-sm mb-2 outline-none"
          />
          <input
            name="contactPhone"
            placeholder="UAE Phone Number"
            defaultValue={company.contactPhone}
            className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-black uppercase text-xs transition-all rounded-2xl shadow-lg shadow-red-600/20"
        >
          {loading ? "Synchronizing..." : "Commit Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-4 border border-slate-800 text-slate-400 font-bold uppercase text-[10px] rounded-2xl hover:bg-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
