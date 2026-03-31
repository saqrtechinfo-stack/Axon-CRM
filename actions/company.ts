// lib/actions/company.ts
"use client"; // If using as a client action, or remove if using 'use server' inside a dedicated file

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
    revalidatePath("/super-admin");
    return { success: true };
  } catch (error) {
    return { error: "Company name already exists" };
  }
}
