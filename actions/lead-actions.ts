"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";


export async function createLead(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) return { success: false, error: "Profile not found" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const clientCompany = formData.get("company") as string;
  const designation = formData.get("designation") as string;
  const notes = formData.get("notes") as string;
  const value = parseFloat(formData.get("value") as string) || 0;

  // VISIBILITY FIX:
  // If the creator is not an Admin, assign the lead to them automatically.
  const assignedToId = dbUser.role === "SALES_EXECUTIVE" ? dbUser.id : null;

  const newStatus = await prisma.leadStatus.findFirst({
    where: { companyId: dbUser.companyId, label: "NEW" },
  });

  try {
    await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        clientCompany: clientCompany || null,
        designation: designation || null,
        notes: notes || null,
        value,
        statusId: newStatus?.id,
        companyId: dbUser.companyId,
        ownerId: dbUser.id,
        assignedToId: assignedToId, // CRITICAL: This ensures employees see their created leads
      },
    });

    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    console.error("Creation Error:", error);
    return { success: false, error: "Failed to create lead." };
  }
}

export async function updateLeadDetails(id: string, data: any) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await prisma.lead.update({
      where: { id },
      data: {
        name: data.name || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        clientCompany: data.company || undefined,
        designation: data.designation || undefined,
        value: parseFloat(data.value) || undefined,
      },
    });

    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false };
  }
}

export async function updateLeadStatus(
  leadId: string,
  statusId: string,
  remarks?: string,
) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

  try {
    const newStatus = await prisma.leadStatus.findUnique({
      where: { id: statusId },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        statusId: statusId,
        activities: {
          create: {
            type: "STATUS_CHANGE",
            content: `Moved to ${newStatus?.label}`,
            remarks: remarks || "Status updated via Pipeline/Table.",
            userId: dbUser!.id,
          },
        },
      },
    });

    revalidatePath("/enquiries");
    revalidatePath("/pipeline");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

// Separate Action for just adding a Remark
export async function addLeadRemark(leadId: string, remarks: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error("❌ REMARK FAIL: No Clerk UserID found in session");
      return { success: false, error: "Unauthorized" };
    }

    // 1. Find the internal Database User ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      console.error(
        "❌ REMARK FAIL: Clerk ID exists but no matching User in Prisma for:",
        userId,
      );
      return { success: false, error: "User profile not found in DB" };
    }

    // 2. Create the Activity
    const activity = await prisma.leadActivity.create({
      data: {
        type: "REMARK_ADDED",
        content: "New remark added to lead",
        remarks: remarks,
        leadId: leadId,
        userId: dbUser.id, // This MUST be the internal UUID/CUID from the User table
      },
    });

    console.log("✅ REMARK SAVED:", activity.id);

    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    // This will show the specific Prisma error in your VS Code terminal
    console.error("❌ PRISMA ERROR SAVING REMARK:", error);
    return { success: false, error: "Database save failed" };
  }
}
export async function updateLeadNotes(id: string, notes: string) {
  try {
    await prisma.lead.update({
      where: { id },
      data: { notes },
    });
    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR updating notes:", error);
    return { success: false };
  }
}

export async function updateLeadFollowUp(
  id: string,
  date: Date,
  remarks: string,
) {
  const { userId } = await auth();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId! } });

  await prisma.lead.update({
    where: { id },
    data: {
      nextFollowUp: date,
      activities: {
        create: {
          type: "FOLLOW_UP_SCHEDULED",
          content: `Follow-up scheduled for ${date.toLocaleDateString()}`,
          remarks: remarks,
          userId: dbUser!.id,
        },
      },
    },
  });
  revalidatePath("/enquiries");
}


// Assign Lead. 
export async function assignLead(leadId: string, employeeUserId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const currentUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (
    !currentUser ||
    !["ADMIN", "MANAGER", "SUPER_ADMIN"].includes(currentUser.role)
  ) {
    throw new Error("Insufficient permissions to assign leads");
  }

  // Update lead and create activity in one transaction
  await prisma.$transaction([
    prisma.lead.update({
      where: { id: leadId },
      data: {
        assignedToId: employeeUserId,
        // Optional: Track when it was assigned
      },
    }),
    prisma.leadActivity.create({
      data: {
        leadId,
        userId: currentUser.id,
        type: "DETAILS_UPDATED",
        content: `Lead assigned to ${employeeUserId}`,
        remarks: `Assigned by ${currentUser.name}`,
      },
    }),
  ]);

  revalidatePath("/enquiries");
  return { success: true };
}