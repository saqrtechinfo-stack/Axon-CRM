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
  categories: any[];
  products: any[];
  availableStaff: any[];
}

export function CreateLeadModal({
  categories,
  products,
  availableStaff,
}: CreateLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for custom selects
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [assignedToId, setAssignedToId] = useState<string>("");

  // Filter products based on category
  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return [];
    return products.filter((p) => p.categoryId === selectedCategoryId);
  }, [selectedCategoryId, products]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Manually add the values from our custom Select components
    formData.append("categoryId", selectedCategoryId);
    formData.append("productId", selectedProductId);
    formData.append("assignedToId", assignedToId);

    try {
      const result = await createLead(formData);
      if (result.success) {
        setOpen(false);
        toast.success("New Enquiry Registered");
        // Reset states
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
          {/* Section 1: Classification (The Logic) */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Category
                </Label>
                <Select
                  onValueChange={(val) => {
                    setSelectedCategoryId(val);
                    setSelectedProductId(""); // Reset product if category changes
                  }}
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    {filteredProducts.map((prod) => (
                      <SelectItem key={prod.id} value={prod.id}>
                        {prod.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                <UserPlus className="h-3 w-3" /> Assign To (Optional)
              </Label>
              <Select onValueChange={setAssignedToId}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="Automatic Assignment" />
                </SelectTrigger>
                <SelectContent>
                  {availableStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 2: Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Contact Name
              </Label>
              <Input
                name="name"
                placeholder="John Doe"
                required
                className="bg-slate-50 border-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Company Name
              </Label>
              <Input
                name="company"
                placeholder="Al Saqr Client Ltd"
                className="bg-slate-50 border-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Email Address
              </Label>
              <Input
                name="email"
                type="email"
                placeholder="client@example.com"
                required
                className="bg-slate-50 border-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Phone / WhatsApp
              </Label>
              <Input
                name="phone"
                placeholder="+971..."
                className="bg-slate-50 border-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Estimated Value (AED)
            </Label>
            <Input
              name="value"
              type="number"
              placeholder="0.00"
              className="bg-slate-50 border-none font-bold text-blue-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Internal Remarks
            </Label>
            <Textarea
              name="notes"
              placeholder="Requirement details..."
              className="bg-slate-50 border-none min-h-[80px] resize-none"
            />
          </div>

          <Button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-black h-14 shadow-xl rounded-2xl transition-all"
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
