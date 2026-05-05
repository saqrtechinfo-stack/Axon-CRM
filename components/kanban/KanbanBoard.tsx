// components/kanban/KanbanBoard.tsx
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
import { StatusChangeModal } from "../StatusChangeModal";
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
    let targetId = over.id as string;

    const isColumn = statusColumns.some((col) => col.id === targetId);
    const finalStatusId = isColumn
      ? targetId
      : leads.find((l) => l.id === targetId)?.statusId;

    if (!finalStatusId) return;

    const activeLead = leads.find((l) => l.id === leadId);
    if (!activeLead || activeLead.statusId === finalStatusId) return;

    const targetStatus = statusColumns.find((s) => s.id === finalStatusId);

    // Optimistic Update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, statusId: finalStatusId } : l,
      ),
    );

    // Detect if this is a "Won" or "Lost" transition based on Schema Flags
    const moveType = targetStatus.isWon
      ? "WON"
      : targetStatus.isClosing && !targetStatus.isWon
        ? "LOST"
        : "NORMAL";

    setPendingMove({
      lead: activeLead,
      status: { ...targetStatus, moveType }, // Pass the move type to the modal
    });
  }

  if (!mounted)
    return (
      <div className="p-8 font-bold animate-pulse text-slate-400">
        Loading Pipeline...
      </div>
    );

  return (
    <>
      <StatusChangeModal
        isOpen={!!pendingMove}
        lead={pendingMove?.lead}
        targetStatus={pendingMove?.status}
        onClose={() => {
          setPendingMove(null);
          router.refresh(); // Snap back if cancelled
        }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full min-h-[75vh] items-start overflow-x-auto pb-8 px-2">
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
