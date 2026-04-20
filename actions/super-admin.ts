"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export async function registerNewTenant(formData: FormData) {
  const { userId } = await auth();

  // 1. Fetch the sender (Super Admin)
  const sender = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });

  if (sender?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized access." };
  }

  const companyName = formData.get("companyName") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminName = formData.get("adminName") as string;
  const plan = formData.get("plan") as string;

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the Company
      const company = await tx.company.create({
        data: {
          name: companyName,
          plan: plan || "BASIC",
        },
      });

      // Create Lead Statuses (Default Pipeline)
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

      // Create the Admin User (Shadow Record)
      await tx.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          role: "ADMIN",
          companyId: company.id,
          status: "PENDING",
        },
      });

      // Create the Invitation
      // NOTE: Using lowercase 'companyInvitation' as per Prisma naming conventions
      await (tx as any).companyInvitation.create({
        data: {
          companyId: company.id,
          email: adminEmail,
          name: adminName,
          role: "ADMIN",
          invitedBy: sender.id, // Fixed: accessing sender.id directly
          status: "PENDING",
        },
      });
    });

    revalidatePath("/super-admin");
    return {
      success: true,
      message: `Company "${companyName}" ready!`,
    };
  } catch (error: any) {
    console.error("DETAILED PRISMA ERROR:", error);

    if (error.code === "P2002") {
      return {
        success: false,
        error: `Conflict: This ${error.meta?.target} already exists.`,
      };
    }

    return {
      success: false,
      error: error.message || "Database synchronization failed.",
    };
  }
}
