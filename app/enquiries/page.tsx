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

  // Check subordinates
  const subordinates = await prisma.user.findMany({
    where: { managerId: dbUser.id },
    select: { id: true },
  });

  const subordinateIds = subordinates.map((s) => s.id);

  const isManager = subordinateIds.length > 0;

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

    prisma.user.findMany({
      where: {
        companyId: dbUser.companyId,

        ...(dbUser.role !== "ADMIN" && dbUser.role !== "SUPER_ADMIN"
          ? {
              OR: [{ id: dbUser.id }, { managerId: dbUser.id }],
            }
          : {}),
      },

      select: {
        id: true,
        name: true,
        role: true,
        imageUrl: true,
      },
    }),

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

    prisma.lead.count({
      where: {
        ...baseWhere,
        isEnquiry: true,
      },
    }),

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

    prisma.lead.count({
      where: {
        ...baseWhere,
        isEnquiry: false,

        status: {
          isWon: true,
        },
      },
    }),

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
