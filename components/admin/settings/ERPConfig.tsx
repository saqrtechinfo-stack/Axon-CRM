import { updateCompanyERPConfig } from "@/actions/company-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function ERPConfig({ companyId }: { companyId: string }) {

// Inside your Settings component
const [prefix, setPrefix] = useState("TCS");
const [startNum, setStartNum] = useState(1001);

const handleSave = async () => {
  await updateCompanyERPConfig(companyId, { prefix, nextNumber: startNum });
  toast.success("ERP Sequence Updated");
};

// UI matches your Red/Black/White theme
<div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
    Staff ID Sequence
  </h3>
  <div className="grid grid-cols-2 gap-4">
    <Input
      value={prefix}
      onChange={(e) => setPrefix(e.target.value)}
      placeholder="Prefix (e.g. TCS)"
      className="rounded-xl border-none shadow-inner"
    />
    <Input
      type="number"
      value={startNum}
      onChange={(e) => setStartNum(parseInt(e.target.value))}
      className="rounded-xl border-none shadow-inner"
    />
  </div>
  <Button
    onClick={handleSave}
    className="w-full bg-slate-900 text-white rounded-xl font-black italic uppercase text-[10px] tracking-widest"
  >
    Update Sequence
  </Button>
</div>;
}