// app/(admin)/super-admin/page.tsx
import { prisma } from "@/lib/prisma";
import { CreateCompanyModal } from "@/components/admin/CreateCompanyModal";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
export default async function SuperAdminDashboard() {
  // Await the auth() call
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }
  // Find user in YOUR database to check their role
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });

  if (dbUser?.role !== "SUPER_ADMIN") {
    redirect("/"); // Kick them back to the normal dashboard
  }
  const companies = await prisma.company.findMany({
    include: { _count: { select: { users: true, leads: true } } },
  });

  return (
    <div className="p-8 space-y-8 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter">
            NEXUS CORE
          </h1>
          <p className="text-slate-400 text-sm">
            System Overview & Tenant Management
          </p>
        </div>
        <CreateCompanyModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Total Tenants
          </p>
          <h2 className="text-4xl font-black mt-2">{companies.length}</h2>
        </div>
        {/* Add more stats like Total Revenue, Total Users here */}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-700/50 text-slate-400 text-[10px] uppercase font-bold">
            <tr>
              <th className="p-4">Company Name</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Users</th>
              <th className="p-4">Leads</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {companies.map((co) => (
              <tr
                key={co.id}
                className="hover:bg-slate-700/30 transition-colors"
              >
                <td className="p-4 font-bold">{co.name}</td>
                <td className="p-4">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                    {co.plan}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{co._count.users}</td>
                <td className="p-4 text-slate-400">{co._count.leads}</td>
                <td className="p-4 text-right">
                  <span className="text-emerald-400 text-xs font-bold">
                    ● Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
