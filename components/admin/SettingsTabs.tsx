"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  GitBranch,
  Users,
  Building2,
  Briefcase,
  LayoutGrid,
  SettingsIcon,
  Settings2Icon,
} from "lucide-react";
import { LeadStatusesTab } from "./LeadStatusesTab";

import { DesignationTab } from "./settings/DesignationTab";
import { ERPConfigForm } from "./settings/ERPConfigForm";
import { DepartmentTab } from "./settings/DepartmentTab";
import CompanySetting from "./settings/CompanySetting";


interface Company {
  id: string;
  name: string;
}

// Updated Props to include new organizational data
// Update the Props interface
interface SettingsTabsProps {
  company: Company;
  initialStatuses: any[];
  departments: any[];
  designations: any[];
  employees: any[];
  managers: any[];
}

export function SettingsTabs({
  company,
  initialStatuses,
  departments,
  designations,
  managers,
  // userRole,
  employees,
}: SettingsTabsProps) {
  console.log("managers", managers);
  return (
    <Tabs defaultValue="statuses" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-slate-100/50 rounded-xl">
        <TabsTrigger
          value="statuses"
          className="flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-tight"
        >
          <GitBranch className="h-4 w-4" />
          Lead Statuses
        </TabsTrigger>
        <TabsTrigger
          value="departments"
          className="flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-tight"
        >
          <LayoutGrid className="h-4 w-4" />
          Departments
        </TabsTrigger>
        <TabsTrigger
          value="designations"
          className="flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-tight"
        >
          <Briefcase className="h-4 w-4" />
          Designations
        </TabsTrigger>
        <TabsTrigger
          value="team"
          className="flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-tight"
        >
          <Users className="h-4 w-4" />
          Team
        </TabsTrigger>
        <TabsTrigger
          value="erp-config"
          className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
        >
          <Settings2Icon /> Company 
        </TabsTrigger>
        <TabsTrigger
          value="company"
          className="flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-tight"
        >
          <Building2 className="h-4 w-4" />
          Hierarchy
        </TabsTrigger>
        {/* <TabsTrigger
          value="general"
          className="flex items-center gap-2 py-2 text-xs font-bold uppercase tracking-tight"
        >
          <Settings className="h-4 w-4" />
          General
        </TabsTrigger> */}
      </TabsList>

      <TabsContent value="statuses">
        <LeadStatusesTab
          companyId={company.id}
          initialStatuses={initialStatuses}
        />
      </TabsContent>

      {/* NEW: Department Management Tab */}
      <TabsContent value="departments">
        <DepartmentTab
          employees={employees}
          managers={managers}
          departments={departments}
        />
      </TabsContent>

      {/* NEW: Designation Management Tab */}
      <TabsContent value="designations">
        <DesignationTab designations={designations} />
      </TabsContent>

      <TabsContent value="team">
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black italic tracking-tighter uppercase">
              Team Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-slate-500">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50 text-indigo-500" />
                <p className="font-medium uppercase text-[10px] tracking-widest text-slate-400">
                  Team settings coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="company">
        <CompanySetting designations={designations} />
      </TabsContent>
      <TabsContent value="erp-config">
        <ERPConfigForm company={company} />
      </TabsContent>
      {/* <TabsContent value="general">
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-black italic tracking-tighter uppercase">
              General Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-slate-500">
              <div className="text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium uppercase text-[10px] tracking-widest text-slate-400">
                  General preferences coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent> */}
    </Tabs>
  );
}
