// app/quotations/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { QuotationsTable } from "@/components/QuotationsTable";
import {
  getAllSubordinateIds,
  getQuotationAccessWhere,
} from "@/lib/visibility";

export const dynamic = "force-dynamic";

export default async function QuotationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, companyId: true, role: true },
  });

  if (!dbUser) redirect("/sign-in");

  const subordinateIds = await getAllSubordinateIds(dbUser.id);

  const quotations = await prisma.quotation.findMany({
    where: {
      companyId: dbUser.companyId,
      ...getQuotationAccessWhere(dbUser, subordinateIds),
    },
    include: {
      lead: {
        select: { id: true, clientCompany: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
          Quotations
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
          All proposals and quotes
        </p>
      </div>
      <QuotationsTable quotations={quotations} />
    </div>
  );
}
