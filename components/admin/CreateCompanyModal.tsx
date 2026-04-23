"use client";

import { useState } from "react";
import { registerNewTenant } from "@/actions/super-admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Building2,
  Mail,
  User,
  Shield,
  Phone,
  Calendar,
  Globe,
  MapPin,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

export function CreateCompanyModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const setPreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await registerNewTenant(new FormData(e.currentTarget));
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      setSelectedDate("");
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl font-black transition-all active:scale-95 text-xs uppercase tracking-tighter shadow-xl shadow-red-600/20">
          <Plus size={16} /> Deploy Tenant
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px] bg-slate-950 border-slate-800 text-white p-8 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">
            New Deployment
          </DialogTitle>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            Workspace Initialization Engine
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* Identity Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Building2 size={12} /> Company Name
                </label>
                <input
                  required
                  name="companyName"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm outline-none focus:border-red-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Globe size={12} /> Custom Domain
                </label>
                <input
                  name="domain"
                  placeholder="client.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                  <ImageIcon size={12} /> Logo URL
                </label>
                <input
                  name="logo"
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm outline-none focus:border-red-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                  <MapPin size={12} /> Business Address
                </label>
                <input
                  name="address"
                  placeholder="Ajman, UAE"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm outline-none focus:border-red-600"
                />
              </div>
            </div>
          </div>

          {/* Licensing Section */}
          <div className="space-y-3 p-5 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-2">
                <Calendar size={12} /> Subscription Management
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreset(14)}
                  className="text-[8px] bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:bg-red-600"
                >
                  Trial
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(30)}
                  className="text-[8px] bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:bg-red-600"
                >
                  1 Mo
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                name="plan"
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none font-bold"
              >
                <option value="BASIC">BASIC PLAN</option>
                <option value="PRO">PRO BUSINESS</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
              <input
                type="date"
                name="subscriptionEnd"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Admin Contact Section */}
          <div className="space-y-4 pt-4 border-t border-slate-900">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                <User size={12} /> Primary Administrator
              </label>
              <input
                required
                name="adminName"
                placeholder="Full Name"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Mail size={12} /> Login Email
                </label>
                <input
                  required
                  type="email"
                  name="adminEmail"
                  placeholder="admin@client.ae"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Phone size={12} /> Contact Phone
                </label>
                <input
                  required
                  name="contactPhone"
                  placeholder="+971"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-tighter transition-all shadow-xl shadow-red-600/20"
          >
            {loading ? "Configuring Tenant..." : "Commit Deployment"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
