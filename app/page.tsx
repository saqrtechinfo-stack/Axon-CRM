// app/page.tsx
import { CreateLeadModal } from "@/components/CreateLeadModal";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // Fetch leads from Supabase directly in the Server Component
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
const stats = [
  { label: "Total Enquiries", value: leads.length, color: "text-blue-600" },
  {
    label: "Pipeline Value",
    value: `$${leads.reduce((acc, curr) => acc + (curr.value || 0), 0).toLocaleString()}`,
    color: "text-emerald-600",
  },
  {
    label: "Active Deals",
    value: leads.filter((l) => l.status !== "LOST").length,
    color: "text-amber-600",
  },
];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Welcome back, Rithik. Here is your pipeline.
          </p>
        </div>
        <CreateLeadModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Simple List to verify data */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Recent Enquiries</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-900">{lead.name}</p>
                <p className="text-xs text-slate-500">{lead.email}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {lead.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
