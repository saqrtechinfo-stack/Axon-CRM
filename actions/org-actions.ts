"use server";

import {prisma} from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createDepartment(name: string) {
  const { userId } = await auth();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId! } });

  try {
    await prisma.department.create({
      data: {
        name,
        companyId: dbUser!.companyId,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create department." };
  }
}

export async function createDesignation(name: string) {
  const { userId } = await auth();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId! } });

  try {
    await prisma.designation.create({
      data: {
        name,
        companyId: dbUser!.companyId,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create designation." };
  }
}
