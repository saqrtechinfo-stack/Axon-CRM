// components/kanban/KanbanCard.tsx
"use client";
import { useDraggable } from "@dnd-kit/core"; // Use Draggable if you aren't using a specific sortable strategy
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export function KanbanCard({ lead }: { lead: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lead.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="outline-none"
    >
      <Card className="p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-red-400 transition-all shadow-sm bg-white border-slate-200">
        <p className="text-xs flex items-center  font-black text-slate-900 truncate uppercase tracking-tighter italic">
        <Building2></Building2>  {lead.clientCompany}
        </p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-[10px] text-slate-500 font-bold">
            ${lead.value.toLocaleString()}
          </p>
          <p className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 font-black uppercase tracking-widest">
            {lead.name || "No Client"}{" "}
            {/* Updated to match schema: clientCompany */}
          </p>
        </div>
      </Card>
    </div>
  );
}
