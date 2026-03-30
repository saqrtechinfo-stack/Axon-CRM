// actions/lead-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLead(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;
  const value = parseFloat(formData.get("value") as string) || 0;

  try {
    await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        value,
        status: "NEW", // Default status
      },
    });

    // This refreshes the page data automatically
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
}

// actions/lead-actions.ts (Add this function)

export async function updateLeadStatus(id: string, newStatus: any) {
  try {
    // Log for debugging (Check your terminal when you drag)
    console.log(`Updating Lead ${id} to ${newStatus}`);

    await prisma.lead.update({
      where: { id: id },
      data: { status: newStatus },
    });

    revalidatePath("/pipeline");
    revalidatePath("/enquiries");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return { success: false };
  }
}

// actions/lead-actions.ts

export async function updateLeadNotes(id: string, notes: string) {
  try {
    await prisma.lead.update({
      where: { id },
      data: { notes },
    });
    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}