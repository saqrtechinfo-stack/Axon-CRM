import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { EnquiryTableWrapper } from "@/components/EnquiryTableWrapper";
import { CreateLeadModal } from "@/components/CreateLeadModal";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAllSubordinateIds(userId: string): Promise<string[]> {
  // Fetch ALL users in the company in ONE query
  const allUsers = await prisma.user.findMany({
    where: {
      companyId: (await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      }))!.companyId,
    },
    select: { id: true, managerId: true },
  });

  // Build hierarchy map in memory — no more DB calls
  const subordinates = new Set<string>();
  const queue = [userId];
  const visited = new Set<string>(); // ✅ prevent infinite loop

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) continue; // ✅ skip if already processed
    visited.add(currentId);

    // Find direct reports of currentId
    const directReports = allUsers.filter(
      (u) => u.managerId === currentId && u.id !== currentId, // ✅ skip self-reference
    );

    for (const report of directReports) {
      if (!subordinates.has(report.id)) {
        subordinates.add(report.id);
        queue.push(report.id);
      }
    }
  }

  return Array.from(subordinates);
}
export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    from?: string;
    to?: string;
    search?: string;
    tab?: string;
  }>;
}) {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const params = await searchParams;

  const { from, to, search } = params;

  const activeTab = params.tab || "enquiries";

  const PAGE_SIZE = 50;
  const currentPage = Math.max(1, Number(params.page) || 1);

  const activeView = params.view || "all"; // all | mine | assigned | unassigned

  const getViewWhere = (
    view: string,
    userId: string,
    subordinateIds: string[],
  ) => {
    switch (view) {
      case "mine":
        return { ownerId: userId }; // leads I created
      case "assigned":
        return { assignedToId: userId }; // leads assigned to me
      case "unassigned":
        return { assignedToId: null }; // nobody working these
      default:
        return {}; // all — existing behavior
    }
  };


  const getTabWhere = (tab: string) => {
    switch (tab) {
      case "enquiries":
        return { isEnquiry: true };

      case "leads":
        return {
          isEnquiry: false,
          status: { isClosing: false, isWon: false },
        };

      case "won":
        return {
          isEnquiry: false,
          status: { isWon: true },
        };

      case "lost":
        return {
          isEnquiry: false,
          status: {
            isClosing: true,
            isWon: false,
          },
        };

      default:
        return { isEnquiry: true };
    }
  };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      companyId: true,
      role: true,
      name: true,
    },
  });

  if (!dbUser) redirect("/sign-in");

const subordinateIds = await getAllSubordinateIds(dbUser.id);
const isManager = subordinateIds.length > 0;

// ✅ Resolve assignable staff BEFORE Promise.all
const getAssignableStaff = () => {
  if (dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN") {
    return prisma.user.findMany({
      where: { companyId: dbUser.companyId },
      select: { id: true, name: true, role: true, imageUrl: true },
    });
  } else if (isManager) {
    return prisma.user.findMany({
      where: {
        companyId: dbUser.companyId,
        OR: [{ id: dbUser.id }, { id: { in: subordinateIds } }],
      },
      select: { id: true, name: true, role: true, imageUrl: true },
    });
  } else {
    return prisma.user.findMany({
      where: {
        id: dbUser.id,
        companyId: dbUser.companyId,
      },
      select: { id: true, name: true, role: true, imageUrl: true },
    });
  }
};

  /**
   * SEARCH FILTER
   */
  const searchFilter = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            clientCompany: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            phone: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};


    
  /**
   * BASE WHERE
   */
  const baseWhere: any = {
    companyId: dbUser.companyId,

    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),

            ...(to
              ? {
                  lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
                }
              : {}),
          },
        }
      : {}),

    AND: [searchFilter],
  };

  /**
   * ROLE / PERMISSION FILTERS
   */
  if (dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN") {
    // Admin sees everything
  } else if (isManager) {
    baseWhere.AND.push({
      OR: [
        { assignedToId: dbUser.id },
        { ownerId: dbUser.id },

        { assignedToId: { in: subordinateIds } },
        { ownerId: { in: subordinateIds } },

        { assignedToId: null },
      ],
    });
  } else {
    baseWhere.AND.push({
      OR: [{ assignedToId: dbUser.id }, { ownerId: dbUser.id }],
    });
  }

  /**
   * FINAL FILTER
   */
const dataFetchWhere = {
  ...baseWhere,
  ...getTabWhere(activeTab),
  ...getViewWhere(activeView, dbUser.id, subordinateIds),
};

  /**
   * FETCH EVERYTHING
   */
  const [
    categories,
    products,
    staff,
    leads,
    statusColumns,
    totalLeadsCount,
    totalEnquiry,
    totalLeads,
    totalWon,
    totalLost,
  ] = await Promise.all([
    prisma.category.findMany({
      where: { companyId: dbUser.companyId },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.product.findMany({
      where: { companyId: dbUser.companyId },
      select: {
        id: true,
        name: true,
        categoryId: true,
      },
    }),

    getAssignableStaff(),

    prisma.lead.findMany({
      where: dataFetchWhere,

      include: {
        status: true,

        assignedTo: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            managerId: true,
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

      orderBy: {
        createdAt: "desc",
      },

      take: PAGE_SIZE,

      skip: (currentPage - 1) * PAGE_SIZE,
    }),

    prisma.leadStatus.findMany({
      where: {
        companyId: dbUser.companyId,
      },

      orderBy: {
        order: "asc",
      },
    }),

    prisma.lead.count({
      where: baseWhere,
    }),
    // Total Enquiry
    prisma.lead.count({
      where: {
        ...baseWhere,
        isEnquiry: true,
      },
    }),
    // Total Leads
    prisma.lead.count({
      where: {
        ...baseWhere,
        isEnquiry: false,

        status: {
          isClosing: false,
          isWon: false,
        },
      },
    }),
    // Total WON
    prisma.lead.count({
      where: {
        ...baseWhere,
        isEnquiry: false,

        status: {
          isWon: true,
        },
      },
    }),

    // Total LOST
    prisma.lead.count({
      where: {
        ...baseWhere,
        isEnquiry: false,

        status: {
          isClosing: true,
          isWon: false,
        },
      },
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
        totalWon={totalWon}
        totalLost={totalLost}
      />
    </div>
  );
}
