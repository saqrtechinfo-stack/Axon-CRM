"use client";

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
  onStatusSelect,
}: {
  id: string;
  currentStatus: any;
  statusColumns: any[];
  onStatusSelect: (statusId: string) => void;
}) {
  // 1. Fallback if currentStatus is null (common for Enquiries)
  const statusLabel = currentStatus?.label || "ENQUIRY";
  const statusId = currentStatus?.id || "";

  const getStatusColor = (label: string) => {
    const status = statusColumns.find((s) => s.label === label);
    return status?.color || "#6b7280"; // Gray fallback
  };

  const activeColor = getStatusColor(statusLabel);

  return (
    <Select
      // Only set defaultValue if we actually have an ID
      defaultValue={statusId}
      onValueChange={(value) => onStatusSelect(value)}
    >
      <SelectTrigger
        className={cn(
          "w-[120px] h-7 text-[10px] font-black uppercase tracking-widest rounded-full border border-transparent transition-all shadow-none px-3 focus:ring-0",
        )}
        style={{
          backgroundColor: `${activeColor}20`,
          color: activeColor,
        }}
      >
        <SelectValue placeholder="Enquiry" />
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
