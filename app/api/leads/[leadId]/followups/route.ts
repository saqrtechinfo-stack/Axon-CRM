// app/api/leads/[id]/followups/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// app/api/leads/[leadId]/followups/route.ts

export async function GET(
  req: NextRequest,
  { params }: { params: { leadId: string } } // Must match [leadId] folder name
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure prisma.leadFollowUp is recognized after running 'npx prisma generate'
  try {
    const followUps = await prisma.leadFollowUp.findMany({
      where: { leadId: params.leadId }, // Use leadId to match the destructured params
      include: {
        user: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json(followUps);
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}