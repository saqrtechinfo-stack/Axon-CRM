// components/kanban/KanbanColumn.tsx
"use client";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({
  status,
  leads,
}: {
  status: string;
  leads: any[];
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-72 shrink-0 bg-slate-50/50 rounded-xl border border-slate-200/60 h-full p-3">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          {status} <span className="ml-1 text-slate-300">({leads.length})</span>
        </h3>
      </div>

      <div ref={setNodeRef} className="flex-1 space-y-2 min-h-[500px]">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
