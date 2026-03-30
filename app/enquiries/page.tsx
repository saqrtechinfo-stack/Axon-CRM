// app/enquiries/page.tsx
import { prisma } from "@/lib/prisma";
import { CreateLeadModal } from "@/components/CreateLeadModal";
import { StatusBadge } from "@/components/StatusBadge"; // [IMPORT]
import { LeadDetailsDrawer } from "@/components/LeadDetailsDrawer"; // [IMPORT]
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default async function EnquiriesPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Enquiries
          </h1>
          <p className="text-sm text-slate-500">
            Manage and track all incoming customer leads.
          </p>
        </div>
        <CreateLeadModal />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-900">
                Customer
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Value
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Created
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-900">
                View
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                      {lead.name}
                    </span>
                    <span className="text-xs text-slate-500">{lead.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {/* [MAPPED STATUS BADGE] */}
                  <StatusBadge id={lead.id} currentStatus={lead.status} />
                </TableCell>
                <TableCell className="text-slate-600 font-medium font-mono text-sm">
                  ${lead.value.toLocaleString()}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {format(new Date(lead.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  {/* [MAPPED DETAILS DRAWER] */}
                  <LeadDetailsDrawer lead={lead} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
