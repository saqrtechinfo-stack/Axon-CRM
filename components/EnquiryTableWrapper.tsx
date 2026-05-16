"use client";

import { useState, useEffect } from "react";

import { StatusBadge } from "./StatusBadge";
import { LeadDetailsDrawer } from "./LeadDetailsDrawer";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, Inbox, Target, User2, XCircle, Trophy } from "lucide-react";
import { StatusChangeModal } from "./StatusChangeModal";
import { EnquiryFilters } from "./EnquiryFilters";

export function EnquiryTableWrapper({
  initialLeads,
  statusColumns,
  currentUserRole,
  availableStaff,
  categories,
  products,
  totalCount,
  totalEnquiry,
  totalLeads,
  currentPage,
  pageSize,
  activeTab,
  totalWon,
  totalLost,
  isManager,
  activeView,
  viewCounts,
}: {
  initialLeads: any[];
  statusColumns: any[];
  availableStaff: any[];
  currentUserRole: string;
  categories: any[];
  products: any[];
  totalEnquiry: number;
  totalLeads: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalWon: number;
  totalLost: number;
  activeTab: string;
  isManager: boolean;
  activeView: string;
  viewCounts: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.ceil(totalCount / pageSize);
  const searchParams = useSearchParams();
  const openLeadId = searchParams.get("openLead");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [pendingMove, setPendingMove] = useState<{
    lead: any;
    status: any;
  } | null>(null);

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    if (selectedLead) {
      const updatedLead = initialLeads.find((l) => l.id === selectedLead.id);
      if (updatedLead) {
        setSelectedLead(updatedLead);
      }
    }
  }, [initialLeads]);

  useEffect(() => {
    if (!openLeadId || !initialLeads?.length) return;

    const lead = initialLeads.find((l) => l.id === openLeadId);

    if (lead) {
      setSelectedLead(lead);

      // remove query param after opening
      router.replace(pathname);
    }
  }, [openLeadId, initialLeads, pathname, router]);
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", value);
    params.set("page", "1"); // ALWAYS reset to page 1 when switching tabs
    router.push(`?${params.toString()}`);
  };
  const LeadTable = ({
    data,
    isEnquiry,
  }: {
    data: any[];
    isEnquiry?: boolean;
  }) => (
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
            {!isEnquiry && (
              <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
                Status
              </TableHead>
            )}
            <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
              Value
            </TableHead>
            {/* {currentUserRole !== "SALES_EXECUTIVE" && ( */}
            <TableHead className="font-bold text-slate-900 text-[11px] uppercase p-4">
              Assignee
            </TableHead>
            {/* )} */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isEnquiry ? 4 : 5}
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
                      <span className="inline-flex max-w-max mt-1 items-center gap-1.5 px-[1px ]py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wide border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        <span className=" h-1.5 rounded-full bg-blue-500"></span>
                        Channel • {lead.source || "No Source"}
                        <span></span>
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User2 className="h-3 w-3 opacity-50" />
                      <span className="text-xs font-medium">{lead.name}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${lead.phone ? "text-slate-600" : "text-amber-500 font-bold"}`}
                    >
                      <Phone className="h-3 w-3 opacity-50" />
                      <span className="text-xs">
                        {lead.phone || "Missing Number"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="h-3 w-3 opacity-50" />
                      <span className="text-xs font-medium">
                        {lead.email || "N/A"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                {lead.isEnquiry === false && (
                  <TableCell
                    className="py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                )}
                <TableCell className="py-4 font-mono text-sm font-bold text-slate-700 text-left">
                  <span className="text-[10px] text-slate-400 mr-1 italic">
                    AED
                  </span>
                  {lead.value.toLocaleString()}
                </TableCell>
                {/* {currentUserRole !== "SALES_EXECUTIVE" && ( */}
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
                {/* )} */}
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
        <EnquiryFilters
          currentUserRole={currentUserRole}
          isManager={isManager} // ✅ new prop
          activeView={activeView}
          viewCounts={viewCounts}
          total={totalCount}
        />

        <Tabs
          defaultValue="enquiries"
          className="w-full cursor-pointer"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className="grid max-w-2xl grid-cols-2 md:grid-cols-4 mb-5 md:mb-0 h-12 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger
              value="enquiries"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Inbox className="h-4 w-4 text-orange-500" />
              <span className="font-bold text-xs uppercase tracking-tight">
                Enquiries
              </span>
              <span className="ml-1 px-1.5 py-0.5  rounded text-[10px] bg-orange-100 text-orange-700">
                {totalEnquiry}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Target className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-xs uppercase tracking-tight">
                Active Leads
              </span>
              <span className="ml-1 px-1.5 py-0.5  rounded text-[10px] bg-blue-100 text-blue-700">
                {totalLeads}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="won"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Trophy className="h-4 w-4 text-emerald-500" />
              <span className="font-bold text-xs uppercase tracking-tight">
                Won
              </span>
              <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]">
                {totalWon}
              </span>
            </TabsTrigger>

            {/* NEW */}
            <TabsTrigger
              value="lost"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="font-bold text-xs uppercase tracking-tight">
                Lost
              </span>
              <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px]">
                {totalLost}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enquiries">
            <LeadTable data={initialLeads} isEnquiry />
          </TabsContent>
          <TabsContent value="leads">
            <LeadTable data={initialLeads} />
          </TabsContent>
          <TabsContent value="won">
            <LeadTable data={initialLeads} />
          </TabsContent>
          <TabsContent value="lost">
            <LeadTable data={initialLeads} />
          </TabsContent>
        </Tabs>
        {totalCount > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200 pt-4 px-2">
            <div className="text-xs text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="font-bold text-slate-900">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of (<span className="">{totalCount}</span> results)
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Optional: Only show first few and last few if totalPages is large
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? "bg-slate-900 text-white shadow-md"
                            : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadDetailsDrawer
          key={selectedLead.id}
          currentUserRole={currentUserRole}
          availableStaff={availableStaff}
          statusColumns={statusColumns}
          categories={categories} // Pass this
          products={products}
          onLeadSwitch={(relatedLead) => setSelectedLead(relatedLead)}
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
