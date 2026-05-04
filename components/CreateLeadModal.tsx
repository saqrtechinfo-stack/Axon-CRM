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
  PlusCircle,
  Loader2,
  UserPlus,
  Package,
  Layers,
  MapPin,
  Building2,
  User,
  Calendar,
  Briefcase,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "./ui/badge";

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

  // New state to toggle between Enquiry and Lead mode
  const [mode, setMode] = useState<"enquiry" | "lead">("enquiry");

  const safeCategories = categories ?? [];
  const safeProducts = products ?? [];
  const safeStaff = availableStaff ?? [];

  // State for multiple products
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
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

   formData.append("isEnquiry", String(mode === "enquiry"));
   formData.append("categoryId", selectedCategoryId);

   // FIX: Send the array of IDs as a JSON string
   formData.append("productIds", JSON.stringify(selectedProductIds));

   formData.append("assignedToId", assignedToId === "none" ? "" : assignedToId);

   try {
     const result = await createLead(formData);

     if (result.success) {
       setOpen(false);
       toast.success(
         mode === "enquiry"
           ? "Enquiry Logged Successfully"
           : "New Lead Created",
       );
       // FIX: Reset all new states
       setSelectedCategoryId("");
       setSelectedProductIds([]); // Reset the cart
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
        <Button className="bg-slate-900 hover:bg-slate-800 shadow-lg font-bold rounded-xl">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Entry
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] bg-white border-none shadow-2xl max-h-[95vh] overflow-y-auto rounded-3xl">
        <DialogHeader className="space-y-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">
              {mode === "enquiry" ? "Register " : "Create "}
              <span className="text-blue-600">
                {mode === "enquiry" ? "Enquiry" : "Sales Lead"}
              </span>
            </DialogTitle>
          </div>

          {/* Mode Switcher */}
          <Tabs
            value={mode}
            onValueChange={(val) => setMode(val as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 rounded-2xl p-1">
              <TabsTrigger
                value="enquiry"
                className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-none"
              >
                QUICK ENQUIRY
              </TabsTrigger>
              <TabsTrigger
                value="lead"
                className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-none"
              >
                DIRECT LEAD
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Section: Dynamic Sales Fields (Only for Lead) */}
          {mode === "lead" && (
            <div className="p-5 bg-blue-50/40 rounded-3xl border border-blue-100 space-y-4 animate-in fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Browse Category
                  </Label>
                  <Select
                    onValueChange={setSelectedCategoryId}
                    value={selectedCategoryId}
                  >
                    <SelectTrigger className="bg-white border-blue-200 h-11 rounded-xl">
                      <SelectValue placeholder="Switch category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1">
                    <Package className="h-3 w-3" /> Select Products
                  </Label>
                  <Select
                    disabled={!selectedCategoryId}
                    onValueChange={(val) => {
                      if (!selectedProductIds.includes(val)) {
                        setSelectedProductIds([...selectedProductIds, val]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white border-blue-200 h-11 rounded-xl text-blue-600 font-bold">
                      <SelectValue
                        placeholder={
                          selectedCategoryId
                            ? "Add to cart..."
                            : "Pick category first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((prod: any) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selected Products "Cart" View */}
              {selectedProductIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-100/50">
                  {selectedProductIds.map((id) => {
                    const product = products.find((p: any) => p.id === id);
                    return (
                      <Badge
                        key={id}
                        className="bg-blue-600 hover:bg-rose-500 py-1.5 px-3 rounded-lg flex items-center gap-2 cursor-pointer transition-colors group"
                        onClick={() =>
                          setSelectedProductIds((prev) =>
                            prev.filter((pId) => pId !== id),
                          )
                        }
                      >
                        <span className="text-[10px] font-bold uppercase">
                          {product?.name}
                        </span>
                        <X className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section: Core Contact Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Company Name
                </Label>
                <Input
                  name="clientCompany"
                  placeholder="e.g. Al Saqr Tech"
                  className="bg-slate-50 border-none h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" /> Contact Person
                </Label>
                <Input
                  name="name"
                  required
                  placeholder="Full Name"
                  className="bg-slate-50 border-none h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Designation
                </Label>
                <Input
                  name="designation"
                  placeholder="e.g. Manager"
                  className="bg-slate-50 border-none h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Nature of Business
                </Label>
                <Input
                  name="natureOfBusiness"
                  placeholder="e.g. IT Services"
                  className="bg-slate-50 border-none h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Mobile Number
                </Label>
                <Input
                  name="phone"
                  placeholder="+971 ..."
                  className="bg-slate-50 border-none h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Email Address
                </Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="client@email.com"
                  className="bg-slate-50 border-none h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Business Address
              </Label>
              <Input
                name="address"
                placeholder="Office, Building, City"
                className="bg-slate-50 border-none h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Search className="h-3 w-3" /> Source of Enquiry
                </Label>
                <Input
                  name="source"
                  placeholder="e.g. WhatsApp, Cold Call"
                  className="bg-slate-50 border-none h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <UserPlus className="h-3 w-3" /> Assign To
                </Label>
                <Select value={assignedToId} onValueChange={setAssignedToId}>
                  <SelectTrigger className="bg-slate-50 border-none h-11">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="none"
                      className="text-rose-500 font-bold"
                    >
                      -- Clear Assignment --
                    </SelectItem>
                    {safeStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {mode === "lead" && (
              <div className="space-y-2 animate-in fade-in duration-500">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Estimated Deal Value
                </Label>
                <Input
                  name="value"
                  type="number"
                  placeholder="0.00"
                  className="bg-slate-50 border-none h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Additional Notes
              </Label>
              <Textarea
                name="notes"
                placeholder="Any specific requirements..."
                className="bg-slate-50 border-none min-h-[60px] resize-none rounded-2xl"
              />
            </div>
          </div>

          <Button
            disabled={isSubmitting}
            type="submit"
            className={`w-full h-14 rounded-2xl font-bold tracking-tight transition-all shadow-lg ${
              mode === "enquiry"
                ? "bg-slate-900 hover:bg-slate-800"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : mode === "enquiry" ? (
              "REGISTER ENQUIRY"
            ) : (
              "CREATE SALES LEAD"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
