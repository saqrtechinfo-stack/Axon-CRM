import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { EnquiryTableWrapper } from "@/components/EnquiryTableWrapper";
import { CreateLeadModal } from "@/components/CreateLeadModal";
import { redirect } from "next/navigation";

export const revalidate = 30;

export default async function EnquiriesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 1. Get User and verify existence before doing anything else
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true, role: true },
  });

  if (!dbUser) redirect("/sign-in");

  // 2. Define the leads visibility filter
  const whereClause: any = { companyId: dbUser.companyId };

  if (dbUser.role === "SALES_EXECUTIVE") {
    whereClause.assignedToId = dbUser.id;
  } else if (dbUser.role === "MANAGER") {
    whereClause.OR = [
      { assignedToId: dbUser.id },
      { assignedTo: { managerId: dbUser.id } },
      { assignedToId: null },
    ];
  }

  // 3. Optimized Parallel Fetching
  const [categories, products, staff, leads, statusColumns] = await Promise.all(
    [
      prisma.category.findMany({
        where: { companyId: dbUser.companyId },
        select: { id: true, name: true },
      }),
      prisma.product.findMany({
        where: { companyId: dbUser.companyId },
        select: { id: true, name: true, categoryId: true },
      }),
      // Section 1: Staff Fetching
      prisma.user.findMany({
        where:
          dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN"
            ? { companyId: dbUser.companyId }
            : { OR: [{ id: dbUser.id }, { managerId: dbUser.id }] },
        select: {
          id: true,
          name: true,
          role: true,
          imageUrl: true, // Changed from 'image' to 'imageUrl'
        },
      }),

      // Section 2: Lead Fetching
      prisma.lead.findMany({
        where: whereClause,
        include: {
          status: true,
          assignedTo: {
            select: {
              name: true,
              imageUrl: true, // Changed from 'image' to 'imageUrl'
            },
          },
          owner: { select: { name: true } },
          products: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),

      prisma.leadStatus.findMany({
        where: { companyId: dbUser.companyId },
        orderBy: { order: "asc" },
      }),
    ],
  );
console.log("DEBUG LEADS DATA:", JSON.stringify(leads[0], null, 2));
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
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
    
      />
    </div>
  );
}
