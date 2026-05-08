import { FollowUpList } from "@/components/FollowUpList";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


export default async function FollowUpsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true, role: true },
  });

  if (!dbUser) redirect("/sign-in");

  // Get subordinates to handle Manager visibility
  const subordinates = await prisma.user.findMany({
    where: { managerId: dbUser.id },
    select: { id: true },
  });
  const teamIds = [dbUser.id, ...subordinates.map((s) => s.id)];
  const isManager = subordinates.length > 0;

  // Fetch all pending follow-ups for the user/team
  const followUps = await prisma.leadFollowUp.findMany({
    where: {
      userId:
        isManager || dbUser.role === "ADMIN" ? { in: teamIds } : dbUser.id,
      isDone: false,
    },
    include: {
      lead: {
        select: { id: true, clientCompany: true, name: true, phone: true },
      },
      user: {
        select: { name: true, imageUrl: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
          Daily Schedule
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
          Tasks & Follow-ups for Saqr Tech
        </p>
      </div>

      <FollowUpList initialFollowUps={followUps} isManager={isManager} />
    </div>
  );
}
