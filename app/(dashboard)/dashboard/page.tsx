// app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { redirect } from "next/navigation";

// 🔥 OPTIMIZATION 1: Cache this page for 60 seconds.
export const revalidate = 60;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId || "" },
    select: { role: true, companyId: true }, // Only fetch what we need
  });

  if (!dbUser) redirect("/sign-in");
  // 🔥 OPTIMIZATION 2: Database-side Aggregation
  // We fetch counts and sums directly from Postgres.
  const commonWhere =
    dbUser.role === "SUPER_ADMIN" ? {} : { companyId: dbUser.companyId };

  const [stats, statusCounts] = await Promise.all([
    prisma.lead.aggregate({
      where: commonWhere,
      _sum: { value: true },
      _count: { id: true },
    }),
    prisma.lead.groupBy({
      by: ["statusId"],
      where: commonWhere,
      _sum: { value: true },
      _count: { id: true },
    }),
  ]);

  // Fetch status labels to map them back to the grouped data
  const statusLabels = await prisma.leadStatus.findMany({
    where: commonWhere,
    select: { id: true, label: true },
  });

  // Calculate high-level stats
  const totalValue = stats._sum.value || 0;
  const totalLeads = stats._count.id || 0;

  // const wonStatus = statusLabels.find((s) => s.label === "WON");
  // const wonData = statusCounts.find((s) => s.statusId === wonStatus?.id);
  // const wonValue = wonData?._sum.value || 0;
  // const wonCount = wonData?._count.id || 0;
  // Find the "WON" status ID safely
  const wonStatus = statusLabels.find((s) => s.label.toUpperCase() === "WON");
  const wonData = statusCounts.find((s) => s.statusId === wonStatus?.id);

  const wonValue = wonData?._sum.value ? Number(wonData._sum.value) : 0;
  const wonCount = wonData?._count.id || 0;

  const winRate = totalLeads > 0 ? (wonCount / totalLeads) * 100 : 0;

  // Format Chart Data
  const stages = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON"];

  // const chartData = stages.map((stageName) => {
  //   const statusId = statusLabels.find((s) => s.label === stageName)?.id;
  //   const data = statusCounts.find((s) => s.statusId === statusId);
  //   return {
  //     name: stageName,
  //     value: data?._sum.value || 0,
  //   };
  // });
  // 🔥 FIX: Use .toUpperCase() to ensure matching works regardless of DB casing
  const chartData = stages.map((stageName) => {
    const status = statusLabels.find(
      (s) => s.label.toUpperCase() === stageName.toUpperCase(),
    );

    const data = statusCounts.find((s) => s.statusId === status?.id);

    return {
      name: stageName,
      // Prisma _sum can return a Decimal object or null; ensure it's a clean number
      value: data?._sum.value ? Number(data._sum.value) : 0,
    };
  });

  console.log("DEBUG_DASHBOARD:", {
    totalValue,
    statusCountsLength: statusCounts.length,
    mappedChartData: chartData,
  });
  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
            Dashboard
          </h1>
          {/* <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Al Saqr Tech Live Performance
          </p> */}
        </div>
        {/* <CreateLeadModal /> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Pipeline Value"
          value={`$${totalValue.toLocaleString()}`}
          description="Gross potential"
        />
        <StatCard
          label="Revenue Won"
          value={`$${wonValue.toLocaleString()}`}
          description="Converted deals"
          color="text-emerald-600"
        />
        <StatCard
          label="Efficiency"
          value={`${winRate.toFixed(1)}%`}
          description="Lead-to-won ratio"
          color="text-blue-600"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">
          Revenue Distribution
        </h3>
        <RevenueChart data={chartData} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  color = "text-slate-900",
}: {
  label: string;
  value: string | number;
  description: string;
  color?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <h3 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h3>
      <p className="text-xs text-slate-400 mt-1 font-medium">{description}</p>
    </div>
  );
}
