// components/LeadFollowUps.tsx
"use client";

import { useState } from "react";
import {
  format,
  isPast,
  isToday,
  isTomorrow,
  differenceInDays,
} from "date-fns";
import {
  CalendarClock,
  Plus,
  Check,
  Trash2,
  Loader2,
  Bell,
  AlarmClock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  createFollowUp,
  markFollowUpDone,
  deleteFollowUp,
} from "@/actions/lead-actions";

interface FollowUp {
  id: string;
  scheduledAt: string;
  notes?: string;
  isDone: boolean;
  doneAt?: string;
  user: { id: string; name: string; imageUrl?: string };
}

function getUrgencyStyle(scheduledAt: string, isDone: boolean) {
  if (isDone)
    return {
      label: "Done",
      className: "bg-emerald-50 border-emerald-100 text-emerald-600",
    };
  const date = new Date(scheduledAt);
  if (isPast(date) && !isToday(date))
    return {
      label: "Overdue",
      className: "bg-red-50 border-red-200 text-red-600",
    };
  if (isToday(date))
    return {
      label: "Today",
      className: "bg-amber-50 border-amber-200 text-amber-600",
    };
  if (isTomorrow(date))
    return {
      label: "Tomorrow",
      className: "bg-blue-50 border-blue-200 text-blue-600",
    };
  const days = differenceInDays(date, new Date());
  return {
    label: `In ${days} days`,
    className: "bg-slate-50 border-slate-200 text-slate-500",
  };
}

export function LeadFollowUps({
  leadId,
  followUps,
  onUpdate,
}: {
  leadId: string;
  followUps: FollowUp[];
  onUpdate: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");

  const handleCreate = async () => {
    if (!date) return toast.error("Please select a date");

    setIsSubmitting(true);
    const scheduledAt = new Date(`${date}T${time}`);

    const res = await createFollowUp(leadId, scheduledAt, notes);
    if (res.success) {
      toast.success("Follow-up scheduled");
      setIsAdding(false);
      setDate("");
      setTime("09:00");
      setNotes("");
      onUpdate();
    } else {
      toast.error(res.error);
    }
    setIsSubmitting(false);
  };

  const handleDone = async (id: string) => {
    setLoadingId(id);
    const res = await markFollowUpDone(id);
    if (res.success) {
      toast.success("Marked as done");
      onUpdate();
    } else {
      toast.error(res.error);
    }
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    const res = await deleteFollowUp(id);
    if (res.success) {
      toast.success("Follow-up removed");
      onUpdate();
    } else {
      toast.error(res.error);
    }
    setLoadingId(null);
  };

  const pending = followUps.filter((f) => !f.isDone);
  const done = followUps.filter((f) => f.isDone);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
            Follow-Ups
          </h3>
          {pending.length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded text-[10px] font-bold">
              {pending.length} pending
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="h-7 text-[10px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-3 w-3 mr-1" /> SCHEDULE
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="mb-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
            Schedule Follow-Up
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Date
              </label>
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white border-blue-200 h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-white border-blue-200 h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What to follow up about..."
              rows={2}
              className="w-full bg-white rounded-lg border border-blue-200 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 text-[11px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Bell className="h-3 w-3 mr-1" /> CONFIRM
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsAdding(false)}
              variant="outline"
              size="sm"
              className="h-8 text-[11px] font-bold"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Pending Follow-Ups */}
      {pending.length === 0 && !isAdding ? (
        <div
          onClick={() => setIsAdding(true)}
          className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
        >
          <AlarmClock className="h-5 w-5 text-slate-300 mx-auto mb-1" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            No follow-ups scheduled
          </p>
          <p className="text-[10px] text-slate-300 mt-0.5">
            Click to schedule one
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((f) => {
            const urgency = getUrgencyStyle(f.scheduledAt, f.isDone);
            return (
              <div
                key={f.id}
                className={`flex items-start gap-3 p-3 rounded-xl border group transition-all ${urgency.className}`}
              >
                {/* Urgency dot */}
                <div className="mt-0.5 shrink-0">
                  {isPast(new Date(f.scheduledAt)) &&
                  !isToday(new Date(f.scheduledAt)) ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : isToday(new Date(f.scheduledAt)) ? (
                    <Bell className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CalendarClock className="h-4 w-4 text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black text-slate-700">
                      {format(new Date(f.scheduledAt), "dd MMM yyyy")}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(f.scheduledAt), "hh:mm a")}
                    </span>
                    <span
                      className={`ml-auto text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                        urgency.label === "Overdue"
                          ? "bg-red-100 text-red-600"
                          : urgency.label === "Today"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {urgency.label}
                    </span>
                  </div>
                  {f.notes && (
                    <p className="text-[11px] text-slate-600 italic truncate">
                      {f.notes}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase">
                    by {f.user.name}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loadingId === f.id}
                    onClick={() => handleDone(f.id)}
                    className="h-7 w-7 p-0 hover:bg-emerald-100 text-emerald-500"
                    title="Mark as done"
                  >
                    {loadingId === f.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loadingId === f.id}
                    onClick={() => handleDelete(f.id)}
                    className="h-7 w-7 p-0 hover:bg-red-100 text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Follow-Ups — collapsed */}
      {done.length > 0 && (
        <details className="mt-3">
          <summary className="text-[10px] font-bold text-slate-400 uppercase cursor-pointer hover:text-slate-600 transition-colors">
            {done.length} completed follow-up{done.length > 1 ? "s" : ""}
          </summary>
          <div className="space-y-2 mt-2">
            {done.map((f) => (
              <div
                key={f.id}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 opacity-60"
              >
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-500 line-through">
                    {format(new Date(f.scheduledAt), "dd MMM yyyy, hh:mm a")}
                  </span>
                  {f.notes && (
                    <p className="text-[11px] text-slate-400 italic truncate">
                      {f.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
