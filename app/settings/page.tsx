// app/settings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsTabs } from "@/components/admin/SettingsTabs";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user and verify they have admin access
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  });

  if (!dbUser) {
    redirect("/");
  }

  // Only allow ADMIN and SUPER_ADMIN roles to access settings
  if (!["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    redirect("/");
  }

  // Get company data for settings
  const company = dbUser.company;
  if (!company) {
    redirect("/");
  }

  // --- FETCH ALL DATA HERE ---
  const [leadStatuses, departments, designations] = await Promise.all([
    prisma.leadStatus.findMany({
      where: { companyId: company.id },
      orderBy: { order: "asc" },
    }),
    prisma.department.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.designation.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your workspace settings and preferences.
        </p>
      </div>

      <SettingsTabs
        company={company}
        initialStatuses={leadStatuses}
        userRole={dbUser.role}
        departments={departments}
        designations={designations}
      />
    </div>
  );
}
