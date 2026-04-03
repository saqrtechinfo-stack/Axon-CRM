// app/inventory/categories/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CategoryTab } from "@/components/admin/settings/CategoryTab";
import { Layers, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
    console.log("DEBUG: Prisma object is:", prisma);
  const { userId } = await auth();
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId! },
    include: { company: true },
  });

  if (!dbUser || !["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    where: { companyId: dbUser.companyId },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 md:p-12 space-y-10 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Layers className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Inventory System
            </span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-slate-900">
            Product <span className="text-blue-600">Categories</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-md">
            Organize your inventory for Al Saqr Technologies to enable advanced
            lead filtering and reporting.
          </p>
        </div>

        {/* Quick Stats Mini-Card */}
        <div className="hidden md:flex gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Categories
            </p>
            <p className="text-2xl font-black italic text-slate-900">
              {categories.length}
            </p>
          </div>
          <div className="w-[1px] bg-slate-100" />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Avg. Products/Cat
            </p>
            <p className="text-2xl font-black italic text-slate-900">
              {categories.length > 0
                ? (
                    categories.reduce(
                      (acc, cat) => acc + cat._count.products,
                      0,
                    ) / categories.length
                  ).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Re-using the logic from our CategoryTab but in a full-page view */}
      <div className="max-w-5xl">
        <CategoryTab categories={categories} />
      </div>

      {/* Pro-Tip section for Top ERP feel */}
      <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 max-w-5xl">
        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-tight text-blue-900 italic">
            ERP Pro-Tip
          </p>
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            Use broad categories like "Software Licenses" or "Hardware Parts."
            This allows your sales team to filter new enquiries instantly by the
            brand or service type they are interested in.
          </p>
        </div>
      </div>
    </div>
  );
}
