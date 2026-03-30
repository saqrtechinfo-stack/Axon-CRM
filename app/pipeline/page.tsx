// app/pipeline/page.tsx
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default async function PipelinePage() {
  const leads = await prisma.lead.findMany();

  // Define our columns in order
  const columns = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sales Pipeline
        </h1>
        <p className="text-sm text-slate-500">
          Drag and drop leads to update their status.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <KanbanBoard initialLeads={leads} columns={columns} />
      </div>
    </div>
  );
}
