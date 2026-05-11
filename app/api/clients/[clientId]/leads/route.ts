// app/api/clients/[clientId]/leads/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });

  const excludeId = req.nextUrl.searchParams.get("exclude");

const leads = await prisma.lead.findMany({
  where: {
    clientId,
    ...(excludeId ? { id: { not: excludeId } } : {}),
  },
  include: {
    // ✅ Include everything the drawer needs
    status: true,
    category: true,
    assignedTo: {
      select: { id: true, name: true, imageUrl: true, managerId: true },
    },
    owner: {
      select: { id: true, name: true, managerId: true },
    },
    products: true,
    client: {
      select: { id: true, name: true },
    },
  },
  orderBy: { createdAt: "desc" },
});

  return NextResponse.json(leads);
}
