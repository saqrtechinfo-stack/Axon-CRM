"use client";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";

function getContrastColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 180 ? "#111827" : "#ffffff";
}

export function KanbanColumn({ status, leads }: { status: any; leads: any[] }) {
  const { setNodeRef } = useDroppable({ id: status.id });

  const textColor = getContrastColor(status.color);

  return (
    <div
      className="flex flex-col w-80 shrink-0 rounded-2xl border h-full p-3 transition-all duration-200"
      style={{
        // borderColor: `${status.color}55`,
        borderColor:"grey-20",
        backgroundColor: `${status.color}10`, // consistent soft background
      }}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm"
          style={{
            backgroundColor: status.color,
            color: textColor,
          }}
        >
          <span>{status.label}</span>
          <span className="opacity-70 font-medium">({leads.length})</span>
        </div>

        {status.isClosing && (
          <div className="text-[8px] font-black uppercase text-slate-500 px-2 py-1 bg-slate-100 rounded-md">
            {status.isWon ? "Success Stage" : "Loss Stage"}
          </div>
        )}
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-[500px] rounded-xl p-1"
      >
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}

        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-00 rounded-2xl text-[10px] font-bold uppercase text-slate-300">
            No Leads Here
          </div>
        )}
      </div>
    </div>
  );
}
