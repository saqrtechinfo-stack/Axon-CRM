"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createLeadStatus(
  companyId: string,
  data: { label: string; color: string; order: number },
) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify user belongs to the company
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser || dbUser.companyId !== companyId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const status = await prisma.leadStatus.create({
      data: {
        ...data,
        companyId,
      },
    });

    revalidatePath("/pipeline");
    revalidatePath("/enquiries");
    revalidatePath("/settings");

    return { success: true, status };
  } catch (error) {
    console.error("Error creating lead status:", error);
    return { success: false, error: "Failed to create status" };
  }
}

export async function updateLeadStatus(
  id: string,
  data: { label?: string; color?: string },
) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // Get the status to verify ownership
  const status = await prisma.leadStatus.findUnique({
    where: { id },
  });

  if (!status) {
    return { success: false, error: "Status not found" };
  }

  // Verify user belongs to the company
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser || dbUser.companyId !== status.companyId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedStatus = await prisma.leadStatus.update({
      where: { id },
      data,
    });

    revalidatePath("/pipeline");
    revalidatePath("/enquiries");
    revalidatePath("/settings");

    return { success: true, status: updatedStatus };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteLeadStatus(id: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // Get the status to verify ownership
  const status = await prisma.leadStatus.findUnique({
    where: { id },
  });

  if (!status) {
    return { success: false, error: "Status not found" };
  }

  // Verify user belongs to the company
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser || dbUser.companyId !== status.companyId) {
    return { success: false, error: "Unauthorized" };
  }

  // Don't allow deletion if there are leads using this status
  const leadsCount = await prisma.lead.count({
    where: { statusId: id },
  });

  if (leadsCount > 0) {
    return {
      success: false,
      error: "Cannot delete status that has leads assigned to it",
    };
  }

  try {
    await prisma.leadStatus.delete({
      where: { id },
    });

    revalidatePath("/pipeline");
    revalidatePath("/enquiries");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error("Error deleting lead status:", error);
    return { success: false, error: "Failed to delete status" };
  }
}
