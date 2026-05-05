"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { updateLeadStatus } from "@/actions/lead-actions";


interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  targetStatus: any;
}

export function StatusChangeModal({
  isOpen,
  onClose,
  lead,
  targetStatus,
}: StatusChangeModalProps) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine move type based on status flags from schema
  const isLost = targetStatus?.isClosing && !targetStatus?.isWon;
  const isWon = targetStatus?.isWon;

  // Reset remarks when modal opens/closes
  useEffect(() => {
    if (!isOpen) setRemarks("");
  }, [isOpen]);

  async function handleConfirm() {
    if (isLost && !remarks.trim()) {
      alert("Please provide a reason for losing this lead.");
      return;
    }

    setLoading(true);
    // Calls the action that handles isEnquiry reversion and activity logging
    const result = await updateLeadStatus(lead.id, targetStatus.id, remarks);
    setLoading(false);

    if (result.success) {
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[425px] rounded-3xl border-none shadow-2xl transition-colors duration-500 ${isLost ? "bg-red-50/50" : "bg-white"}`}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
              {lead?.status?.label || "New"}
            </div>
            <ArrowRight className="h-3 w-3 text-slate-300" />
            <div
              className="px-2 py-1 rounded text-[10px] font-bold uppercase"
              style={{
                backgroundColor: `${targetStatus?.color}20`,
                color: targetStatus?.color,
              }}
            >
              {targetStatus?.label}
            </div>
          </div>

          <DialogTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            {isLost && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {isLost
              ? "Mark as Lost"
              : isWon
                ? "Mark as Won"
                : "Update Progress"}
          </DialogTitle>

          <p className="text-xs text-slate-500 font-medium">
            {isLost
              ? "This lead will be moved back to enquiries. Please specify why it was lost."
              : "Add a brief note about this status change for the team."}
          </p>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder={
              isLost
                ? "Why was this lead lost? (e.g., Price too high, Competitor chosen...)"
                : "Add your notes here..."
            }
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className={`min-h-[120px] border-none rounded-2xl font-medium text-sm transition-all ${
              isLost
                ? "bg-white ring-1 ring-red-200 focus-visible:ring-red-500"
                : "bg-slate-50 focus-visible:ring-blue-500"
            }`}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          {!isLost && (
            <Button
              variant="ghost"
              onClick={onClose}
              className="font-bold text-xs uppercase text-slate-400"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`w-full sm:w-auto font-black px-8 rounded-xl shadow-lg transition-all ${
              isLost
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                : isWon
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLost ? (
              "CONFIRM LOSS"
            ) : (
              "CONFIRM MOVE"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
