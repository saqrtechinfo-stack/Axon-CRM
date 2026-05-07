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
  searchParams: Promise<{ page?: string; from?: string; to?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const { from, to } = params;

  const activeTab = params.tab || "enquiries";
  const isEnquiryMode = activeTab === "enquiries";

  const PAGE_SIZE = 50;
  const currentPage = Math.max(1, Number(params.page) || 1);

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true, role: true, name: true },
  });

  if (!dbUser) redirect("/sign-in");


  // Check if this user is a manager (has subordinates)
  const subordinates = await prisma.user.findMany({
    where: { managerId: dbUser.id },
    select: { id: true },
  });
  const subordinateIds = subordinates.map((s) => s.id);
  const isManager = subordinateIds.length > 0;

  // Build whereClause
  const baseWhere: any = {
    companyId: dbUser.companyId,
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to
              ? { lte: new Date(new Date(to).setHours(23, 59, 59, 999)) }
              : {}),
          },
        }
      : {}),
  };

  // Now use isManager instead of role check
  if (dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN") {
    // See everything — no OR needed
  } else if (isManager) {
    // Manager-like visibility
    baseWhere.OR = [
      { assignedToId: dbUser.id },
      { ownerId: dbUser.id },
      { assignedToId: { in: subordinateIds } },
      { ownerId: { in: subordinateIds } },
      { assignedToId: null },
    ];
  } else {
    // Regular sales executive
    baseWhere.OR = [{ assignedToId: dbUser.id }, { ownerId: dbUser.id }];
  }


  const dataFetchWhere = {
    ...baseWhere,
    isEnquiry: isEnquiryMode,
  };

  // Step 3: All your existing parallel fetching stays the same
  const [
    categories,
    products,
    staff,
    leads,
    statusColumns,
    totalLeadsCount,
    totalEnquiry,
    totalLeads,
  ] = await Promise.all([
    prisma.category.findMany({
      where: { companyId: dbUser.companyId },
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      where: { companyId: dbUser.companyId },
      select: { id: true, name: true, categoryId: true },
    }),
    prisma.user.findMany({
      where: {
        companyId: dbUser.companyId,
        ...(dbUser.role !== "ADMIN" && dbUser.role !== "SUPER_ADMIN"
          ? { OR: [{ id: dbUser.id }, { managerId: dbUser.id }] }
          : {}),
      },
      select: { id: true, name: true, role: true, imageUrl: true },
    }),
    prisma.lead.findMany({
      where: dataFetchWhere,
      include: {
        status: true,
        assignedTo: {
          select: { id: true, name: true, imageUrl: true, managerId: true },
        },
        owner: {
          select: { id: true, name: true, managerId: true },
        },
        products: true,
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
    }),
    prisma.leadStatus.findMany({
      where: { companyId: dbUser.companyId },
      orderBy: { order: "asc" },
    }),

    prisma.lead.count({ where: baseWhere }),

    prisma.lead.count({
      where: { ...baseWhere, isEnquiry: true },
    }),

    // Fetch Total Active Leads Count
    prisma.lead.count({
      where: { ...baseWhere, isEnquiry: false },
    }),
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
        totalLeads={totalLeads}
        totalEnquiry={totalEnquiry}
        activeTab={activeTab}
      />
    </div>
  );
}
