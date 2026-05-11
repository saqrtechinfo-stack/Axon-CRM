// components/RelatedLeads.tsx
"use client";

import { format } from "date-fns";
import { Building2, TrendingUp, Clock, Trophy, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

function StatusDot({ lead }: { lead: any }) {
  if (lead.isEnquiry)
    return <span className="h-2 w-2 rounded-full bg-slate-300 shrink-0" />;
  if (lead.status?.isWon)
    return <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />;
  if (lead.status?.isClosing)
    return <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />;
  return <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />;
}

export function RelatedLeads({
  currentLeadId,
  clientId,
  clientName,
  onLeadClick,
}: {
  currentLeadId: string;
  clientId?: string;
  clientName?: string;
  onLeadClick: (lead: any) => void;
}) {
  // Only show if we have a clientId
  if (!clientId) return null;

  return (
    <RelatedLeadsInner
      currentLeadId={currentLeadId}
      clientId={clientId}
      clientName={clientName}
      onLeadClick={onLeadClick}
    />
  );
}

function RelatedLeadsInner({
  currentLeadId,
  clientId,
  clientName,
  onLeadClick,
}: {
  currentLeadId: string;
  clientId: string;
  clientName?: string;
  onLeadClick: (lead: any) => void;
}) {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${clientId}/leads?exclude=${currentLeadId}`)
      .then((r) => r.json())
      .then((data) => {
        setLeads(data);
        setIsLoading(false);
      });
  }, [clientId, currentLeadId]);

  if (isLoading)
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-4 w-32 bg-slate-100 animate-pulse rounded mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-14 bg-slate-50 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );

  if (leads.length === 0) return null; // hide if no related leads

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-4 w-4 text-blue-500" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
          Other Leads from {clientName}
        </h3>
        <span className="ml-auto px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500">
          {leads.length}
        </span>
      </div>

      <div className="space-y-2">
        {leads.map((lead) => (
          <button
            key={lead.id}
            onClick={() => onLeadClick(lead)}
            className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all group"
          >
            <StatusDot lead={lead} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 truncate">
                {lead.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {lead.isEnquiry
                  ? "Enquiry"
                  : lead.status?.label || "Active Lead"}{" "}
                • {format(new Date(lead.createdAt), "dd MMM yyyy")}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-black text-slate-600">
                AED {lead.value?.toLocaleString() || 0}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
