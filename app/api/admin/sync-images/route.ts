import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Get all employees that have images
    const employees = await prisma.employee.findMany({
      where: { imageUrl: { not: null } },
      select: { email: true, imageUrl: true },
    });

    let updatedCount = 0;

    // 2. Loop through and update the corresponding User
    for (const emp of employees) {
      if (emp.imageUrl) {
        await prisma.user.updateMany({
          where: { email: emp.email },
          data: { imageUrl: emp.imageUrl },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${updatedCount} user images.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
