"use client";

import { useState } from "react";
import { updateLeadDetails } from "@/actions/lead-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Loader2, Save, AlertCircle, Package, X, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function EditLeadForm({
  lead,
  categories,
  products,
  onSuccess,
  availableStaff,
}: {
  lead: any;
  categories: any[];
  products: any[];
  availableStaff: any[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [assignedToId, setAssignedToId] = useState(lead.assignedToId || "");

  // Initialize state with existing product IDs from the lead
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    lead.products?.map((p: any) => p.id) || [],
  );

  const addProduct = (productId: string) => {
    if (!selectedProductIds.includes(productId)) {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    // Merge the product array as a JSON string
    const submissionData = {
      ...rawData,
      productIds: JSON.stringify(selectedProductIds),
      assignedToId: assignedToId,
    };

    const result = await updateLeadDetails(lead.id, submissionData);
    setLoading(false);

    if (result.success) {
      toast.success("Lead Profile Updated");
      onSuccess();
    } else {
      toast.error(result.error || "Failed to update lead");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      {/* UAE Format Alert */}
      <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3 mb-4">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
          Updating Lead Profile: Ensure UAE Phone Formats are correct
        </p>
      </div>
      {/* Assignment Section - NEW */}
      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-blue-600" />
          <Label className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
            Assign Lead To
          </Label>
        </div>
        <Select onValueChange={setAssignedToId} defaultValue={assignedToId}>
          <SelectTrigger className="bg-white whitespace-break-spaces border-blue-200 text-xs font-bold">
            <SelectValue placeholder="Select Staff Member" />
          </SelectTrigger>
          <SelectContent>
            {/* Inside EditLeadForm.tsx dropdown loop */}
            {availableStaff.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                <div className="flex items-center gap-2">
                  {staff.imageUrl && ( // Use imageUrl here
                    <img
                      src={staff.imageUrl}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                  )}
                  {staff.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Contact Name
          </Label>
          <Input name="name" defaultValue={lead.name} className="bg-white" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Designation
          </Label>
          <Input
            name="designation"
            defaultValue={lead.designation}
            className="bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Email Address
          </Label>
          <Input
            name="email"
            type="email"
            defaultValue={lead.email}
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label
            className={`text-[10px] font-black uppercase ${!lead.phone ? "text-rose-500" : "text-slate-400"}`}
          >
            Phone Number {!lead.phone && "(REQUIRED)"}
          </Label>
          <Input
            name="phone"
            defaultValue={lead.phone}
            placeholder="+971..."
            className="bg-white"
          />
        </div>
      </div>

      {/* Product Management Section */}
      {lead.isEnquiry === false && (
        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Manage Interested Products
            </Label>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Select onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="bg-white border-slate-200 text-xs">
                <SelectValue placeholder="Filter Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={addProduct} disabled={!selectedCategoryId}>
              <SelectTrigger className="bg-white border-slate-200 text-xs">
                <SelectValue placeholder="Add Product" />
              </SelectTrigger>
              <SelectContent>
                {products
                  .filter((p) => p.categoryId === selectedCategoryId)
                  .map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Cart Display */}
          <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-white/50 rounded-lg border border-dashed border-slate-300">
            {selectedProductIds.length > 0 ? (
              selectedProductIds.map((id) => {
                const product = products.find((p) => p.id === id);
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="bg-blue-600 text-white pl-3 pr-1 py-1 gap-1"
                  >
                    <span className="text-[10px] font-bold uppercase">
                      {product?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProduct(id)}
                      className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            ) : (
              <p className="text-[10px] text-slate-400 font-bold uppercase m-auto">
                No products selected
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Organization
          </Label>
          <Input
            name="clientCompany"
            defaultValue={lead.clientCompany}
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase">
            Deal Value (AED)
          </Label>
          <Input
            name="value"
            type="number"
            defaultValue={lead.value}
            className="bg-white"
          />
        </div>
      </div>

      <Button
        disabled={loading}
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-12 shadow-lg mt-4"
      >
        {loading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> UPDATE LEAD PROFILE
          </>
        )}
      </Button>
    </form>
  );
}
