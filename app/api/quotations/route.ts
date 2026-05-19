// app/api/quotations/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getAllSubordinateIds,
  getQuotationAccessWhere,
} from "@/lib/visibility";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true, role: true },
  });

  if (!dbUser) return NextResponse.json([], { status: 401 });

  const subordinateIds = await getAllSubordinateIds(dbUser.id);

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search");

  const quotations = await prisma.quotation.findMany({
    where: {
      companyId: dbUser.companyId,
      ...getQuotationAccessWhere(dbUser, subordinateIds),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { qId: { contains: search, mode: "insensitive" } },
              { subject: { contains: search, mode: "insensitive" } },
              {
                lead: {
                  clientCompany: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      lead: {
        select: {
          id: true,
          clientCompany: true,
          name: true,
        },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(quotations);
}
