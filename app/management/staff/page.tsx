import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardModal } from "@/components/admin/management/OnboardModal";
// import { StatusToggle } from "@/components/management/StatusToggle";
import { Users } from "lucide-react";
import { StaffCard } from "../StaffCard";
import { SearchFilters } from "@/components/admin/management/SearchFilters";

export default async function StaffManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; desig?: string }>;
}) {
  const { userId } = await auth();
  const filters = await searchParams;
  const query = filters.q || "";
  const deptId = filters.dept || "";
  const desigId = filters.desig || "";

  // 1. Fetch User & Company Data
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId! },
    include: { company: true },
  });

  if (!dbUser) redirect("/");

  const company = dbUser.company;

  // 2. Generate the dynamic ID for the Next Onboarding
  const nextId = `${company?.empIdPrefix}${company?.nextEmpNumber.toString().padStart(4, "0")}`;

const [employees, departments, designations] = await Promise.all([
  prisma.employee.findMany({
    where: {
      companyId: dbUser.companyId,
      AND: [
        deptId ? { departmentId: deptId } : {},
        desigId ? { designationId: desigId } : {},
        query
          ? {
              OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { employeeId: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    // OPTIMIZATION: Only fetch what the StaffCard needs
    // OPTIMIZATION: Update this list to include the fields used in the Drawer
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeId: true,
      role: true,
      status: true,
      imageUrl: true,
      joiningDate: true,
      // --- ADD THESE MISSING FIELDS ---
      email: true,
      phone: true,
      emergencyName: true,
      emergencyPhone: true,
      bankName: true,
      iban: true,
      swiftCode: true,
      fullAddress: true,
      reportingToId: true,
      // --------------------------------
      department: { select: { id: true, name: true } },
      designation: { select: { id: true, name: true, isManagement: true } },
      reportingTo: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "asc" },
  }),
  // For dropdowns, we only need ID and Name
  prisma.department.findMany({
    where: { companyId: dbUser.companyId },
    select: { id: true, name: true },
  }),
  prisma.designation.findMany({
    where: { companyId: dbUser.companyId },
    select: { id: true, name: true, isManagement: true },
  }),
]);
  // --- NEW DYNAMIC FILTER ---
  // Instead of checking hard-coded roles, we check the designation's authority
  const managers = employees.filter(
    (e) => e.designation?.isManagement === true,
  );

  return (
    <div className="p-10 space-y-10 bg-[#F9FAFB] ">
      {/* Header Section */}
      <div className="p-6 md:p-10 mb-1 space-y-8 bg-[#F9FAFB] ">
        {/* 1. TOP BAR: Title & Primary Action */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-slate-900">
              Staff <span className="text-[#FF9E7D]">Management</span>
            </h1>
            <div className="bg-slate-900 w-max p-4 text-white text-[10px] font-black px-2 py-0.5 rounded-full mt-1 italic">
              {employees.length} employees
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Manage your team and organizational hierarchy.
            </p>
          </div>

          {/* Onboarding Button stays prominent on the right (or bottom on mobile) */}
          <div className="shrink-0">
            <OnboardModal
              departments={departments}
              designations={designations}
              managers={managers}
              nextId={nextId}
            />
          </div>
        </div>

        {/* 2. FILTER BAR: Search & Selects */}
        <div className="w-full">
          <SearchFilters
            departments={departments}
            designations={designations}
          />
        </div>

        {/* ... Staff Grid ... */}
      </div>
      {/* Staff Grid Container */}
      <div className="rounded-[2.5rem] border border-slate-100 shadow-sm p-8 bg-white/80">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {employees.map((emp) => (
            <StaffCard
              key={`${emp.id}-${emp.email}-${emp.imageUrl}`}
              emp={emp}
              departments={departments}
              designations={designations}
              managers={managers}
            />
          ))}

          {employees.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <Users className="h-10 w-10 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                No staff records found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
