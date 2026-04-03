"use client";

import { useState } from "react";
import { createDepartment } from "@/actions/org-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlusCircle, Building2 } from "lucide-react";

export function DepartmentTab({ departments = [] }: { departments: any[] }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await createDepartment(name);
    setName("");
    setLoading(false);
  };

  return (
    <Card className="border-slate-100 rounded-3xl shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">
              Departments
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Create and manage your organizational business units.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* ADD FORM */}
        <div className="flex gap-2 items-end bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              New Department Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sales, IT Support, Technical"
              className="rounded-xl border-slate-200 h-11 focus-visible:ring-indigo-500"
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={loading || !name}
            className="rounded-xl bg-indigo-600 h-11 px-8 font-black uppercase text-xs"
          >
            {loading ? (
              "Adding..."
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Defined Departments ({departments.length})
          </h3>
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex justify-between items-center p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 transition-colors"
            >
              <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                {dept.name}
              </p>
              <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400">
                0 Staff
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl text-sm text-slate-400 font-medium border border-slate-100">
              No departments defined yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
