//  Purpose: This is for the Client (Company Admin), not for you (the Super Admin).

//  Use Case: This allows a specific company to change their own internal logic, like setting their employee ID prefix from EMP- to DXB-.

//  Context: It revalidates /settings, meaning it's likely used inside the company's "Workspace Settings" page.

"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCompanyERPConfig(
  companyId: string,
  data: { prefix: string; nextNumber: number },
) {
  await prisma.company.update({
    where: { id: companyId },
    data: {
      empIdPrefix: data.prefix.toUpperCase(),
      nextEmpNumber: data.nextNumber,
    },
  });
  revalidatePath("/settings");
}
