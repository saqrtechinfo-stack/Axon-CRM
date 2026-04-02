// components/admin/SettingsTabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, GitBranch, Users, Building2 } from "lucide-react";
import { LeadStatusesTab } from "./LeadStatusesTab";

interface Company {
  id: string;
  name: string;
  // Add other company fields as needed
}

interface SettingsTabsProps {
  company: Company;
  initialStatuses: any[];
  userRole: string;
}

export function SettingsTabs({
  company,
  initialStatuses,
  userRole,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="statuses" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="statuses" className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Lead Statuses
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team
        </TabsTrigger>
        <TabsTrigger value="company" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Company
        </TabsTrigger>
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          General
        </TabsTrigger>
      </TabsList>

      <TabsContent value="statuses">
        <LeadStatusesTab
          companyId={company.id}
          initialStatuses={initialStatuses}
        />
      </TabsContent>

      <TabsContent value="team">
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-slate-500">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Team management features coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="company">
        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Company Name
                </label>
                <p className="text-sm text-slate-500 mt-1">{company.name}</p>
              </div>
              <div className="flex items-center justify-center h-16 text-slate-500">
                <p>Additional company settings coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-slate-500">
              <div className="text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>General settings coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
