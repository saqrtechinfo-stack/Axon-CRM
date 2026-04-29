import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { leadId: string } },
) {
  try {
    // We await params in Next.js 15
    const { leadId } = await params;

    const activities = await prisma.leadActivity.findMany({
      where: { leadId: leadId },
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
