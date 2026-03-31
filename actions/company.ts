// lib/actions/company.ts
"use server"; // <--- CHANGE THIS FROM "use client" TO "use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCompany(formData: FormData) {
  const name = formData.get("name") as string;
  const plan = formData.get("plan") as string;

  if (!name || !plan) return { error: "Missing fields" };

  try {
    await prisma.company.create({
      data: {
        name,
        plan,
      },
    });

    // This tells Next.js to refresh the data on the Super Admin page
    revalidatePath("/super-admin");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Company name already exists" };
  }
}
