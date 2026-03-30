// components/CreateLeadModal.tsx
"use client";

import { useState } from "react";
import { createLead } from "@/actions/lead-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export function CreateLeadModal() {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    const result = await createLead(formData);
    if (result.success) {
      setOpen(false); // Close modal on success
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Enquiry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            New Enquiry
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@company.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" placeholder="Acme Corp" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="value">Deal Value ($)</Label>
            <Input id="value" name="value" type="number" placeholder="5000" />
          </div>
          <Button type="submit" className="w-full bg-blue-600 mt-4">
            Create Lead
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
