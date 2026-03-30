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
  const [mounted, setMounted] = useState(false); //

  // Sync local state if initialLeads changes (e.g., after a database refresh)
  useEffect(() => {
    setMounted(true); // [ADD THIS]
    setLeads(initialLeads);
  }, [initialLeads]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevents accidental drags when clicking
      },
    }),
  );

  // components/kanban/KanbanBoard.tsx

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    let newStatus = over.id as string;

    // --- THE FIX STARTS HERE ---
    // If we dropped on a Card, 'over.id' is a Lead ID (starts with 'cm...')
    // If we dropped on a Column, 'over.id' is a Status (NEW, WON, etc.)

    // We check if the 'over.id' is actually one of our valid statuses
    const isValidStatus = columns.includes(newStatus);

    if (!isValidStatus) {
      // If it's not a status, it means we dropped on another Card.
      // We need to find what column that other card belongs to.
      const targetLead = leads.find((l) => l.id === newStatus);
      if (targetLead) {
        newStatus = targetLead.status; // Set the status to the target card's status
      } else {
        return; // If we can't find the status or lead, abort.
      }
    }
    // --- THE FIX ENDS HERE ---

    // Now proceed with the rest of your logic
    const activeLead = leads.find((l) => l.id === leadId);
    if (!activeLead || activeLead.status === newStatus) return;

    // Optimistic UI
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: newStatus as any } : l,
      ),
    );

    // Database Update
    const result = await updateLeadStatus(leadId, newStatus);
    if (!result.success) {
      setLeads(initialLeads);
      alert("Failed to update status.");
    }
  }
  // This prevents the "Hydration Mismatch" by waiting for the client to be ready
  if (!mounted)
    return (
      <div className="flex gap-4 h-full min-h-[70vh]">Loading Board...</div>
    );

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
