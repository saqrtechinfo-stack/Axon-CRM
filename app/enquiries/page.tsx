// app/enquiries/page.tsx
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CreateLeadModal } from "@/components/CreateLeadModal";
import { EnquiryTableWrapper } from "@/components/EnquiryTableWrapper";

export default async function EnquiriesPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please log in to view enquiries.</div>;
  }

  // Get the current user's company
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  });

  if (!dbUser) {
    return <div>User not found. Please contact admin.</div>;
  }

  const leads = await prisma.lead.findMany({
    where: { companyId: dbUser.companyId },
    include: {
      status: true, // This fetches the related LeadStatus object
    },
    orderBy: { createdAt: "desc" },
  });

  // Get the status columns for this company
  const statusColumns = await prisma.leadStatus.findMany({
    where: { companyId: dbUser.companyId },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
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

      <EnquiryTableWrapper initialLeads={leads} statusColumns={statusColumns} />
    </div>
  );
}
