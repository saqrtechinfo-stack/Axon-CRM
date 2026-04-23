import Link from "next/link";
import { ShieldAlert, Phone, Mail } from "lucide-react";

export default function AccountSuspended() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
          <ShieldAlert size={40} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            Access Restricted
          </h1>
          <p className="text-slate-400 text-sm">
            Your workspace subscription has expired or has been deactivated by
            the system administrator.
          </p>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-left space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Contact Saqr Tech Support
          </p>
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-red-400" />
            <span>+971 581027916</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-red-400" />
            <span>support@saqrtech.ae</span>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <Link
            href="mailto:support@saqrtech.ae"
            className="block w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold uppercase transition-all tracking-tighter"
          >
            Request Activation
          </Link>
          <p className="text-[10px] text-slate-600 uppercase">
            AXON CRM - Powered by Al Saqr Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
