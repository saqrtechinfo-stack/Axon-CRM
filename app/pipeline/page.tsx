// app/pipeline/page.tsx
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default async function PipelinePage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please log in to view the pipeline.</div>;
  }

  // Get the current user's company
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  });

  if (!dbUser) {
    return <div>User not found. Please contact admin.</div>;
  }

  // Get leads for this company
  const leads = await prisma.lead.findMany({
    where: { companyId: dbUser.companyId },
    include: { status: true }, // Include status information
  });

  // Get the status columns for this company
  const statusColumns = await prisma.leadStatus.findMany({
    where: { companyId: dbUser.companyId },
    orderBy: { order: "asc" },
  });

  return (
    <div className="h-full flex flex-col space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sales Pipeline
        </h1>
        <p className="text-sm text-slate-500">
          Drag and drop leads to update their status.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <KanbanBoard initialLeads={leads} statusColumns={statusColumns} />
      </div>
    </div>
  );
}
