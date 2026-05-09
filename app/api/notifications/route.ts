// app/api/notifications/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true },
  });

  if (!dbUser) return NextResponse.json([]);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // Fetch overdue + today's pending follow-ups
  const followUps = await prisma.leadFollowUp.findMany({
    where: {
      userId: dbUser.id,
      isDone: false,
      scheduledAt: { lte: endOfToday },
    },
    include: {
      lead: {
        select: {
          id: true,
          clientCompany: true,
          name: true,
          phone: true,
          isEnquiry: true,
          status: { select: { label: true, color: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(followUps);
}
