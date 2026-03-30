// components/EnquiryTableWrapper.tsx
"use client";

import { useState } from "react";
import { EnquiryFilters } from "./EnquiryFilters";
import { StatusBadge } from "./StatusBadge";
import { LeadDetailsDrawer } from "./LeadDetailsDrawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export function EnquiryTableWrapper({ initialLeads }: { initialLeads: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = initialLeads.filter((lead) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchStr) ||
      lead.email.toLowerCase().includes(searchStr) ||
      (lead.company && lead.company.toLowerCase().includes(searchStr))
    );
  });

  return (
    <>
      <EnquiryFilters onSearch={setSearchTerm} total={filteredLeads.length} />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase">
                Customer
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase">
                Status
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase">
                Value
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow
                key={lead.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">
                      {lead.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {lead.company || lead.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge id={lead.id} currentStatus={lead.status} />
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold text-slate-600">
                  ${lead.value.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <LeadDetailsDrawer lead={lead} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
