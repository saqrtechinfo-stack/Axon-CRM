// components/LeadAttachments.tsx
"use client";

import { useState, useRef } from "react";
import {
  Paperclip,
  Upload,
  FileText,
  ImageIcon,
  File,
  Loader2,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  createdAt: string;
  signedUrl?: string;
}

function FileIcon({ type }: { type?: string }) {
  if (!type) return <File className="h-4 w-4 text-slate-400" />;
  if (type.startsWith("image/"))
    return <ImageIcon className="h-4 w-4 text-purple-500" />;
  if (type === "application/pdf")
    return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes("word"))
    return <FileText className="h-4 w-4 text-blue-500" />;
  if (type.includes("sheet") || type.includes("excel"))
    return <FileText className="h-4 w-4 text-emerald-500" />;
  return <File className="h-4 w-4 text-slate-400" />;
}

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LeadAttachments({
  leadId,
  attachments,
  onUpdate,
}: {
  leadId: string;
  attachments: Attachment[];
  onUpdate: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // 10MB limit per file
    const oversized = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length) {
      toast.error(
        `Files must be under 10MB: ${oversized.map((f) => f.name).join(", ")}`,
      );
      return;
    }

    setIsUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/leads/${leadId}/attachments`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
      }

      toast.success(`${files.length} file(s) uploaded`);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    setDownloadingId(attachment.id);

    try {
      const res = await fetch(`/api/attachments/${attachment.id}/sign`);
      const { signedUrl } = await res.json();

      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to open file");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    setDeletingId(attachmentId);
    try {
      const res = await fetch(`/api/leads/${leadId}/attachments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attachmentId }),
      });

      if (!res.ok) throw new Error("Failed to delete");
      toast.success("File removed");
      onUpdate();
    } catch {
      toast.error("Failed to remove file");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
            Attachments
          </h3>
          {attachments.length > 0 && (
            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">
              {attachments.length}
            </span>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="h-7 text-[10px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Upload className="h-3 w-3 mr-1" />
            )}
            {isUploading ? "UPLOADING..." : "UPLOAD"}
          </Button>
        </div>
      </div>

      {/* File List */}
      {attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
        >
          <Upload className="h-6 w-6 text-slate-300 mx-auto mb-2" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Drop files or click to upload
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            PDF, Images, Word, Excel — Max 10MB each
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-100 hover:bg-blue-50/30 transition-all"
            >
              {/* Icon */}
              <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <FileIcon type={attachment.type} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate">
                  {attachment.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {formatSize(attachment.size)} •{" "}
                  {format(new Date(attachment.createdAt), "dd MMM yyyy")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={downloadingId === attachment.id}
                  onClick={() => handleDownload(attachment)}
                  className="h-7 w-7 p-0 hover:bg-blue-100 text-blue-500"
                  title="Download"
                >
                  {downloadingId === attachment.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === attachment.id}
                  onClick={() => handleDelete(attachment.id)}
                  className="h-7 w-7 p-0 hover:bg-red-100 text-red-400"
                  title="Delete"
                >
                  {deletingId === attachment.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}

          {/* Add more */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-2 text-[10px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-wider border border-dashed border-slate-200 rounded-xl hover:border-blue-300 transition-all"
          >
            + Add More Files
          </button>
        </div>
      )}
    </div>
  );
}
