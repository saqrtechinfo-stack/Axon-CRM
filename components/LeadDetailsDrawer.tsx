// components/LeadDetailsDrawer.tsx
"use client";

import { useState } from "react";
import { updateLeadNotes } from "@/actions/lead-actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Eye, Save } from "lucide-react";

export function LeadDetailsDrawer({ lead }: { lead: any }) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [loading, setLoading] = useState(false);

  const handleSaveNotes = async () => {
    setLoading(true);
    await updateLeadNotes(lead.id, notes);
    setLoading(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-blue-600">
          <Eye className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent className="bg-white sm:max-w-md border-l shadow-2xl">
        <SheetHeader className="border-b pb-6">
          <SheetTitle className="text-2xl font-bold">{lead.name}</SheetTitle>
          <span className="text-xs w-max font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">
            {lead.status}
          </span>
        </SheetHeader>

        <div className="mt-8 space-y-8 p-3">
          {/* Information Section */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Customer Details
            </h4>
            <div className="grid grid-cols-1 gap-3 text-sm border p-4 rounded-xl">
              <p>
                <span className="text-slate-400">Company:</span>{" "}
                {lead.company || "N/A"}
              </p>
              <p>
                <span className="text-slate-400">Email:</span> {lead.email}
              </p>
              <p>
                <span className="text-slate-400">Phone:</span>{" "}
                {lead.phone || "N/A"}
              </p>
            </div>
          </section>

          {/* Notes Section */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Internal Notes
              </h4>
              <Button
                onClick={handleSaveNotes}
                disabled={loading}
                size="sm"
                variant="ghost"
                className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Save className="h-3 w-3 mr-1" />
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type interaction history here..."
              className="min-h-[150px] bg-slate-50 border-slate-200 resize-none text-sm focus-visible:ring-blue-600"
            />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
