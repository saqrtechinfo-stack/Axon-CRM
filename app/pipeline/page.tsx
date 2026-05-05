// // app/(dashboard)/pipeline/page.tsx
// import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { KanbanBoard } from "@/components/kanban/KanbanBoard";
// import { redirect } from "next/navigation";

// export const revalidate = 30;

// export default async function PipelinePage() {
//   const { userId } = await auth();
//   if (!userId) redirect("/sign-in");

//   // Fetch the user and their internal database 'id'
//   const dbUser = await prisma.user.findUnique({
//     where: { clerkId: userId },
//     select: { id: true, role: true, companyId: true }, // Ensure 'id' is selected
//   });

//   if (!dbUser) redirect("/sign-in");

//   // Match the Dashboard filtering logic exactly
//   const leadWhere =
//     dbUser.role === "SUPER_ADMIN"
//       ? {}
//       : { companyId: dbUser.companyId, ownerId: dbUser.id }; // Filter leads by ownerId

//   const statusWhere =
//     dbUser.role === "SUPER_ADMIN" ? {} : { companyId: dbUser.companyId };

//   // Fetch only authorized leads and status columns
//   const [leads, statusColumns] = await Promise.all([
//     prisma.lead.findMany({
//       where: leadWhere, // Applied the restricted filter here
//       include: {
//         status: true,
//         assignedTo: { select: { name: true } },
//       },
//       orderBy: { updatedAt: "desc" },
//     }),
//     prisma.leadStatus.findMany({
//       where: statusWhere, // Status columns remain company-wide
//       orderBy: { order: "asc" },
//     }),
//   ]);

//   return (
//     <div className="h-full flex flex-col space-y-6 p-4 md:p-8">
//       <div>
//         <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
//           Sales Pipeline
//         </h1>
//         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
//           {dbUser.role === "SUPER_ADMIN"
//             ? "Al Saqr Tech Operational Flow"
//             : "Your Managed Leads"}
//         </p>
//       </div>

//       <div className="flex-1 overflow-x-auto pb-4">
//         <KanbanBoard initialLeads={leads} statusColumns={statusColumns} />
//       </div>
//     </div>
//   );
// }
// app/(dashboard)/pipeline/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { redirect } from "next/navigation";

export const revalidate = 30;

export default async function PipelinePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, companyId: true }, //
  });

  if (!dbUser) redirect("/sign-in");

  // Exact Dashboard Logic: Filter by ownerId for non-Super Admins
  const leadWhere = dbUser.role === "SUPER_ADMIN" 
    ? {} 
    : { companyId: dbUser.companyId, ownerId: dbUser.id };

  const statusWhere = dbUser.role === "SUPER_ADMIN" 
    ? {} 
    : { companyId: dbUser.companyId };

  const [leads, statusColumns] = await Promise.all([
    prisma.lead.findMany({
      where: leadWhere,
      include: {
        status: true,
        assignedTo: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.leadStatus.findMany({
      where: statusWhere,
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
          {dbUser.role === "SUPER_ADMIN" ? "Al Saqr Tech Operational Flow" : "Your Managed Leads"}
        </p>
      </div>
      <div className="flex-1 overflow-x-auto pb-4">
        <KanbanBoard initialLeads={leads} statusColumns={statusColumns} />
      </div>
    </div>
  );
}