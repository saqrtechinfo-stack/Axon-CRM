"use client";

import { useState } from "react";
import { deleteProduct } from "@/actions/product-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2, Package, Search } from "lucide-react";
import { toast } from "sonner";
// Importing your separate component
import { EditProductModal } from "./EditProductModal";

export function ProductTable({
  products,
  categories,
}: {
  products: any[];
  categories: any[];
}) {
  const [search, setSearch] = useState("");

  // State for the Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (
      confirm("Are you sure? This will remove the product from the catalog.")
    ) {
      try {
        await deleteProduct(id);
        toast.success("Product removed");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or categories..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="rounded-lg border-slate-100 text-slate-400 font-bold uppercase text-[9px] px-3"
          >
            {filtered.length} Items Found
          </Badge>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <Card
            key={product.id}
            className="group relative rounded-[2.5rem] border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 bg-white border-2 hover:border-blue-100"
          >
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <Badge className="bg-blue-50 text-blue-600 border-none rounded-xl px-3 py-1 text-[9px] font-black tracking-widest uppercase italic">
                  {product.category.name}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(product)}
                    className="rounded-xl h-9 w-9 bg-slate-50 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    className="rounded-xl h-9 w-9 bg-slate-50 hover:bg-rose-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 leading-tight">
                  {product.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 line-clamp-2 leading-relaxed italic">
                  {product.description ||
                    "No technical description provided for this item."}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    Standard Rate
                  </p>
                  <p className="text-3xl font-black italic tracking-tighter text-slate-900">
                    <span className="text-[10px] not-italic mr-1 text-blue-600 uppercase font-black">
                      AED
                    </span>
                    {product.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="bg-slate-950 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic shadow-lg shadow-slate-900/20">
                  Per {product.unit}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="p-4 bg-slate-50 w-fit mx-auto rounded-3xl mb-4">
              <Package className="h-10 w-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">
              No products match your search.
            </p>
          </div>
        )}
      </div>

      {/* Trigger the separate Modal component */}
      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          categories={categories}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          
        />
      )}
    </div>
  );
}
