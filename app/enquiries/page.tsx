// app/enquiries/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { CreateLeadModal } from "@/components/CreateLeadModal";
import { EnquiryTableWrapper } from "@/components/EnquiryTableWrapper";

export default async function EnquiriesPage() {
  const { userId } = await auth();
  if (!userId) return <div>Please log in.</div>;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  });

  if (!dbUser) return <div>User not found.</div>;

  // --- ROLE-BASED LEAD FILTERING ---
  const whereClause: any = { companyId: dbUser.companyId };

  if (dbUser.role === "SALES_EXECUTIVE") {
    // Staff: ONLY leads explicitly assigned to them
    whereClause.assignedToId = dbUser.id;
  } else if (dbUser.role === "MANAGER") {
    // Manager: See leads assigned to self, direct reports, OR unassigned leads
    whereClause.OR = [
      { assignedToId: dbUser.id }, // Assigned to manager
      { assignedTo: { managerId: dbUser.id } }, // Assigned to manager's team
      { assignedToId: null }, // Unassigned (so they can delegate)
    ];
  }
  // ADMIN: No extra filter needed, they see all companyId leads

  // --- NEW: FETCH AVAILABLE STAFF FOR ASSIGNMENT ---
  let availableStaff: any[] = [];

  if (["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    // Admins see everyone in the company
    availableStaff = await prisma.user.findMany({
      where: { companyId: dbUser.companyId },
      select: { id: true, name: true, role: true },
    });
  } else if (dbUser.role === "MANAGER") {
    // Managers see themselves + their direct reports
    availableStaff = await prisma.user.findMany({
      where: {
        OR: [{ id: dbUser.id }, { managerId: dbUser.id }],
      },
      select: { id: true, name: true, role: true },
    });
  }

  const leads = await prisma.lead.findMany({
    where: whereClause,
    include: {
      status: true,
      assignedTo: { select: { name: true, role: true } },
      activities: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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
            Manage and track all incoming leads.
          </p>
        </div>
        <CreateLeadModal />
      </div>

      <EnquiryTableWrapper
        initialLeads={leads}
        statusColumns={statusColumns}
        availableStaff={availableStaff} // PASS THIS
        currentUserRole={dbUser.role}
      />
    </div>
  );
}
