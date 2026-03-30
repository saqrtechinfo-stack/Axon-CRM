// components/kanban/KanbanBoard.tsx
"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { updateLeadStatus } from "@/actions/lead-actions";

export function KanbanBoard({
  initialLeads,
  columns,
}: {
  initialLeads: any[];
  columns: string[];
}) {
  // Use local state to handle the drag-and-drop instantly
  const [leads, setLeads] = useState(initialLeads);

  // Sync local state if initialLeads changes (e.g., after a database refresh)
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevents accidental drags when clicking
      },
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as string;

    // 1. Find the lead
    const activeLead = leads.find((l) => l.id === leadId);
    if (!activeLead || activeLead.status === newStatus) return;

    // 2. Optimistic UI Update (Immediate)
    const updatedLeads = leads.map((l) =>
      l.id === leadId ? { ...l, status: newStatus as any } : l,
    );
    setLeads(updatedLeads);

    // 3. Database Update (Background)
    const result = await updateLeadStatus(leadId, newStatus);

    if (!result.success) {
      // Revert if database fails
      setLeads(initialLeads);
      alert("Failed to update status. Reverting...");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full min-h-[70vh] items-start">
        {columns.map((col) => (
          <KanbanColumn
            key={col}
            status={col}
            // Pass ONLY the leads belonging to this column
            leads={leads.filter((l) => l.status === col)}
          />
        ))}
      </div>
    </DndContext>
  );
}
