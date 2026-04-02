// app/(dashboard)/[companyId]/settings/workspace/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WorkspaceSettings } from "@/components/admin/WorkspaceSettings";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: { companyId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Verify the user belongs to this company
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  });

  if (!dbUser || dbUser.companyId !== params.companyId) {
    redirect("/");
  }

  // Get the company's lead statuses
  const leadStatuses = await prisma.leadStatus.findMany({
    where: { companyId: params.companyId },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Workspace Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your company's lead statuses and pipeline configuration.
        </p>
      </div>

      <WorkspaceSettings
        companyId={params.companyId}
        initialStatuses={leadStatuses}
      />
    </div>
  );
}
