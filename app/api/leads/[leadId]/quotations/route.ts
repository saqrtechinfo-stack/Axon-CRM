// app/api/leads/[leadId]/quotations/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAllSubordinateIds, getLeadAccessWhere } from "@/lib/visibility";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params;

  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true, role: true },
  });

  if (!dbUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subordinateIds = await getAllSubordinateIds(dbUser.id);
  const leadAccessWhere = getLeadAccessWhere(dbUser, subordinateIds);

  try {
    const where: Prisma.QuotationWhereInput = {
      leadId,
      companyId: dbUser.companyId,
    };

    if (dbUser.role !== "ADMIN" && dbUser.role !== "SUPER_ADMIN") {
      where.OR = [
        { createdById: dbUser.id },
        ...(subordinateIds.length > 0
          ? [{ createdById: { in: subordinateIds } }]
          : []),
        { lead: leadAccessWhere },
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        items: true,
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ version: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(quotations);
  } catch (error) {
    console.error("QUOTATIONS_FETCH_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 },
    );
  }
}
