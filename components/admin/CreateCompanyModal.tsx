// components/admin/CreateCompanyModal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { createCompany } from "@/actions/company";
import { toast } from "sonner";

export function CreateCompanyModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await createCompany(formData);

    setLoading(false);
    if (result?.success) {
      toast.success("Company Onboarded Successfully");
      setOpen(false);
    } else {
      toast.error(result?.error || "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-lg shadow-blue-900/20">
          <PlusCircle className="h-4 w-4" /> New Tenant
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            Provision New Company
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-slate-400 text-xs font-bold uppercase"
            >
              Company Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Al Saqr Technologies"
              className="bg-slate-800 border-slate-700 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="plan"
              className="text-slate-400 text-xs font-bold uppercase"
            >
              Subscription Plan
            </Label>
            <Select name="plan" defaultValue="BASIC">
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="BASIC">Basic (5 Users)</SelectItem>
                <SelectItem value="PRO">Pro (20 Users)</SelectItem>
                <SelectItem value="ENTERPRISE">
                  Enterprise (Unlimited)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-6 rounded-xl"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              "Deploy Instance"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
