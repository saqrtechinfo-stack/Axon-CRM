// app/api/leads/[leadId]/quotations/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params;

  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const quotations = await prisma.quotation.findMany({
      where: { leadId },
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
