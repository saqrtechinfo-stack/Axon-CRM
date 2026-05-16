"use server"; // ✅ Missing — required for server actions

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// ─────────────────────────────────────────
// CREATE QUOTATION
// ─────────────────────────────────────────
export async function createQuotation(leadId: string, data: any) {
  // ✅ Auth — was completely missing
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true },
  });
  if (!dbUser) return { success: false, error: "User not found" };

  const company = await prisma.company.findUnique({
    where: { id: dbUser.companyId },
    select: { quotationPrefix: true },
  });

  // Generate qId: PREFIX/YYYYDDMM + sequence
  const prefix = company?.quotationPrefix || "QT";
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}`;

  const count = await prisma.quotation.count({
    where: { companyId: dbUser.companyId },
  });
  const sequence = String(count + 1).padStart(4, "0");
  const qId = `${prefix}/${dateStr}${sequence}`;

  try {
    const quotation = await prisma.quotation.create({
      data: {
        qId,
        leadId,
        companyId: dbUser.companyId,
        createdById: dbUser.id,
        subject: data.subject,
        attention: data.attention,
        notes: data.notes,
        subTotal: parseFloat(data.subTotal) || 0,
        taxAmount: parseFloat(data.taxAmount) || 0,
        discount: parseFloat(data.discount) || 0,
        totalAmount: parseFloat(data.totalAmount) || 0,
        validDays: data.validDays || 15,
        vatPercent: data.vatPercent || 5,
        status: "DRAFT",
        version: 1,
        items: {
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: parseFloat(item.quantity) * parseFloat(item.unitPrice),
          })),
        },
      },
    });

    revalidatePath("/enquiries");
    return { success: true, data: quotation };
  } catch (error) {
    console.error("CREATE_QUOTATION_ERROR:", error);
    return { success: false, error: "Failed to create quotation" };
  }
}

// ─────────────────────────────────────────
// UPDATE QUOTATION
// ─────────────────────────────────────────
export async function updateQuotation(quotationId: string, data: any) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true },
  });
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const existing = await prisma.quotation.findUnique({
      where: { id: quotationId },
    });

    if (!existing) return { success: false, error: "Quotation not found" };

    // If already sent/accepted — create a new version instead of editing
    if (existing.status !== "DRAFT") {
      const newQuotation = await prisma.quotation.create({
        data: {
          qId: existing.qId,
          leadId: existing.leadId,
          companyId: existing.companyId,
          createdById: dbUser.id,
          status: "DRAFT",
          version: existing.version + 1, // ✅ increment version
          subject: data.subject,
          attention: data.attention,
          notes: data.notes,
          subTotal: parseFloat(data.subTotal) || 0,
          taxAmount: parseFloat(data.taxAmount) || 0,
          discount: parseFloat(data.discount) || 0,
          totalAmount: parseFloat(data.totalAmount) || 0,
          validDays: data.validDays || 15,
          vatPercent: data.vatPercent || 5,
          items: {
            create: data.items.map((item: any) => ({
              description: item.description,
              quantity: parseFloat(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              total: parseFloat(item.quantity) * parseFloat(item.unitPrice),
            })),
          },
        },
      });

      revalidatePath("/enquiries");
      return { success: true, data: newQuotation, newVersion: true };
    }

    // DRAFT — edit in place, delete old items and recreate
    await prisma.$transaction([
      // Delete existing items
      prisma.quotationItem.deleteMany({
        where: { quotationId },
      }),
      // Update quotation
      prisma.quotation.update({
        where: { id: quotationId },
        data: {
          subject: data.subject,
          attention: data.attention,
          notes: data.notes,
          subTotal: parseFloat(data.subTotal) || 0,
          taxAmount: parseFloat(data.taxAmount) || 0,
          discount: parseFloat(data.discount) || 0,
          totalAmount: parseFloat(data.totalAmount) || 0,
          validDays: data.validDays || 15,
          vatPercent: data.vatPercent || 5,
          items: {
            create: data.items.map((item: any) => ({
              description: item.description,
              quantity: parseFloat(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              total: parseFloat(item.quantity) * parseFloat(item.unitPrice),
            })),
          },
        },
      }),
    ]);

    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    console.error("UPDATE_QUOTATION_ERROR:", error);
    return { success: false, error: "Failed to update quotation" };
  }
}

// ─────────────────────────────────────────
// UPDATE QUOTATION STATUS
// ─────────────────────────────────────────
export async function updateQuotationStatus(
  quotationId: string,
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED",
) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true },
  });
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    await prisma.quotation.update({
      where: { id: quotationId, companyId: dbUser.companyId },
      data: { status },
    });

    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

// ─────────────────────────────────────────
// DELETE QUOTATION
// ─────────────────────────────────────────
export async function deleteQuotation(quotationId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true },
  });
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    // Only allow deleting DRAFT quotations
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
    });

    if (quotation?.status !== "DRAFT") {
      return { success: false, error: "Only draft quotations can be deleted" };
    }

    await prisma.quotation.delete({
      where: { id: quotationId, companyId: dbUser.companyId },
    });

    revalidatePath("/enquiries");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete quotation" };
  }
}

// ─────────────────────────────────────────
// GET QUOTATIONS FOR A LEAD
// ─────────────────────────────────────────
export async function getLeadQuotations(leadId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const quotations = await prisma.quotation.findMany({
      where: { leadId },
      include: {
        items: true,
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ version: "desc" }, { createdAt: "desc" }],
    });

    return quotations;
  } catch (error) {
    console.error("GET_QUOTATIONS_ERROR:", error);
    return [];
  }
}
