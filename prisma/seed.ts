import { prisma } from "../lib/prisma";

async function main() {
  // 1. Create the Master Company (or find if exists)
  const company = await prisma.company.upsert({
    where: { name: "Al Saqr Technologies" },
    update: {},
    create: {
      name: "Al Saqr Technologies",
      plan: "ENTERPRISE",
      status: "ACTIVE",
    },
  });

  // 2. Create the Super Admin User (or update if exists)
  await prisma.user.upsert({
    where: { email: "teamaxon2024@gmail.com" },
    update: {
      name: "Rithik",
      role: "SUPER_ADMIN",
      clerkId: "user_3BhxAMTXnbDGnXyRgzG8j0HAhEO",
      companyId: company.id,
    },
    create: {
      email: "teamaxon2024@gmail.com",
      name: "Rithik",
      role: "SUPER_ADMIN",
      clerkId: "user_3BhxAMTXnbDGnXyRgzG8j0HAhEO",
      companyId: company.id,
    },
  });

  // 3. Create default Lead Statuses for ALL companies
  const companies = await prisma.company.findMany();

  for (const comp of companies) {
    const defaultStatuses = [
      {
        label: "NEW",
        color: "#3b82f6",
        order: 1,
        isClosing: false,
        isWon: false,
      },
      {
        label: "CONTACTED",
        color: "#f59e0b",
        order: 2,
        isClosing: false,
        isWon: false,
      },
      {
        label: "QUALIFIED",
        color: "#10b981",
        order: 3,
        isClosing: false,
        isWon: false,
      },
      {
        label: "PROPOSAL",
        color: "#8b5cf6",
        order: 4,
        isClosing: false,
        isWon: false,
      },
      {
        label: "WON",
        color: "#059669",
        order: 5,
        isClosing: true,
        isWon: true,
      },
      {
        label: "LOST",
        color: "#dc2626",
        order: 6,
        isClosing: true,
        isWon: false,
      },
    ];

    for (const status of defaultStatuses) {
      const existing = await prisma.leadStatus.findFirst({
        where: {
          companyId: comp.id,
          label: status.label,
        },
      });
      if (!existing) {
        await prisma.leadStatus.create({
          data: {
            ...status,
            companyId: comp.id,
          },
        });
      }
    }
  }

  console.log(
    `✅ Database Seeded: Created default statuses for ${companies.length} companies!`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
