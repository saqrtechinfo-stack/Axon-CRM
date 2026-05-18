// components/QuotationsTable.tsxs
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileText, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-100 text-blue-600",
  ACCEPTED: "bg-emerald-100 text-emerald-600",
  REJECTED: "bg-red-100 text-red-600",
};

export function QuotationsTable({ quotations }: { quotations: any[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      !search ||
      q.qId.toLowerCase().includes(search.toLowerCase()) ||
      q.lead?.clientCompany?.toLowerCase().includes(search.toLowerCase()) ||
      q.subject?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by ID, company, subject..."
            className="pl-10 bg-white border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "DRAFT", "SENT", "ACCEPTED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                statusFilter === s
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-scroll shadow-sm">
        <table className="w-full ">

          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {[
                "Quotation ID",
                "Client",
                "Subject",
                "Amount",
                "Status",
                "Created By",
                "Date",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-slate-400 italic"
                >
                  No quotations found
                </td>
              </tr>
            ) : (
              filtered.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-black text-slate-700">
                        {q.qId}
                      </span>
                      {q.version > 1 && (
                        <span className="text-[9px] text-slate-400 font-bold">
                          v{q.version}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold text-slate-700">
                      {q.lead?.clientCompany || "—"}
                    </p>
                    <p className="text-[10px] text-slate-400">{q.lead?.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-600 truncate max-w-[200px]">
                      {q.subject || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-black text-slate-700">
                      AED{" "}
                      {q.totalAmount?.toLocaleString("en-AE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[q.status] || STATUS_STYLES.DRAFT}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-slate-500">
                      {q.createdBy?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-slate-400">
                      {format(new Date(q.createdAt), "dd MMM yyyy")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        window.open(`/api/quotations/${q.id}/pdf`, "_blank")
                      }
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
