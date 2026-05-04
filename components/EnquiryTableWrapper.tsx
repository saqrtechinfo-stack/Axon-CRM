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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, Inbox, Target, User2 } from "lucide-react";
import { StatusChangeModal } from "./StatusChangeModal";

export function EnquiryTableWrapper({
  initialLeads,
  statusColumns,
  currentUserRole,
  availableStaff,
  categories, // Accept this
  products,
}: {
  initialLeads: any[];
  statusColumns: any[];
  availableStaff: any[];
  currentUserRole: string;
  categories:any[];
  products:any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [pendingMove, setPendingMove] = useState<{
    lead: any;
    status: any;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (selectedLead) {
      const updatedLead = initialLeads.find((l) => l.id === selectedLead.id);
      if (updatedLead) {
        setSelectedLead(updatedLead);
      }
    }
  }, [initialLeads]);

  // 1. Filter by search term first
  const searchedLeads = initialLeads.filter((lead) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchStr) ||
      lead.email.toLowerCase().includes(searchStr) ||
      (lead.clientCompany &&
        lead.clientCompany.toLowerCase().includes(searchStr))
    );
  });

  // 2. Split into Enquiries and Leads based on schema boolean
  const enquiries = searchedLeads.filter((l) => l.isEnquiry);
  const activeLeads = searchedLeads.filter((l) => !l.isEnquiry);

  const LeadTable = ({ data }: { data: any[] }) => (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
              Customer
            </TableHead>
            <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
              Contact
            </TableHead>
            <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
              Status
            </TableHead>
            <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
              Value
            </TableHead>
            {currentUserRole !== "SALES_EXECUTIVE" && (
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
                Assignee
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-slate-400 text-sm italic"
              >
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((lead) => (
              <TableRow
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="group hover:bg-slate-50/80 transition-all cursor-pointer border-b border-slate-100"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {lead.clientCompany.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {" "}
                        {lead.clientCompany || "No Company"}
                      </span>
                      {/* <span className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">
                        {lead.name}
                      </span> */}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User2 className="h-3 w-3 opacity-50" />
                      <span className="text-xs font-medium">{lead.name}</span>
                    </div>
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
                      setPendingMove({ lead, status: targetStatus });
                    }}
                  />
                </TableCell>
                <TableCell className="py-4 font-mono text-sm font-bold text-slate-700 text-left">
                  <span className="text-[10px] text-slate-400 mr-1 italic">
                    AED
                  </span>
                  {lead.value.toLocaleString()}
                </TableCell>
                {currentUserRole !== "SALES_EXECUTIVE" && (
                  <TableCell className="py-4">
                    {lead.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                          {lead.assignedTo.name?.charAt(0)}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          {lead.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-1 rounded-md italic">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <EnquiryFilters onSearch={setSearchTerm} total={searchedLeads.length} />

        <Tabs defaultValue="enquiries" className="w-full">
          <TabsList className="grid max-w-md grid-cols-2 h-12 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger
              value="enquiries"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Inbox className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-tight">
                Enquiries
              </span>
              <span className="ml-1 px-1.5 py-0.5 bg-slate-200 rounded text-[10px]">
                {enquiries.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-tight">
                Active Leads
              </span>
              <span className="ml-1 px-1.5 py-0.5 bg-slate-200 rounded text-[10px]">
                {activeLeads.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enquiries" className="mt-6 focus-visible:ring-0">
            <LeadTable data={enquiries} />
          </TabsContent>
          <TabsContent value="leads" className="mt-6 focus-visible:ring-0">
            <LeadTable data={activeLeads} />
          </TabsContent>
        </Tabs>
      </div>

      {selectedLead && (
        <LeadDetailsDrawer
          currentUserRole={currentUserRole}
          availableStaff={availableStaff}
          statusColumns={statusColumns}
          categories={categories} // Pass this
          products={products}
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => {
            setSelectedLead(null);
            router.refresh();
          }}
          onUpdate={() => router.refresh()}
        />
      )}

      <StatusChangeModal
        isOpen={!!pendingMove}
        lead={pendingMove?.lead}
        targetStatus={pendingMove?.status}
        onClose={() => {
          setPendingMove(null);
          router.refresh();
        }}
      />
    </div>
  );
}
