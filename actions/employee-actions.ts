"use server";

import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";

export async function onboardEmployee(data: any) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        company: {
          select: { id: true, empIdPrefix: true, nextEmpNumber: true },
        },
      },
    });

    if (!dbUser?.company) throw new Error("Company settings not found");

    

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const generatedId = `${dbUser.company.empIdPrefix}${dbUser.company.nextEmpNumber}`;

        // 1. Create the Employee (HR Record)
        const employee = await tx.employee.create({
          data: {
            employeeId: generatedId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            designationId: data.designationId,
            departmentId: data.departmentId,
            role: data.role || "STAFF",
            reportingToId: data.reportingToId || null,
            companyId: dbUser.company.id,
            imageUrl: data.imageUrl,
            status: "ACTIVE",
          },
        });

        // 2. Create the User (Login/CRM Record)
        // FIX: We need to find if the 'reportingToId' (Employee ID) has a corresponding User ID
        let managerUserId = null;
        if (data.reportingToId) {
          const managerEmp = await tx.employee.findUnique({
            where: { id: data.reportingToId },
            select: { email: true },
          });
          if (managerEmp) {
            const managerUser = await tx.user.findUnique({
              where: { email: managerEmp.email },
            });
            managerUserId = managerUser?.id;
          }
        }

        await tx.user.create({
          data: {
            email: data.email.toLowerCase().trim(), // Normalize email
            name: `${data.firstName} ${data.lastName}`,
            companyId: dbUser.company.id,
            // Ensure role matches your Prisma Enum exactly
            role:
              data.role === "SUPERVISOR" || data.role === "MANAGER"
                ? "MANAGER"
                : "SALES_EXECUTIVE",
            managerId: managerUserId, // Links the hierarchy in the User table
            status: "ACTIVE",
          },
        });

        // 3. Increment Company counter
        await tx.company.update({
          where: { id: dbUser.company.id },
          data: { nextEmpNumber: { increment: 1 } },
        });

        return employee;
      },
    );

    revalidatePath("/management/staff");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("ONBOARDING_ERROR:", error);
    if (error.code === "P2002") {
      return { error: "An employee or user with this Email already exists." };
    }
    return { error: error.message || "Failed to onboard employee." };
  }
}
export async function toggleEmployeeStatus(
  employeeId: string,
  currentStatus: string,
) {
  const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.employee.update({
    where: { id: employeeId },
    data: { status: newStatus },
  });

  revalidatePath("/management/staff");
}

export async function updateEmployee(id: string, data: any) {
  try {
    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      fullAddress: data.fullAddress,

      // CRITICAL FIX: Convert empty strings to null for relations
      designationId: data.designationId || undefined,
      departmentId: data.departmentId || undefined,
      reportingToId:
        data.reportingToId === "" || data.reportingToId === "NONE"
          ? null
          : data.reportingToId,

      // New fields
      emergencyName: data.emergencyName,
      emergencyPhone: data.emergencyPhone,
      bankName: data.bankName,
      iban: data.iban,
      swiftCode: data.swiftCode,
    };

    if (data.imageUrl && data.imageUrl.trim() !== "") {
      updateData.imageUrl = data.imageUrl;
    }

    await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/management/staff");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma Update Error:", error);
    // Return a cleaner error message to the UI
    if (error.code === "P2003") {
      return {
        error:
          "Foreign key failed: The selected Manager, Dept, or Designation is invalid.",
      };
    }
    return { error: error.message || "Failed to update employee" };
  }
}

