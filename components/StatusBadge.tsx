// components/StatusBadge.tsx
"use client";

import { updateLeadStatus } from "@/actions/lead-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

export function StatusBadge({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const handleStatusChange = async (value: string) => {
    await updateLeadStatus(id, value);
  };

  return (
    <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
      {/* Change w-[130px] to a fixed width and add w-fit to the container if needed */}
      <SelectTrigger
        className={cn(
          "w-[120px] h-7 text-[10px] font-black uppercase tracking-widest rounded-full border border-transparent transition-all shadow-none px-3 focus:ring-0",
          currentStatus === "WON" &&
            "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
          currentStatus === "LOST" &&
            "bg-rose-50 text-rose-700 hover:bg-rose-100",
          currentStatus === "NEW" &&
            "bg-blue-50 text-blue-700 hover:bg-blue-100",
          currentStatus === "CONTACTED" &&
            "bg-amber-50 text-amber-700 hover:bg-amber-100",
          currentStatus === "PROPOSAL" &&
            "bg-purple-50 text-purple-700 hover:bg-purple-100",
        )}
      >
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {statuses.map((s) => (
          <SelectItem
            key={s}
            value={s}
            className="text-[11px] font-bold uppercase"
          >
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
