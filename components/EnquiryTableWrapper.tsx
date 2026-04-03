"use client";

import { useState, useEffect } from "react";
import { EnquiryFilters } from "./EnquiryFilters";
import { StatusBadge } from "./StatusBadge";
import { LeadDetailsDrawer } from "./LeadDetailsDrawer";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Mail, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { StatusChangeModal } from "./StatusChangeModal";

export function EnquiryTableWrapper({
  initialLeads,
  statusColumns,
}: {
  initialLeads: any[];
  statusColumns: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [pendingMove, setPendingMove] = useState<{
    lead: any;
    status: any;
  } | null>(null);
  const router = useRouter();
  // Inside EnquiryTableWrapper.tsx
  useEffect(() => {
    if (selectedLead) {
      // Find the updated version of the currently selected lead from the new props
      const updatedLead = initialLeads.find((l) => l.id === selectedLead.id);
      if (updatedLead) {
        setSelectedLead(updatedLead);
      }
    }
  }, [initialLeads]); // This fires every time router.refresh() gets new data
  const filteredLeads = initialLeads.filter((lead) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchStr) ||
      lead.email.toLowerCase().includes(searchStr) ||
      (lead.clientCompany &&
        lead.clientCompany.toLowerCase().includes(searchStr))
    );
  });

  return (
    <>
      <EnquiryFilters onSearch={setSearchTerm} total={filteredLeads.length} />

      {/* Global Drawer - only renders when a lead is selected */}
      {selectedLead && (
        <LeadDetailsDrawer
          statusColumns={statusColumns}
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => {
            setSelectedLead(null);
            router.refresh(); // REFRESH WHEN CLOSED TO SYNC TABLE
          }}
          onUpdate={() => router.refresh()}
        />
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
                Customer
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
                Status
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
                Value
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase text-right p-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="group hover:bg-slate-50/80 transition-all cursor-pointer border-b border-slate-100"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {lead.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">
                        {lead.clientCompany || "No Company"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* New Contact Column to highlight missing data */}
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="h-3 w-3 opacity-50" />
                      <span className="text-xs font-medium">{lead.email}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${lead.phone ? "text-slate-600" : "text-amber-500 font-bold"}`}
                    >
                      <Phone className="h-3 w-3 opacity-50" />
                      <span className="text-xs">
                        {lead.phone || "Missing Number"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <StatusBadge
                    id={lead.id}
                    currentStatus={lead.status}
                    statusColumns={statusColumns}
                    onStatusSelect={(statusId) => {
                      const targetStatus = statusColumns.find(
                        (s: any) => s.id === statusId,
                      );
                      // TRIGGER THE MODAL STATE
                      setPendingMove({ lead, status: targetStatus });
                    }}
                  />
                </TableCell>

                <TableCell className="py-4 font-mono text-sm font-bold text-slate-700 text-right">
                  <span className="text-[10px] text-slate-400 mr-1 italic">
                    AED
                  </span>
                  {lead.value.toLocaleString()}
                </TableCell>

                <TableCell className="py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 text-blue-600 font-bold text-[10px] uppercase"
                  >
                    Open Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <StatusChangeModal
        isOpen={!!pendingMove}
        lead={pendingMove?.lead}
        targetStatus={pendingMove?.status}
        onClose={() => {
          setPendingMove(null);
          router.refresh(); // Ensure table stays synced
        }}
      />
    </>
  );
}
