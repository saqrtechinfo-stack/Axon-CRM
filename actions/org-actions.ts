"use server";

import {prisma} from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Department
export async function createDepartment(data: {
  name: string;
  parentId?: string | null;
  managerId?: string | null;
}) {
  const { userId } = await auth();
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId! },
    select: { companyId: true },
  });

  if (!dbUser) return { success: false, error: "Unauthorized" };

  try {
    await prisma.department.create({
      data: {
        name: data.name,
        companyId: dbUser.companyId,
        parentId: data.parentId || null,
        managerId: data.managerId || null,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: "Failed to create unit. Name might be duplicate.",
    };
  }
}

export async function updateDepartment(
  id: string,
  data: {
    name?: string;
    parentId?: string | null;
    managerId?: string | null;
  },
) {
  try {
    await prisma.department.update({
      where: { id },
      data: {
        ...data,
        parentId: data.parentId === "none" ? null : data.parentId,
        managerId: data.managerId === "none" ? null : data.managerId,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Update failed." };
  }
}


// actions/org-actions.ts
export async function deleteDepartment(id: string) {
  try {
    // Note: This will fail if there are employees or sub-departments 
    // depending on your Prisma 'onDelete' settings.
    await prisma.department.delete({ where: { id } });
    revalidatePath("/settings"); // adjust path accordingly
    return { success: true };
  } catch (error: any) {
    return { error: "Cannot delete unit with active staff or sub-divisions." };
  }
}

//Designation
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
