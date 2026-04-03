"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateLeadStatus } from "@/actions/lead-actions";
import { Loader2, ArrowRight } from "lucide-react";

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  targetStatus: any; // The status object we are moving TO
}

export function StatusChangeModal({
  isOpen,
  onClose,
  lead,
  targetStatus,
}: StatusChangeModalProps) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = await updateLeadStatus(lead.id, targetStatus.id, remarks);
    setLoading(false);
    if (result.success) {
      setRemarks("");
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
              {lead?.status?.label}
            </div>
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <div className="px-2 py-1 bg-blue-50 rounded text-[10px] font-bold text-blue-600 uppercase">
              {targetStatus?.label}
            </div>
          </div>
          <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
            Update Progress: {lead?.name}
          </DialogTitle>
          <p className="text-xs text-slate-500 font-medium">
            Add a brief note about this status change for the team.
          </p>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="e.g., Client agreed to a meeting next Tuesday..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="min-h-[120px] bg-slate-50 border-none rounded-2xl focus-visible:ring-blue-500 font-medium text-sm"
          />
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="font-bold text-xs uppercase text-slate-400"
          >
            Skip Note
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 rounded-xl shadow-lg shadow-blue-200"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "CONFIRM MOVE"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
