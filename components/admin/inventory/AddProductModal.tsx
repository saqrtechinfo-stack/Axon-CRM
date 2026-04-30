"use client";

import { useState } from "react";
import { createProduct } from "@/actions/product-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package, DollarSign, Tag, Layers } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

export function AddProductModal({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      unit: formData.get("unit") as string,
      categoryId: formData.get("categoryId") as string,
    };

    try {
      await createProduct(data);
      toast.success("Product added to catalog successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add product. Please check your inputs.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest px-6 italic h-12 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus className="h-4 w-4 mr-2" /> Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[2rem] border-none p-0 overflow-hidden shadow-2xl">
        {/* Header - Dark Theme Accent */}
        <div className="bg-slate-950 p-8 text-white relative">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                  New <span className="text-blue-500">Inventory</span> Item
                </DialogTitle>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Catalog Registration • Al Saqr Technologies
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
              <Tag className="h-3 w-3" /> Product / Service Name
            </label>
            <Input
              name="name"
              placeholder="e.g. Annual Maintenance Contract"
              required
              className="rounded-xl border-slate-100 bg-slate-50 h-12 font-bold text-slate-800 focus-visible:ring-blue-600 italic uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                <DollarSign className="h-3 w-3" /> Standard Rate (AED)
              </label>
              <Input
                name="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                className="rounded-xl border-slate-100 bg-slate-50 h-12 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                Billing Unit
              </label>
              <Select name="unit" defaultValue="pcs" required>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-12 font-black italic uppercase text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem
                    value="pcs"
                    className="text-[10px] font-bold uppercase"
                  >
                    Pieces (PCS)
                  </SelectItem>

                  <SelectItem
                    value="Square Meters"
                    className="text-[10px] font-bold uppercase"
                  >
                    Square Meters (SQM)
                  </SelectItem>
                  <SelectItem
                    value="ls"
                    className="text-[10px] font-bold uppercase"
                  >
                    Lumpsum (LS)
                  </SelectItem>
                  <SelectItem
                    value="hour"
                    className="text-[10px] font-bold uppercase"
                  >
                    Hour
                  </SelectItem>
                  <SelectItem
                    value="daily"
                    className="text-[10px] font-bold uppercase"
                  >
                    Daily 
                  </SelectItem>
                  <SelectItem
                    value="month"
                    className="text-[10px] font-bold uppercase"
                  >
                    Monthly (MONTH)
                  </SelectItem>
                  <SelectItem
                    value="year"
                    className="text-[10px] font-bold uppercase"
                  >
                    Year
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
              <Layers className="h-3 w-3" /> Category Assignment
            </label>
            <Select name="categoryId" required>
              <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-12 font-black italic uppercase text-[10px]">
                <SelectValue placeholder="SELECT CATEGORY" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="text-[10px] font-bold uppercase"
                    >
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-[9px] text-slate-400 font-bold uppercase text-center">
                    No categories found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              Brief Description
            </label>
            <Textarea
              name="description"
              placeholder="Technical specifications or scope of work..."
              className="rounded-xl border-slate-100 bg-slate-50 min-h-[100px] font-medium text-slate-600 resize-none focus-visible:ring-blue-600"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs italic tracking-widest shadow-xl shadow-blue-600/20 transition-all"
            >
              {loading ? "COMMITTING TO DATABASE..." : "REGISTER PRODUCT"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
