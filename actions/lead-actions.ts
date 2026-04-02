"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createLead(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Find the logged-in staff member in our DB to get their SaaS companyId
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    console.error("User not found in database for ClerkID:", userId);
    return {
      success: false,
      error: "User profile not found. Please sync your ClerkID in Supabase.",
    };
  }

  // 2. Extract and validate form data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const companyInput = formData.get("company") as string; // This is the TEXT from the input
  const value = parseFloat(formData.get("value") as string) || 0;

  // 3. Find the default "NEW" status for this company
  const newStatus = await prisma.leadStatus.findFirst({
    where: {
      companyId: dbUser.companyId,
      label: "NEW",
    },
  });

  if (!newStatus) {
    return {
      success: false,
      error: "Default lead status not found. Please contact admin.",
    };
  }

  try {
    await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || "",
        // This is the string field we added to the schema to avoid the "Company relation" error
        clientCompany: companyInput,
        value,
        statusId: newStatus.id,
        // This links the lead to the main Company (SaaS Tenant)
        companyId: dbUser.companyId,
      },
    });

    // Refresh all relevant paths
    revalidatePath("/");
    revalidatePath("/enquiries");
    revalidatePath("/pipeline");

    return { success: true };
  } catch (error) {
    console.error("Database Error creating lead:", error);
    return { success: false, error: "Failed to create lead." };
  }
}

export async function updateLeadStatus(id: string, newStatusId: string) {
  try {
    await prisma.lead.update({
      where: { id: id },
      data: { statusId: newStatusId },
    });

    revalidatePath("/pipeline");
    revalidatePath("/enquiries");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR updating status:", error);
    return { success: false };
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
