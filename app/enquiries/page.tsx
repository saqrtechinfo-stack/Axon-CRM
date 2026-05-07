import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { EnquiryTableWrapper } from "@/components/EnquiryTableWrapper";
import { CreateLeadModal } from "@/components/CreateLeadModal";
import { redirect } from "next/navigation";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>; // Promise wrapper
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  //   Define pagination constants
  const params = await searchParams;
  const { from, to } = params;
  const PAGE_SIZE = 50;
  const currentPage = Math.max(1, Number(params.page) || 1);

  //  Get User and verify existence
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true, role: true, name: true },
  });

  if (!dbUser) redirect("/sign-in");

  // 2. Define the leads visibility filter
 const whereClause: any = {
   companyId: dbUser.companyId,
   // ADD THIS: Date Range Filter
   createdAt: {
     ...(from ? { gte: new Date(from) } : {}),
     ...(to ? { lte: new Date(new Date(to).setHours(23, 59, 59, 999)) } : {}),
   },
 };

  if (dbUser.role === "SALES_EXECUTIVE") {
    // Executives see leads specifically assigned to them or those they own
    whereClause.OR = [{ assignedToId: dbUser.id }, { ownerId: dbUser.id }];
  } else if (dbUser.role === "MANAGER") {
    // Managers see their own leads, team leads, and unassigned enquiries
    whereClause.OR = [
      { assignedToId: dbUser.id }, // Sunil's own assigned leads
      { ownerId: dbUser.id }, // Sunil's own created leads
      {
        assignedTo: {
          managerId: dbUser.id, // Leads assigned to anyone reporting to Sunil (Rithik)
        },
      },
      {
        owner: {
          managerId: dbUser.id, // Leads owned by anyone reporting to Sunil (Rithik)
        },
      },
      { assignedToId: null }, // Fresh enquiries (unassigned)
    ];
  }

  // 3. Optimized Parallel Fetching
  const [categories, products, staff, leads, statusColumns, totalLeadsCount] =
    await Promise.all([
      prisma.category.findMany({
        where: { companyId: dbUser.companyId },
        select: { id: true, name: true },
      }),
      prisma.product.findMany({
        where: { companyId: dbUser.companyId },
        select: { id: true, name: true, categoryId: true },
      }),
      // Section 1: Staff Fetching (Hierarchy-aware)
      prisma.user.findMany({
        where: {
          companyId: dbUser.companyId,
          ...(dbUser.role !== "ADMIN" && dbUser.role !== "SUPER_ADMIN"
            ? { OR: [{ id: dbUser.id }, { managerId: dbUser.id }] }
            : {}),
        },
        select: {
          id: true,
          name: true,
          role: true,
          imageUrl: true,
        },
      }),
      // Section 2: Lead Fetching
      prisma.lead.findMany({
        where: whereClause,
        include: {
          status: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              managerId: true, // Included for verification
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              managerId: true,
            },
          },
          products: true,
        },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE, // Limit to 50
        skip: (currentPage - 1) * PAGE_SIZE, // Skip based on page
      }),
      prisma.leadStatus.findMany({
        where: { companyId: dbUser.companyId },
        orderBy: { order: "asc" },
      }),
      prisma.lead.count({ where: whereClause }),
    ]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
            Enquiries
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
            Saqr Tech Lead Pipeline
          </p>
        </div>

        <CreateLeadModal
          categories={categories}
          products={products}
          availableStaff={staff}
        />
      </div>

      <EnquiryTableWrapper
        initialLeads={leads}
        statusColumns={statusColumns}
        availableStaff={staff}
        currentUserRole={dbUser.role}
        categories={categories}
        products={products}
        totalCount={totalLeadsCount}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
