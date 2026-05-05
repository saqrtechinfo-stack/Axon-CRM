import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { FunnelChart, RevenueChart } from "@/components/analytics/RevenueChart";
import { redirect } from "next/navigation";

export const revalidate = 60;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, companyId: true },
  });

  if (!dbUser) redirect("/sign-in");

  const leadWhere =
    dbUser.role === "SUPER_ADMIN"
      ? {}
      : { companyId: dbUser.companyId, ownerId: dbUser.id };

  const statusWhere =
    dbUser.role === "SUPER_ADMIN" ? {} : { companyId: dbUser.companyId };

  const [stats, statusCounts, statusLabels] = await Promise.all([
    prisma.lead.aggregate({
      where: leadWhere,
      _sum: { value: true },
      _count: { id: true },
    }),
    prisma.lead.groupBy({
      by: ["statusId"],
      where: leadWhere,
      _sum: { value: true },
      _count: { id: true },
    }),
    prisma.leadStatus.findMany({
      where: statusWhere,
      select: { id: true, label: true, color: true, order: true, isWon: true },
      orderBy: { order: "asc" },
    }),
  ]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalValue = Number(stats._sum.value || 0);
  const totalLeads = stats._count.id || 0;

  // ── Won metrics ───────────────────────────────────────────────────────────
  const wonStatusIds = statusLabels.filter((s) => s.isWon).map((s) => s.id);
  const wonData = statusCounts.filter((s) =>
    wonStatusIds.includes(s.statusId || ""),
  );
  const wonValue = wonData.reduce(
    (sum, item) => sum + Number(item._sum.value || 0),
    0,
  );
  const wonCount = wonData.reduce((sum, item) => sum + item._count.id, 0);
  const winRate = totalLeads > 0 ? (wonCount / totalLeads) * 100 : 0;

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = statusLabels.map((status) => {
    const data = statusCounts.find((s) => s.statusId === status.id);
    return {
      name: status.label,
      value: Number(data?._sum.value || 0),
      color: status.color,
      isWon: status.isWon,
    };
  });

  // ── Quick summary counts per stage ────────────────────────────────────────
  const stageLeadCounts = statusLabels.map((status) => {
    const data = statusCounts.find((s) => s.statusId === status.id);
    return { label: status.label, count: data?._count.id || 0 };
  });
  const activeLeads = totalLeads - wonCount;

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-6 md:p-8 space-y-7">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono mb-1">
            Overview
          </p>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
            Dashboard
          </h1>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold text-emerald-600 font-mono uppercase tracking-widest">
            Live
          </span>
        </div>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Pipeline Value"
          value={`AED ${totalValue.toLocaleString()}`}
          sub="Gross potential"
          accent="#6366f1"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          }
        />

        <KpiCard
          label="Revenue Won"
          value={`AED ${wonValue.toLocaleString()}`}
          sub="Converted deals"
          accent="#10b981"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          }
        />

        <KpiCard
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          sub="Lead-to-won ratio"
          accent="#f59e0b"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
        />

        <KpiCard
          label="Active Leads"
          value={activeLeads.toString()}
          sub={`${totalLeads} total leads`}
          accent="#3b82f6"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
        />
      </div>
      {/* ── Won vs Pipeline summary bar ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 font-mono">
            Overall Conversion
          </p>
          <span className="text-xs font-bold text-slate-600">
            AED {wonValue.toLocaleString()}{" "}
            <span className="text-slate-300 font-normal">of</span> AED{" "}
            {totalValue.toLocaleString()}
          </span>
        </div>

        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000"
            style={{
              width:
                totalValue > 0 ? `${(wonValue / totalValue) * 100}%` : "0%",
            }}
          />
        </div>

        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono text-slate-500">Won</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <span className="text-[10px] font-mono text-slate-500">
              Remaining
            </span>
          </div>
        </div>
      </div>
      {/* ── Main content row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Funnel chart — takes 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 font-mono">
                Revenue Distribution
              </p>
              <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                Pipeline by Stage
              </h3>
            </div>
            <div className="text-[10px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
              {chartData.filter((d) => d.value > 0).length} active stages
            </div>
          </div>

          <FunnelChart data={chartData} />
        </div>

        {/* Stage breakdown sidebar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 font-mono">
              Lead Count
            </p>
            <h3 className="text-sm font-bold text-slate-800 mt-0.5">
              Leads by Stage
            </h3>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            {stageLeadCounts.map((stage, i) => (
              <div
                key={stage.label}
                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: statusLabels[i]?.isWon
                        ? "#10b981"
                        : statusLabels[i]?.color || "#94a3b8",
                    }}
                  />
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider font-mono">
                    {stage.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-300 transition-all"
                      style={{
                        width:
                          totalLeads > 0
                            ? `${(stage.count / totalLeads) * 100}%`
                            : "0%",
                        background: statusLabels[i]?.isWon
                          ? "#10b981"
                          : statusLabels[i]?.color || "#94a3b8",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-4 text-right">
                    {stage.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total footer */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
              Total
            </span>
            <span className="text-sm font-black text-slate-800">
              {totalLeads} leads
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-slate-200 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 font-mono">
          {label}
        </p>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
      </div>

      <h3
        className="text-2xl font-black tracking-tight"
        style={{ color: accent }}
      >
        {value}
      </h3>

      <p className="text-[11px] text-slate-400 mt-1 font-medium">{sub}</p>

      {/* thin accent line */}
      <div
        className="mt-4 h-0.5 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ background: accent }}
      />
    </div>
  );
}
