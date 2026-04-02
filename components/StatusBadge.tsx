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

export function StatusBadge({
  id,
  currentStatus,
  statusColumns,
}: {
  id: string;
  currentStatus: any;
  statusColumns: any[];
}) {
  const handleStatusChange = async (value: string) => {
    await updateLeadStatus(id, value);
  };

  const getStatusColor = (statusLabel: string) => {
    const status = statusColumns.find((s) => s.label === statusLabel);
    return status?.color || "#6b7280"; // Default gray if not found
  };

  return (
    <Select defaultValue={currentStatus.id} onValueChange={handleStatusChange}>
      <SelectTrigger
        className={cn(
          "w-[120px] h-7 text-[10px] font-black uppercase tracking-widest rounded-full border border-transparent transition-all shadow-none px-3 focus:ring-0",
        )}
        style={{
          backgroundColor: `${getStatusColor(currentStatus.label)}20`, // Add transparency
          color: getStatusColor(currentStatus.label),
        }}
      >
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {statusColumns.map((status) => (
          <SelectItem
            key={status.id}
            value={status.id}
            className="text-[11px] font-bold uppercase"
          >
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
