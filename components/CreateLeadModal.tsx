"use client";

import { useState, useMemo, useEffect } from "react";
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
  Search,
  X,
  Plus,
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

function ClientSearchField({
  onSelect,
}: {
  onSelect: (client: { id: string; name: string } | null, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Flag to prevent re-searching after selection
  const [justSelected, setJustSelected] = useState(false);

  useEffect(() => {
    // ✅ Skip search if user just selected an item
    if (justSelected) {
      setJustSelected(false);
      return;
    }

    if (query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/clients/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        // ✅ Only show results if not already selected
        if (!justSelected) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer); // ✅ cleanup prevents stale calls
  }, [query]);

  const handleSelect = (client: any) => {
    setJustSelected(true); // ✅ block next useEffect run
    setSelected(client);
    setQuery(client.name);
    setIsOpen(false);
    setResults([]); // ✅ clear results immediately
    onSelect(client, client.name);
  };

  const handleNewCompany = () => {
    setJustSelected(true);
    setSelected(null);
    setIsOpen(false);
    setResults([]);
    onSelect(null, query);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onSelect(null, "");
  };

  return (
    <div className="relative space-y-2">
      <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
        <Building2 className="h-3 w-3" /> Company Name
      </Label>
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null); // ✅ clear selection when typing
            onSelect(null, e.target.value);
          }}
          onFocus={() => {
            // ✅ Only reopen if not selected and has results
            if (!selected && results.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            // ✅ Delay close so click on item registers first
            setTimeout(() => setIsOpen(false), 150);
          }}
          placeholder="Search or add company..."
          className="w-full pl-9 pr-8 h-11 bg-slate-50 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {/* Linked badge */}
        {selected && (
          <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
            Linked ✓
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && query.length > 0 && (
        <div className="absolute top-[72px] left-0 right-0 bg-white rounded-xl border border-slate-200 shadow-xl z-[100] overflow-hidden">
          {isLoading ? (
            <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Searching...
            </div>
          ) : (
            <>
              {/* ✅ Deduplicate results by id */}
              {[...new Map(results.map((c) => [c.id, c])).values()].map(
                (client: any) => (
                  <button
                    key={client.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // ✅ prevent blur before click
                    onClick={() => handleSelect(client)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {client.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {client._count?.leads || 0} existing lead(s)
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                        Select
                      </span>
                    </div>
                  </button>
                ),
              )}

              {/* Create new option */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // ✅ prevent blur before click
                onClick={handleNewCompany}
                className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600">
                  Create "{query}" as new client
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Hidden inputs */}
      <input type="hidden" name="clientCompany" value={query} />
      <input type="hidden" name="clientId" value={selected?.id || "new"} />
    </div>
  );
}
export function CreateLeadModal({
  categories,
  products,
  availableStaff,
}: CreateLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientName, setClientName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [mode, setMode] = useState<"enquiry" | "lead">("enquiry");
  const safeCategories = categories ?? [];
  const safeProducts = products ?? [];
  const safeStaff = availableStaff ?? [];
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
    formData.append("productIds", JSON.stringify(selectedProductIds));
    formData.append(
      "assignedToId",
      assignedToId === "none" ? "" : assignedToId,
    );
    formData.append("clientId", selectedClient?.id || "new");
    formData.append("clientCompany", clientName);
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
        <Button className="bg-slate-900 hover:bg-slate-800 shadow-lg font-bold rounded-xl w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Entry
        </Button>
      </DialogTrigger>

      {/* FIXED: Added w-[95vw] and adjusted padding for mobile */}
      <DialogContent className="w-[95vw] sm:max-w-[650px] bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 italic tracking-tighter uppercase text-center sm:text-left">
            {mode === "enquiry" ? "Register " : "Create "}
            <span className="text-blue-600">
              {mode === "enquiry" ? "Enquiry" : "Sales Lead"}
            </span>
          </DialogTitle>

          <Tabs
            value={mode}
            onValueChange={(val) => setMode(val as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-11 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl p-1">
              <TabsTrigger
                value="enquiry"
                className="rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-none"
              >
                QUICK ENQUIRY
              </TabsTrigger>
              <TabsTrigger
                value="lead"
                className="rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-none"
              >
                DIRECT LEAD
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 pt-2">
          {mode === "lead" && (
            <div className="p-4 sm:p-5 bg-blue-50/40 rounded-2xl sm:rounded-3xl border border-blue-100 space-y-4">
              {/* FIXED: Stack columns on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Browse Category
                  </Label>
                  <Select
                    onValueChange={setSelectedCategoryId}
                    value={selectedCategoryId}
                  >
                    <SelectTrigger className="bg-white border-blue-200 h-10 sm:h-11 rounded-xl">
                      <SelectValue placeholder="Category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {safeCategories.map((cat: any) => (
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
                    <SelectTrigger className="bg-white border-blue-200 h-10 sm:h-11 rounded-xl text-blue-600 font-bold">
                      <SelectValue
                        placeholder={
                          selectedCategoryId
                            ? "Add product..."
                            : "Pick category"
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

              {selectedProductIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-100/50">
                  {selectedProductIds.map((id) => {
                    const product = safeProducts.find((p: any) => p.id === id);
                    return (
                      <Badge
                        key={id}
                        className="bg-blue-600 hover:bg-rose-500 py-1 px-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                        onClick={() =>
                          setSelectedProductIds((prev) =>
                            prev.filter((pId) => pId !== id),
                          )
                        }
                      >
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate max-w-[120px]">
                          {product?.name}
                        </span>
                        <X className="h-3 w-3" />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {/* FIXED: All grids changed to responsive stack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ClientSearchField
                onSelect={(client, name) => {
                  setSelectedClient(client);
                  setClientName(name);
                }}
              />
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" /> Contact Person
                </Label>
                <Input
                  name="name"
                  required
                  placeholder="Full Name"
                  className="bg-slate-50 border-none h-10 sm:h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Lead Creation Date
                </Label>
                <Input
                  name="startDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="bg-white border h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Designation
                </Label>
                <Input
                  name="designation"
                  placeholder="e.g. Manager"
                  className="bg-slate-50 border-none h-10 sm:h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Nature of Business
                </Label>
                <Input
                  name="natureOfBusiness"
                  placeholder="e.g. IT Services"
                  className="bg-slate-50 border-none h-10 sm:h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Mobile Number
                </Label>
                <Input
                  name="phone"
                  placeholder="+971 ..."
                  className="bg-slate-50 border-none h-10 sm:h-11"
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
                  className="bg-slate-50 border-none h-10 sm:h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Business Address
              </Label>
              <Input
                name="address"
                placeholder="Location"
                className="bg-slate-50 border-none h-10 sm:h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Search className="h-3 w-3" /> Source
                </Label>
                <Input
                  name="source"
                  placeholder="e.g. WhatsApp"
                  className="bg-slate-50 border-none h-10 sm:h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <UserPlus className="h-3 w-3" /> Assign To
                </Label>
                <Select value={assignedToId} onValueChange={setAssignedToId}>
                  <SelectTrigger className="bg-slate-50 border-none h-10 sm:h-11">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="none"
                      className="text-rose-500 font-bold"
                    >
                      -- Clear --
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
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">
                  Estimated Value (AED)
                </Label>
                <Input
                  name="value"
                  type="number"
                  placeholder="0.00"
                  className="bg-slate-50 border-none h-10 sm:h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">
                Notes
              </Label>
              <Textarea
                name="notes"
                placeholder="Requirements..."
                className="bg-slate-50 border-none min-h-[80px] resize-none rounded-xl"
              />
            </div>
          </div>

          <Button
            disabled={isSubmitting}
            type="submit"
            className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold transition-all shadow-lg ${
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
