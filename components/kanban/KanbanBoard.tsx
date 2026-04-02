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
  statusColumns,
}: {
  initialLeads: any[];
  statusColumns: any[];
}) {
  // Use local state to handle the drag-and-drop instantly
  const [leads, setLeads] = useState(initialLeads);
  const [mounted, setMounted] = useState(false);

  // Sync local state if initialLeads changes (e.g., after a database refresh)
  useEffect(() => {
    setMounted(true);
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
    let newStatusId = over.id as string;

    // If we dropped on a Card, 'over.id' is a Lead ID (starts with 'cm...')
    // If we dropped on a Column, 'over.id' is a Status ID
    const isValidStatusId = statusColumns.some((col) => col.id === newStatusId);

    if (!isValidStatusId) {
      // If it's not a status ID, it means we dropped on another Card.
      // We need to find what column that other card belongs to.
      const targetLead = leads.find((l) => l.id === newStatusId);
      if (targetLead) {
        newStatusId = targetLead.statusId; // Set the statusId to the target card's statusId
      } else {
        return; // If we can't find the status or lead, abort.
      }
    }

    // Now proceed with the rest of your logic
    const activeLead = leads.find((l) => l.id === leadId);
    if (!activeLead || activeLead.statusId === newStatusId) return;

    // Optimistic UI - update the lead's status in local state
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, statusId: newStatusId } : l)),
    );

    // Database Update
    const result = await updateLeadStatus(leadId, newStatusId);
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
        {statusColumns.map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            // Pass ONLY the leads belonging to this column
            leads={leads.filter((l) => l.statusId === status.id)}
          />
        ))}
      </div>
    </DndContext>
  );
}
