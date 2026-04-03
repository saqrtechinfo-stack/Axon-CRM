"use client";

import { useState } from "react";
import { updateProduct } from "@/actions/product-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Edit3, Package, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function EditProductModal({
  product,
  categories,
  open,
  onOpenChange,
}: {
  product: any;
  categories: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
      await updateProduct(product.id, data);
      toast.success("Product updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-[2rem] border-none p-0 overflow-hidden shadow-2xl">
        <div className="bg-slate-900 p-8 text-white">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Edit3 className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                  Edit Product
                </DialogTitle>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Update {product.name}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Product Name
            </label>
            <Input
              name="name"
              defaultValue={product.name}
              required
              className="rounded-xl border-slate-100 bg-slate-50 h-12 font-bold italic uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <DollarSign className="h-3 w-3" /> Price (AED)
              </label>
              <Input
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price}
                required
                className="rounded-xl border-slate-100 bg-slate-50 h-12 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Unit
              </label>
              <Select name="unit" defaultValue={product.unit}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-12 font-black italic uppercase text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem
                    value="pcs"
                    className="text-[10px] font-bold uppercase"
                  >
                    Pieces (PCS)
                  </SelectItem>
                  <SelectItem
                    value="hrs"
                    className="text-[10px] font-bold uppercase"
                  >
                    Hours (HRS)
                  </SelectItem>
                  <SelectItem
                    value="ls"
                    className="text-[10px] font-bold uppercase"
                  >
                    Lumpsum (LS)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Category
            </label>
            <Select name="categoryId" defaultValue={product.categoryId}>
              <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-12 font-black italic uppercase text-[10px]">
                <SelectValue />
              </SelectTrigger>
              {/* <SelectContent className="rounded-xl">
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={cat.id}
                    className="text-[10px] font-bold uppercase"
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent> */}
              <SelectContent className="rounded-xl">
                {/* Add the "?? []" safety net here */}
                {(categories ?? []).map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={cat.id}
                    className="text-[10px] font-bold uppercase"
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Description
            </label>
            <Textarea
              name="description"
              defaultValue={product.description}
              className="rounded-xl border-slate-100 bg-slate-50 min-h-[100px] font-medium text-slate-600 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-blue-600 rounded-2xl font-black uppercase text-xs italic tracking-widest shadow-xl"
          >
            {loading ? "SAVING CHANGES..." : "UPDATE CATALOG ENTRY"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
