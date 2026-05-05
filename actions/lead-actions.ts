"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";


export async function createLead(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return { success: false, error: "Profile not found" };

  // 1. Extract the new fields
  const isEnquiry = formData.get("isEnquiry") === "true";
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const clientCompany = formData.get("clientCompany") as string;
  const natureOfBusiness = formData.get("natureOfBusiness") as string;
  const designation = formData.get("designation") as string;
  const source = formData.get("source") as string;
  const notes = formData.get("notes") as string;
  const value = parseFloat(formData.get("value") as string) || 0;
  const assignedToId = formData.get("assignedToId") as string;
  const startDateRaw = formData.get("startDate") as string;

  // FIX: Parse the multi-product JSON string
  const productIdsRaw = formData.get("productIds") as string;
  const productIds: string[] = JSON.parse(productIdsRaw || "[]");

const isEmpty = (val: string | null) => !val || !val.trim();

if (isEnquiry) {
  if (isEmpty(name) || isEmpty(phone)) {
    return {
      success: false,
      error: "Name and Phone are required for enquiries.",
    };
  }
} else {
  if (isEmpty(name) || isEmpty(phone) || isEmpty(email)) {
    return {
      success: false,
      error: "Name, Phone and Email are required for leads.",
    };
  }
}

  // 2. Resolve Assignment (Keep current logic)
  let finalAssignedId = assignedToId === "none" ? null : assignedToId;
  if (!finalAssignedId && dbUser.role === "SALES_EXECUTIVE") {
    finalAssignedId = dbUser.id;
  }

  // 3. Status Logic (Keep current logic)
  let statusId = null;
  if (!isEnquiry) {
    const newStatus = await prisma.leadStatus.findFirst({
      where: { companyId: dbUser.companyId, label: "NEW" },
    });
    statusId = newStatus?.id;
  }

  try {
    await prisma.lead.create({
      data: {
        isEnquiry,
        name,
        email,
        phone,
        clientCompany,
        natureOfBusiness,
        designation,
        source,
        notes,
        value,
        statusId,
        companyId: dbUser.companyId,
        ownerId: dbUser.id,
        assignedToId: finalAssignedId,
        startDate: startDateRaw ? new Date(startDateRaw) : new Date(),
        // FIX: Connect multiple products using the parsed array
        ...(productIds.length > 0 &&
          !isEnquiry && {
            products: {
              connect: productIds.map((id) => ({ id })),
            },
          }),
      },
    });

    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return { success: false, error: "Failed to save entry." };
  }
}


export async function convertEnquiryToLead(leadId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

    // Get the default "NEW" status for leads
    const initialStatus = await prisma.leadStatus.findFirst({
      where: { companyId: dbUser?.companyId, label: "NEW" },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        isEnquiry: false,
        statusId: initialStatus?.id,
        // Log the activity
        activities: {
          create: {
            type: "STATUS_CHANGE",
            content: "Converted Enquiry to Sales Lead",
            userId: dbUser?.id as string,
          },
        },
      },
    });

    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Conversion failed" };
  }
}


// lead-actions.ts
export async function updateLeadDetails(leadId: string, data: any) {
  try {
    // Parse the product IDs from the stringified array
    const productIds = data.productIds ? JSON.parse(data.productIds) : [];

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        designation: data.designation,
        clientCompany: data.clientCompany,
        value: parseFloat(data.value) || 0,
        assignedToId: data.assignedToId || null,
        // Use 'set' to replace old products with the new list
        products: {
          set: productIds.map((id: string) => ({ id })),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update lead" };
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