import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AddProductModal } from "@/components/admin/inventory/AddProductModal";
import { ProductTable } from "@/components/admin/inventory/ProductTable";
import { Package2 } from "lucide-react";

export default async function ProductsPage() {
  const { userId } = await auth();
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId! },
  });

  if (!dbUser) redirect("/");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { companyId: dbUser.companyId },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { companyId: dbUser.companyId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="p-8 md:p-12 space-y-10 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Package2 className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Operational Catalog
            </span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-slate-900">
            Product <span className="text-blue-600">Inventory</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Define your offerings for accurate quotations.
          </p>
        </div>

        <AddProductModal categories={categories} />
      </div>

      <ProductTable products={products} categories={categories} />
    </div>
  );
}
