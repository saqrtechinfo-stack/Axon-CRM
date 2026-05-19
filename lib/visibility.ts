import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type DbUser = { id: string; role: string };

export async function getAllSubordinateIds(userId: string): Promise<string[]> {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  if (!currentUser) return [];

  const allUsers = await prisma.user.findMany({
    where: { companyId: currentUser.companyId },
    select: { id: true, managerId: true },
  });

  const subordinates = new Set<string>();
  const visited = new Set<string>();
  const queue = [userId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    for (const user of allUsers) {
      if (user.managerId === current && user.id !== current) {
        if (!subordinates.has(user.id)) {
          subordinates.add(user.id);
          queue.push(user.id);
        }
      }
    }
  }

  return Array.from(subordinates);
}

export function getQuotationAccessWhere(
  dbUser: DbUser,
  subordinateIds: string[],
): Prisma.QuotationWhereInput {
  if (dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN") {
    return {};
  }

  const accessConditions: Prisma.QuotationWhereInput[] = [
    { createdById: dbUser.id },
  ];

  if (subordinateIds.length > 0) {
    accessConditions.push({ createdById: { in: subordinateIds } });
  }

  return {
    OR: accessConditions,
  };
}

export function getLeadAccessWhere(
  dbUser: DbUser,
  subordinateIds: string[],
): Prisma.LeadWhereInput {
  if (dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN") {
    return {};
  }

  const accessConditions: Prisma.LeadWhereInput[] = [
    { assignedToId: dbUser.id },
    { ownerId: dbUser.id },
  ];

  if (subordinateIds.length > 0) {
    accessConditions.push(
      { assignedToId: { in: subordinateIds } },
      { ownerId: { in: subordinateIds } },
    );
  }

  return {
    OR: accessConditions,
  };
}
