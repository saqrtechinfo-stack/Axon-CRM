"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Plus, Edit, Trash2, GitBranch, GripVertical } from "lucide-react";

import {
  createLeadStatus,
  updateLeadStatus,
  deleteLeadStatus,
  reorderLeadStatuses,
} from "@/actions/lead-status-actions";

/* ---------------- SORTABLE ITEM ---------------- */

function SortableStatusItem({
  status,
  onEdit,
  onDelete,
}: {
  status: any;
  onEdit: (status: any) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border rounded-xl bg-white transition-all
        ${isDragging ? "opacity-0" : "hover:shadow-md"}
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-slate-400" />
        </div>

        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: status.color }}
        />

        <span className="font-medium text-slate-900">{status.label}</span>

        <Badge variant="secondary" className="text-xs">
          {status.order}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(status)}>
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(status.id)}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------------- DRAG PREVIEW ---------------- */

function DragPreview({ status }: { status: any }) {
  if (!status) return null;

  return (
    <div className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-2xl scale-105">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-slate-400" />

        <div
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: status.color }}
        />

        <span className="font-medium text-slate-900">{status.label}</span>
      </div>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export function LeadStatusesTab({
  companyId,
  initialStatuses,
}: {
  companyId: string;
  initialStatuses: any[];
}) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingStatus, setEditingStatus] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    color: "#3b82f6",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeStatus = statuses.find((s) => s.id === activeId);

  /* ---------------- DRAG ---------------- */

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = statuses.findIndex((i) => i.id === active.id);
      const newIndex = statuses.findIndex((i) => i.id === over.id);

      const newStatuses = arrayMove(statuses, oldIndex, newIndex).map(
        (s, i) => ({ ...s, order: i }),
      );

      setStatuses(newStatuses);

      const result = await reorderLeadStatuses(
        companyId,
        newStatuses.map((s) => ({ id: s.id, order: s.order })),
      );

      if (!result.success) {
        setStatuses(initialStatuses);
        alert("Reorder failed");
      }
    }
  };

  /* ---------------- CRUD ---------------- */

  const handleAdd = async () => {
    if (!formData.label.trim()) return;

    const result = await createLeadStatus(companyId, {
      ...formData,
      order: statuses.length,
    });

    if (result.success) {
      setStatuses([...statuses, result.status]);
      setFormData({ label: "", color: "#3b82f6" });
      setIsAdding(false);
    }
  };

  const handleEdit = async () => {
    if (!editingStatus) return;

    const result = await updateLeadStatus(editingStatus.id, formData);

    if (result.success) {
      setStatuses(
        statuses.map((s) => (s.id === editingStatus.id ? result.status : s)),
      );
      setEditingStatus(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this status?")) return;

    const result = await deleteLeadStatus(id);
    if (result.success) {
      setStatuses(statuses.filter((s) => s.id !== id));
    }
  };

  const openEdit = (status: any) => {
    setEditingStatus(status);
    setFormData({
      label: status.label,
      color: status.color,
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Lead Statuses
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">Statuses</h3>

          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* LIST */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={statuses.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {statuses.map((status) => (
                <SortableStatusItem
                  key={status.id}
                  status={status}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>

          {/* 🔥 DRAG OVERLAY */}
          <DragOverlay>
            {activeStatus && <DragPreview status={activeStatus} />}
          </DragOverlay>
        </DndContext>

        {/* ADD MODAL */}
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Status</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Status name"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
              />

              <Input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />

              <Button onClick={handleAdd} className="w-full">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* EDIT MODAL */}
        <Dialog
          open={!!editingStatus}
          onOpenChange={() => setEditingStatus(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Status</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
              />

              <Input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />

              <Button onClick={handleEdit} className="w-full">
                Update
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
