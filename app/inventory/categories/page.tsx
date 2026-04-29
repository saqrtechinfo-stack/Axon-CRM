import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CategoryTab } from "@/components/admin/settings/CategoryTab";
import { Layers, Info, TrendingUp, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";

// 🔥 OPTIMIZATION: Cache for 60 seconds.
// Inventory structure is "Slow Data"—it doesn't change often.
export const revalidate = 60;

export default async function CategoriesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 🔥 OPTIMIZATION 1: Selective Select.
  // Don't pull the whole company object; we only need the IDs for filtering.
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      companyId: true,
      role: true,
    },
  });

  if (!dbUser || !["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    redirect("/");
  }

  // 🔥 OPTIMIZATION 2: Aggregated Count.
  // Prisma's _count happens at the DB level, not in your Node.js memory.
  const categories = await prisma.category.findMany({
    where: { companyId: dbUser.companyId },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Derived stats for the UI
  const totalCategories = categories.length;
  const totalProducts = categories.reduce(
    (acc, cat) => acc + cat._count.products,
    0,
  );
  const avgDensity =
    totalCategories > 0 ? (totalProducts / totalCategories).toFixed(1) : "0";

  return (
    <div className="p-8 md:p-12 space-y-10 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600 font-black italic uppercase tracking-[0.2em]">
            <Layers className="h-5 w-5" />
            {/* <span className="text-[10px]">Al Saqr Tech ERP</span> */}
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase text-slate-900 leading-[0.8] mb-2">
            Stock <span className="text-blue-600">Categories</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg text-sm leading-relaxed">
            Define high-level groupings for your inventory. Proper
            categorization improves lead conversion tracking and VAT compliance
            for UAE reporting.
          </p>
        </div>

        {/* Dynamic Stats Cluster */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <StatCard
            label="Total Groups"
            value={totalCategories}
            icon={<Layers className="h-4 w-4" />}
          />
          <StatCard
            label="Items Linked"
            value={totalProducts}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            label="Avg Density"
            value={`${avgDensity}x`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Main Management Interface */}
      <div className="max-w-6xl bg-white rounded-[2.5rem] p-3 border border-slate-200/60 shadow-xl shadow-slate-200/20">
        <CategoryTab categories={categories} />
      </div>

      {/* Logic Documentation / Pro-Tip */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-slate-900 text-white rounded-[2.5rem] max-w-6xl shadow-2xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Layers className="h-32 w-32 rotate-12" />
        </div>

        <div className="p-4 bg-blue-600 rounded-2xl relative z-10">
          <Info className="h-6 w-6 text-white" />
        </div>

        <div className="space-y-1 relative z-10">
          <p className="text-sm font-black uppercase tracking-widest text-blue-400 italic">
            Architectural Note
          </p>
          <p className="text-xs text-slate-300 leading-relaxed font-medium max-w-2xl">
            For Al Saqr Technologies, keep categories aligned with your
            **General Ledger** headings. When a lead is converted to a sale, the
            category data flows directly into your sync logic for **Tally ERP**
            or custom accounting exports.
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable micro-component for header stats
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-[140px] bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className="text-xl font-black italic text-slate-900 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
