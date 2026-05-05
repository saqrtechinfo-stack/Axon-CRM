// components/kanban/KanbanColumn.tsx
"use client";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({ status, leads }: { status: any; leads: any[] }) {
  const { setNodeRef } = useDroppable({ id: status.id });

  return (
    <div
      className="flex flex-col w-80 shrink-0 rounded-2xl border h-full p-3 transition-all duration-200"
      style={{
        borderColor: `${status.color}25`,
        backgroundColor: `${status.color}05`,
      }}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter text-white shadow-sm"
          style={{ backgroundColor: status.color }}
        >
          <span>{status.label}</span>
          <span className="opacity-70 font-medium">({leads.length})</span>
        </div>

        {/* Visual indicator for terminal stages (Won/Lost) */}
        {status.isClosing && (
          <div className="text-[8px] font-black uppercase text-slate-400 px-2 py-1 bg-slate-100 rounded-md">
            {status.isWon ? "Success Stage" : "Loss Stage"}
          </div>
        )}
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-[500px] rounded-xl p-1 transition-colors"
      >
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}

        {leads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-bold uppercase text-slate-300">
            No Leads Here
          </div>
        )}
      </div>
    </div>
  );
}
