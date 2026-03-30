// components/kanban/KanbanCard.tsx
"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";

export function KanbanCard({ lead }: { lead: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: lead.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors shadow-sm bg-white border-slate-200">
        <p className="text-xs font-bold text-slate-900 truncate">{lead.name}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-[10px] text-slate-500 font-medium">
            ${lead.value.toLocaleString()}
          </p>
          <p className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
            {lead.company || "N/A"}
          </p>
        </div>
      </Card>
    </div>
  );
}
