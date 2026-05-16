//  Purpose: This is for the Client (Company Admin), not for you (the Super Admin).

//  Use Case: This allows a specific company to change their own internal logic, like setting their employee ID prefix from EMP- to DXB-.

//  Context: It revalidates /settings, meaning it's likely used inside the company's "Workspace Settings" page.

"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
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

export async function updateCompanyQuotationSettings(data: any) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { companyId: true, role: true },
  });

  // Only admin can change company settings
  if (!["ADMIN", "SUPER_ADMIN"].includes(dbUser?.role || "")) {
    return { success: false, error: "Insufficient permissions" };
  }

  try {
    await prisma.company.update({
      where: { id: dbUser!.companyId },
      data: {
        quotationPrefix: data.quotationPrefix,
        defaultValidDays: parseInt(data.defaultValidDays),
        defaultVatPercent: parseFloat(data.defaultVatPercent),
        accountName: data.accountName,
        bankName: data.bankName,
        bankBranch: data.bankBranch,
        accountNo: data.accountNo,
        iban: data.iban,
        swiftCode: data.swiftCode,
        website: data.website,
        quotationFooter: data.quotationFooter,
        quotationTerms: data.quotationTerms,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to save settings" };
  }
}