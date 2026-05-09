// app/api/leads/[leadId]/followups/route.ts
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
    const followUps = await prisma.leadFollowUp.findMany({
      where: { leadId },
      include: {
        user: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
    console.log(
      "👉 FOLLOWUPS FOUND:",
      followUps.map((f) => f.leadId),
    );
    return NextResponse.json(followUps);
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
