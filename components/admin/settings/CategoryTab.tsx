"use client";

import { useState } from "react";
import {
  deleteCategory,
  updateCategory,
  createCategory,
} from "@/actions/product-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package2, Plus, Hash, Trash2, Edit3, Check, X } from "lucide-react";
import { toast } from "sonner";

export function CategoryTab({ categories = [] }: { categories: any[] }) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    await createCategory(name);
    setName("");
    toast.success("Category added");
  };

  const handleDelete = async (id: string) => {
    const res = await deleteCategory(id);
    if (res.success) toast.success("Category deleted");
    else toast.error(res.error);
  };

  const handleUpdate = async (id: string) => {
    await updateCategory(id, editValue);
    setEditingId(null);
    toast.success("Category updated");
  };

  return (
    <div className="grid gap-6">
      {/* Add Form (Same as before) */}
      <div className="flex gap-2 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Category Name..."
          className="rounded-xl h-11 border-slate-200"
        />
        <Button
          onClick={handleAdd}
          className="rounded-xl h-11 bg-blue-600 font-black uppercase text-[10px] italic"
        >
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group p-5 border border-slate-100 rounded-3xl bg-white flex justify-between items-center transition-all hover:border-blue-200"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Hash className="h-4 w-4" />
              </div>

              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-8 rounded-lg text-xs font-bold uppercase"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleUpdate(cat.id)}
                    className="text-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    className="text-slate-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="font-black text-slate-800 uppercase text-xs tracking-tight italic">
                    {cat.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {cat._count?.products || 0} Products
                  </p>
                </div>
              )}
            </div>

            {!editingId && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditValue(cat.name);
                  }}
                  className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
