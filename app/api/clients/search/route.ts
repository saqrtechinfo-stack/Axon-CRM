// app/api/clients/search/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { companyId: true },
  });

  const search = req.nextUrl.searchParams.get("q") || "";

  const clients = await prisma.client.findMany({
    where: {
      companyId: dbUser!.companyId,
      name: { contains: search, mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      _count: { select: { leads: true } },
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clients);
}
