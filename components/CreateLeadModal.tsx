"use client";

import { useState, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2, UserPlus, Package, Layers } from "lucide-react";
import { toast } from "sonner";

interface CreateLeadModalProps {
  categories?: any[];
  products?: any[];
  availableStaff?: any[];
}

export function CreateLeadModal({
  categories,
  products,
  availableStaff,
}: CreateLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe fallbacks (CRITICAL FIX)
  const safeCategories = categories ?? [];
  const safeProducts = products ?? [];
  const safeStaff = availableStaff ?? [];

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [assignedToId, setAssignedToId] = useState<string>("");

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return [];
    return safeProducts.filter((p) => p.categoryId === selectedCategoryId);
  }, [selectedCategoryId, safeProducts]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    formData.append("categoryId", selectedCategoryId);
    formData.append("productId", selectedProductId);
    formData.append("assignedToId", assignedToId);

    try {
      const result = await createLead(formData);

      if (result.success) {
        setOpen(false);
        toast.success("New Enquiry Registered");

        setSelectedCategoryId("");
        setSelectedProductId("");
        setAssignedToId("");
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg font-bold">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Enquiry
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px] bg-white border-none shadow-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">
            Create <span className="text-blue-600">New Lead</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Section 1 */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Category
                </Label>
                <Select
                  onValueChange={(val) => {
                    setSelectedCategoryId(val);
                    setSelectedProductId("");
                  }}
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeCategories.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-400">
                        No categories
                      </div>
                    ) : (
                      safeCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Product */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Interest Product
                </Label>
                <Select
                  disabled={!selectedCategoryId}
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue
                      placeholder={
                        selectedCategoryId
                          ? "Select Product"
                          : "Pick Category..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-400">
                        No products
                      </div>
                    ) : (
                      filteredProducts.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assign */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                <UserPlus className="h-3 w-3" /> Assign To (Optional)
              </Label>
              <Select onValueChange={setAssignedToId}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="Automatic Assignment" />
                </SelectTrigger>
                <SelectContent>
                  {safeStaff.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-slate-400">
                      No staff available
                    </div>
                  ) : (
                    safeStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Contact Name
              </Label>
              <Input name="name" required className="bg-slate-50 border-none" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Company Name
              </Label>
              <Input name="company" className="bg-slate-50 border-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input name="email" type="email" required />
            <Input name="phone" />
          </div>

          <Input name="value" type="number" placeholder="0.00" />

          <Textarea name="notes" />

          <Button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-slate-900 text-white h-14 rounded-2xl"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "REGISTER ENQUIRY"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
