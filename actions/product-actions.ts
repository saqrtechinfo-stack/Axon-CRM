"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// CATEGORY--------------------------------------------------
export async function createCategory(name: string) {
  const { userId } = await auth();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId! } });

  await prisma.category.create({
    data: {
      name,
      companyId: dbUser!.companyId,
    },
  });
  revalidatePath("/settings");
}

export async function deleteCategory(id: string) {
  try {
    // Top ERP Practice: Check for dependencies before deleting
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new Error("Cannot delete category with linked products.");
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/inventory/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id: string, name: string) {
  await prisma.category.update({
    where: { id },
    data: { name },
  });
  revalidatePath("/inventory/categories");
}

// PRODUCT--------------------------------------------------
export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  unit: string;
  categoryId: string;
}) {
  const { userId } = await auth();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId! } });

  if (!dbUser) throw new Error("Unauthorized");

  await prisma.product.create({
    data: {
      ...data,
      companyId: dbUser.companyId,
    },
  });

  revalidatePath("/inventory/products");
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    description?: string;
    price: number;
    unit: string;
    categoryId: string;
  },
) {
  await prisma.product.update({
    where: { id },
    data,
  });
  revalidatePath("/inventory/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/inventory/products");
}