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
import { Textarea } from "@/components/ui/textarea"; // Ensure you have this shadcn component
import { PlusCircle, Loader2, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export function CreateLeadModal() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false)

   async function handleSubmit(formData: FormData) {
     if (isSubmitting) return; // Logic guard
  
     setIsSubmitting(true);
     try {
       const result = await createLead(formData);
       if (result.success) {
         setOpen(false);
       } else {
         toast.error(result.error);
       }
     } finally {
      toast.success("New Lead Created")
       setIsSubmitting(false);
     }
   }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-all active:scale-95">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Enquiry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 italic tracking-tight">
            NEW ENQUIRY
          </DialogTitle>
        </DialogHeader>
        {/* <form action={handleSubmit} className="space-y-4 pt-4"> */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await handleSubmit(formData);
          }}
          className="space-y-4 pt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-[10px] font-bold uppercase text-slate-400"
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Contact Person"
                required
                className="bg-slate-50"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="designation"
                className="text-[10px] font-bold uppercase text-slate-400"
              >
                Designation
              </Label>
              <Input
                id="designation"
                name="designation"
                placeholder="e.g. Manager"
                className="bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-[10px] font-bold uppercase text-slate-400"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@company.com"
                required
                className="bg-slate-50"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="phone"
                className="text-[10px] font-bold uppercase text-slate-400"
              >
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+971..."
                className="bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="company"
                className="text-[10px] font-bold uppercase text-slate-400"
              >
                Client Company
              </Label>
              <Input
                id="company"
                name="company"
                placeholder="Legal Entity Name"
                className="bg-slate-50"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="value"
                className="text-[10px] font-bold uppercase text-slate-400"
              >
                Deal Value
              </Label>
              <Input
                id="value"
                name="value"
                type="number"
                placeholder="0.00"
                className="bg-slate-50"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="notes"
              className="text-[10px] font-bold uppercase text-slate-400"
            >
              Remarks / Requirements
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Enter specific lead details or project scope..."
              className="bg-slate-50 min-h-[100px] resize-none"
            />
          </div>

          <Button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-bold h-12 mt-4 shadow-md"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Enquiry"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
