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

  // Sync state with server data when it changes (e.g., after router.refresh)
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

    // 1. Determine the actual target status ID
    // (Could be dropping on a Column ID or another Card's ID)
    const isColumn = statusColumns.some((col) => col.id === targetId);
    const finalStatusId = isColumn
      ? targetId
      : leads.find((l) => l.id === targetId)?.statusId;

    if (!finalStatusId) return;

    const activeLead = leads.find((l) => l.id === leadId);
    if (!activeLead || activeLead.statusId === finalStatusId) return;

    // 🔥 OPTIMISTIC UPDATE: Move card visually before DB update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, statusId: finalStatusId } : l,
      ),
    );

    // 2. Prepare the modal for confirmation/remarks
    const targetStatus = statusColumns.find((s) => s.id === finalStatusId);
    setPendingMove({ lead: activeLead, status: targetStatus });
  }

  if (!mounted)
    return (
      <div className="p-8 font-bold animate-pulse">Initializing Board...</div>
    );

  return (
    <>
      <StatusChangeModal
        isOpen={!!pendingMove}
        lead={pendingMove?.lead}
        targetStatus={pendingMove?.status}
        onClose={() => {
          setPendingMove(null);
          // If they didn't finish the action, initialLeads will still have
          // the old statusId, which will "snap" the card back via the useEffect above.
          router.refresh();
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
