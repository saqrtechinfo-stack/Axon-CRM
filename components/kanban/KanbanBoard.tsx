"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { StatusChangeModal } from "../StatusChangeModal"; // Import the modal we built
import { useRouter } from "next/navigation";

export function KanbanBoard({
  initialLeads,
  statusColumns,
}: {
  initialLeads: any[];
  statusColumns: any[];
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [mounted, setMounted] = useState(false);

  // NEW: State to track the move before it happens
  const [pendingMove, setPendingMove] = useState<{
    lead: any;
    status: any;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    let targetStatusId = over.id as string;

    // Check if we dropped on a column or another card
    const targetStatus = statusColumns.find((col) => col.id === targetStatusId);

    if (!targetStatus) {
      const targetLead = leads.find((l) => l.id === targetStatusId);
      if (targetLead) {
        targetStatusId = targetLead.statusId;
      } else {
        return;
      }
    }

    const activeLead = leads.find((l) => l.id === leadId);
    if (!activeLead || activeLead.statusId === targetStatusId) return;

    // INTERCEPT: Instead of updating DB, open the modal
    const finalStatus = statusColumns.find((s) => s.id === targetStatusId);
    setPendingMove({ lead: activeLead, status: finalStatus });
  }

  if (!mounted)
    return (
      <div className="flex gap-4 h-full min-h-[70vh]">Loading Board...</div>
    );

  return (
    <>
      {/* THE INTERCEPTOR MODAL */}
      <StatusChangeModal
        isOpen={!!pendingMove}
        lead={pendingMove?.lead}
        targetStatus={pendingMove?.status}
        onClose={() => {
          setPendingMove(null);
          router.refresh(); // This forces the cards to snap back if cancelled
        }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full min-h-[70vh] items-start overflow-x-auto pb-4">
          {statusColumns.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              leads={leads.filter((l) => l.statusId === status.id)}
            />
          ))}
        </div>
      </DndContext>
    </>
  );
}
