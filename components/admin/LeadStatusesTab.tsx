// components/admin/LeadStatusesTab.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, GitBranch } from "lucide-react";
import {
  createLeadStatus,
  updateLeadStatus,
  deleteLeadStatus,
} from "@/actions/lead-status-actions";

export function LeadStatusesTab({
  companyId,
  initialStatuses,
}: {
  companyId: string;
  initialStatuses: any[];
}) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    color: "#3b82f6",
  });

  const handleAdd = async () => {
    if (!formData.label.trim()) return;

    const result = await createLeadStatus(companyId, {
      label: formData.label,
      color: formData.color,
      order: statuses.length,
    });

    if (result.success) {
      setStatuses([...statuses, result.status]);
      setFormData({ label: "", color: "#3b82f6" });
      setIsAdding(false);
    } else {
      alert(result.error || "Failed to create status");
    }
  };

  const handleEdit = async (id: string) => {
    const status = statuses.find((s) => s.id === id);
    if (!status) return;

    const result = await updateLeadStatus(id, {
      label: formData.label || status.label,
      color: formData.color || status.color,
    });

    if (result.success) {
      setStatuses(statuses.map((s) => (s.id === id ? result.status : s)));
      setEditingId(null);
      setFormData({ label: "", color: "#3b82f6" });
    } else {
      alert(result.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this status? This may affect existing leads.",
      )
    ) {
      return;
    }

    const result = await deleteLeadStatus(id);
    if (result.success) {
      setStatuses(statuses.filter((s) => s.id !== id));
    } else {
      alert(result.error || "Failed to delete status");
    }
  };

  const startEdit = (status: any) => {
    setEditingId(status.id);
    setFormData({ label: status.label, color: status.color });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Lead Statuses
        </CardTitle>
        <p className="text-sm text-slate-600">
          Manage the statuses used in your sales pipeline. These will appear as
          columns in your pipeline view.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Statuses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-900">
              Current Statuses
            </h3>
            <Button
              onClick={() => setIsAdding(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Status
            </Button>
          </div>

          <div className="space-y-2">
            {statuses.map((status) => (
              <div
                key={status.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="font-medium text-slate-900">
                    {status.label}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Order: {status.order}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(status)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(status.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
            <h4 className="font-medium text-slate-900">
              {editingId ? "Edit Status" : "Add New Status"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Status Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="e.g., NEW, CONTACTED, QUALIFIED"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={editingId ? () => handleEdit(editingId) : handleAdd}
                size="sm"
              >
                {editingId ? "Update Status" : "Add Status"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ label: "", color: "#3b82f6" });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium text-blue-900 mb-1">💡 Tips:</p>
          <ul className="space-y-1 text-blue-800">
            <li>
              • Statuses appear in order from left to right in your pipeline
            </li>
            <li>• You cannot delete a status that has leads assigned to it</li>
            <li>
              • Changes will be reflected immediately in your pipeline view
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
