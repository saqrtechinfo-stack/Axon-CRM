"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export async function registerNewTenant(formData: FormData) {
  const { userId } = await auth();

  const sender = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });

  if (sender?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized access." };
  }

  // Extract all fields
  const companyName = formData.get("companyName") as string;
  const domain = formData.get("domain") as string;
  const logo = formData.get("logo") as string;
  const address = formData.get("address") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminPhone = formData.get("contactPhone") as string;
  const adminName = formData.get("adminName") as string;
  const plan = formData.get("plan") as string;
  const subscriptionEnd = formData.get("subscriptionEnd") as string;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create the Company with full branding
      const company = await tx.company.create({
        data: {
          name: companyName,
          domain: domain || null,
          logo: logo || null,
          address: address || null,
          plan: plan || "BASIC",
          status: "ACTIVE",
          subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : null,
          contactEmail: adminEmail,
          contactPhone: adminPhone,
        },
      });

      // 2. Default Lead Pipeline
      await tx.leadStatus.createMany({
        data: [
          {
            companyId: company.id,
            label: "NEW",
            color: "#3b82f6",
            order: 0,
            isClosing: false,
            isWon: false,
          },
          {
            companyId: company.id,
            label: "CONTACTED",
            color: "#f59e0b",
            order: 1,
            isClosing: false,
            isWon: false,
          },
          {
            companyId: company.id,
            label: "WON",
            color: "#10b981",
            order: 2,
            isClosing: true,
            isWon: true,
          },
          {
            companyId: company.id,
            label: "LOST",
            color: "#ef4444",
            order: 3,
            isClosing: true,
            isWon: false,
          },
        ],
      });

      // 3. Admin Shadow User (Changed to upsert to prevent unique email crash)
      await tx.user.upsert({
        where: { email: adminEmail },
        update: {
          role: "ADMIN",
          companyId: company.id,
          status: "PENDING",
        },
        create: {
          email: adminEmail,
          name: adminName,
          role: "ADMIN",
          companyId: company.id,
          status: "PENDING",
        },
      });

      // 4. Invitation logic (Changed to upsert to prevent unique constraint crash)
      await (tx as any).companyInvitation.upsert({
        where: {
          email_companyId: {
            email: adminEmail,
            companyId: company.id,
          },
        },
        update: {
          status: "PENDING",
        },
        create: {
          companyId: company.id,
          email: adminEmail,
          name: adminName,
          role: "ADMIN",
          invitedBy: sender.id,
          status: "PENDING",
        },
      });
    });

    revalidatePath("/super-admin");
    return {
      success: true,
      message: `Tenant ${companyName} successfully deployed.`,
    };
  } catch (error: any) {
    console.error("ONBOARDING_ERROR:", error);
    return {
      success: false,
      error: "Deployment failed. Ensure domain/email is unique.",
    };
  }
}

export async function updateCompanyProfile(
  companyId: string,
  formData: FormData,
) {
  const { userId } = await auth();
  const sender = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });
  if (sender?.role !== "SUPER_ADMIN")
    return { success: false, error: "Unauthorized" };

  try {
    await prisma.company.update({
      where: { id: companyId },
      data: {
        name: formData.get("name") as string,
        domain: formData.get("domain") as string,
        logo: formData.get("logo") as string,
        address: formData.get("address") as string,
        plan: formData.get("plan") as string,
        contactEmail: formData.get("contactEmail") as string,
        contactPhone: formData.get("contactPhone") as string,
        empIdPrefix: formData.get("empIdPrefix") as string,
        subscriptionEnd: formData.get("subscriptionEnd")
          ? new Date(formData.get("subscriptionEnd") as string)
          : null,
      },
    });

    revalidatePath("/super-admin");
    return { success: true, message: "Tenant configuration synced." };
  } catch (error) {
    return { success: false, error: "Sync failed." };
  }
}

export async function toggleCompanyStatus(
  companyId: string,
  currentStatus: string,
) {
  const { userId } = await auth();
  const sender = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });
  if (sender?.role !== "SUPER_ADMIN")
    return { success: false, error: "Unauthorized" };

  const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  await prisma.company.update({
    where: { id: companyId },
    data: { status: newStatus as any },
  });
  revalidatePath("/super-admin");
  return { success: true };
}
