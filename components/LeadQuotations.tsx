"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QuotationBuilder } from "./QuotationBuilder";
import { deleteQuotation, updateQuotationStatus } from "@/actions/quotation";


const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-100 text-blue-600",
  ACCEPTED: "bg-emerald-100 text-emerald-600",
  REJECTED: "bg-red-100 text-red-600",
};

export function LeadQuotations({
  lead,
  quotations,
  onUpdate,
}: {
  lead: any;
  quotations: any[];
  onUpdate: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteQuotation(id);
    if (res.success) {
      toast.success("Quotation deleted");
      onUpdate();
    } else {
      toast.error(res.error);
    }
    setDeletingId(null);
  };

  const handleStatusChange = async (
    id: string,
    status: "SENT" | "ACCEPTED" | "REJECTED",
  ) => {
    setUpdatingId(id);
    const res = await updateQuotationStatus(id, status);
    if (res.success) {
      toast.success(`Marked as ${status.toLowerCase()}`);
      onUpdate();
    } else {
      toast.error(res.error);
    }
    setUpdatingId(null);
  };

  const handleDownloadPdf = (quotationId: string, qId: string) => {
    window.open(`/api/quotations/${quotationId}/pdf`, "_blank");
  };

  // Show builder if creating or editing
  if (isCreating || editingQuotation) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <QuotationBuilder
          lead={lead}
          existingQuotation={editingQuotation}
          onSuccess={() => {
            setIsCreating(false);
            setEditingQuotation(null);
            onUpdate();
          }}
          onCancel={() => {
            setIsCreating(false);
            setEditingQuotation(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
            Quotations
          </h3>
          {quotations.length > 0 && (
            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">
              {quotations.length}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreating(true)}
          className="h-7 text-[10px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-3 w-3 mr-1" /> NEW
        </Button>
      </div>

      {/* Quotation List */}
      {quotations.length === 0 ? (
        <div
          onClick={() => setIsCreating(true)}
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
        >
          <FileText className="h-6 w-6 text-slate-300 mx-auto mb-2" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            No quotations yet
          </p>
          <p className="text-[10px] text-slate-300 mt-1">Click to create one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotations.map((q) => (
            <div
              key={q.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 transition-all"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-slate-700">
                      {q.qId}
                    </span>
                    {q.version > 1 && (
                      <span className="text-[9px] font-bold text-slate-400">
                        v{q.version}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[q.status] || STATUS_STYLES.DRAFT}`}
                    >
                      {q.status}
                    </span>
                  </div>
                  {q.subject && (
                    <p className="text-[11px] text-slate-500 truncate">
                      {q.subject}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {format(new Date(q.createdAt), "dd MMM yyyy")} •{" "}
                    <span className="font-black text-slate-600">
                      AED{" "}
                      {q.totalAmount?.toLocaleString("en-AE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-1 mt-3 flex-wrap">
                {/* PDF Download — always available */}
                <button
                  onClick={() => handleDownloadPdf(q.id, q.qId)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
                >
                  <Download className="h-3 w-3" /> PDF
                </button>

                {/* Edit */}
                <button
                  onClick={() => setEditingQuotation(q)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600 transition-all"
                >
                  <Edit3 className="h-3 w-3" /> Edit
                </button>

                {/* Mark as Sent — only for DRAFT */}
                {q.status === "DRAFT" && (
                  <button
                    disabled={updatingId === q.id}
                    onClick={() => handleStatusChange(q.id, "SENT")}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                  >
                    {updatingId === q.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    Mark Sent
                  </button>
                )}

                {/* Accept / Reject — only for SENT */}
                {q.status === "SENT" && (
                  <>
                    <button
                      disabled={updatingId === q.id}
                      onClick={() => handleStatusChange(q.id, "ACCEPTED")}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
                    >
                      <CheckCircle className="h-3 w-3" /> Accept
                    </button>
                    <button
                      disabled={updatingId === q.id}
                      onClick={() => handleStatusChange(q.id, "REJECTED")}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                    >
                      <XCircle className="h-3 w-3" /> Reject
                    </button>
                  </>
                )}

                {/* Delete — only DRAFT */}
                {q.status === "DRAFT" && (
                  <button
                    disabled={deletingId === q.id}
                    onClick={() => handleDelete(q.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-50 transition-all ml-auto"
                  >
                    {deletingId === q.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
