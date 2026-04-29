import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { redirect } from "next/navigation";

// 🔥 OPTIMIZATION: Cache for 30 seconds to save DB reads
export const revalidate = 30;

export default async function PipelinePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { companyId: true, role: true },
  });

  if (!dbUser) redirect("/sign-in");

  // Fetch only what's needed for the card UI
  const [leads, statusColumns] = await Promise.all([
    prisma.lead.findMany({
      where: { companyId: dbUser.companyId },
      include: {
        status: true,
        assignedTo: { select: { name: true } },
        // 🛑 Activity history removed here (fetched on-demand in Drawer)
      },
    }),
    prisma.leadStatus.findMany({
      where: { companyId: dbUser.companyId },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="h-full flex flex-col space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
          Sales Pipeline
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Al Saqr Tech Operational Flow
        </p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <KanbanBoard initialLeads={leads} statusColumns={statusColumns} />
      </div>
    </div>
  );
}
