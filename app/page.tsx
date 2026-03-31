// app/page.tsx
import { prisma } from "@/lib/prisma";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { CreateLeadModal } from "@/components/CreateLeadModal";

export default async function DashboardPage() {
  const leads = await prisma.lead.findMany();

  // 1. Calculate Stats
  const totalValue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const wonValue = leads
    .filter((l) => l.status === "WON")
    .reduce((acc, curr) => acc + (curr.value || 0), 0);
  const winRate =
    leads.length > 0
      ? (leads.filter((l) => l.status === "WON").length / leads.length) * 100
      : 0;

  // 2. Format Data for the Chart
  const stages = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON"];
  const chartData = stages.map((stage) => ({
    name: stage,
    value: leads
      .filter((l) => l.status === stage)
      .reduce((acc, curr) => acc + (curr.value || 0), 0),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">
            Real-time performance of Al Saqr Tech.
          </p>
        </div>
        <CreateLeadModal />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Pipeline"
          value={`$${totalValue.toLocaleString()}`}
          description="Gross potential value"
        />
        <StatCard
          label="Revenue Won"
          value={`$${wonValue.toLocaleString()}`}
          description="Closed deals"
          color="text-emerald-600"
        />
        <StatCard
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          description="Conversion efficiency"
          color="text-blue-600"
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 gap-6">
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
