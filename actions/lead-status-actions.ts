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


export async function moveLeadStatus(
  leadId: string,
  statusId: string,
  lossReason?: string,
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, companyId: true, role: true },
  });

  if (!dbUser) return { success: false, error: "User not found" };

  // 1. Fetch Target Status to check Boolean flags (isWon/isClosing)
  const targetStatus = await prisma.leadStatus.findUnique({
    where: { id: statusId },
  });

  if (!targetStatus || targetStatus.companyId !== dbUser.companyId) {
    return { success: false, error: "Invalid target status" };
  }

  // Determine Move Type based on Schema Flags
  const isLost = targetStatus.isClosing && !targetStatus.isWon;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 2. Update the Lead
      const updatedLead = await tx.lead.update({
        where: {
          id: leadId,
          companyId: dbUser.companyId, // Security: Ensure lead belongs to company
        },
        data: {
          statusId: statusId,
          // CRM LOGIC: If lost, move back to enquiry and save reason
          isEnquiry: isLost ? true : undefined,
          lossReason: isLost ? lossReason : null,
        },
      });

      // 3. Create LeadActivity record for the history section
      await tx.leadActivity.create({
        data: {
          leadId: leadId,
          userId: dbUser.id,
          type: isLost ? "LEAD_LOST" : "STATUS_CHANGE",
          content: `Moved to stage: ${targetStatus.label}`,
          remarks: isLost
            ? `Loss Reason: ${lossReason}`
            : "Pipeline transition",
        },
      });

      return updatedLead;
    });

    revalidatePath("/pipeline");
    revalidatePath("/enquiries");

    return { success: true, lead: result };
  } catch (error) {
    console.error("Move Lead Error:", error);
    return { success: false, error: "Failed to update lead position" };
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

export async function reorderLeadStatuses(
  companyId: string,
  statusOrders: { id: string; order: number }[],
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
    // Update all statuses with new order
    await prisma.$transaction(
      statusOrders.map((status) =>
        prisma.leadStatus.update({
          where: { id: status.id },
          data: { order: status.order },
        }),
      ),
    );

    revalidatePath("/pipeline");
    revalidatePath("/enquiries");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error("Error reordering lead statuses:", error);
    return { success: false, error: "Failed to reorder statuses" };
  }
}
