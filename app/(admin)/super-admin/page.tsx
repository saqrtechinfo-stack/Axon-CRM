import { prisma } from "@/lib/prisma";
import { CreateCompanyModal } from "@/components/admin/CreateCompanyModal";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CompanyManagementTable } from "@/components/admin/CompanyManagementTable";

export default async function SuperAdminDashboard() {
  const { userId } = await auth();

  if (!userId) redirect("/");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });

  if (dbUser?.role !== "SUPER_ADMIN") redirect("/");

  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { users: true, leads: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 space-y-8 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter">
            AXON CORE
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
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 border-l-emerald-500/50">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Active Now
          </p>
          <h2 className="text-4xl font-black mt-2 text-emerald-400">
            {companies.filter((c) => c.status === "ACTIVE").length}
          </h2>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 border-l-red-500/50">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Attention Required
          </p>
          <h2 className="text-4xl font-black mt-2 text-red-400">
            {/* Logic: Status is INACTIVE or Date is passed */}
            {companies.filter((c) => c.status === "INACTIVE").length}
          </h2>
        </div>
      </div>

      <CompanyManagementTable initialData={companies} />
    </div>
  );
}
