// app/enquiries/page.tsx
import { prisma } from "@/lib/prisma";
import { CreateLeadModal } from "@/components/CreateLeadModal";
import { EnquiryTableWrapper } from "@/components/EnquiryTableWrapper";


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

      <EnquiryTableWrapper initialLeads={leads} />
    </div>
  );
}
