"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  FileText,
  Calculator,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createQuotation, updateQuotation } from "@/actions/quotation";


interface QuotationItem {
  id?: string;
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  total: number;
}

interface QuotationBuilderProps {
  lead: any;
  existingQuotation?: any; // if editing
  onSuccess: () => void;
  onCancel: () => void;
}

const DEFAULT_ITEM: QuotationItem = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  total: 0,
};

export function QuotationBuilder({
  lead,
  existingQuotation,
  onSuccess,
  onCancel,
}: QuotationBuilderProps) {
  const isEditing = !!existingQuotation;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [subject, setSubject] = useState(existingQuotation?.subject || "");
  const [attention, setAttention] = useState(
    existingQuotation?.attention || lead.name || "",
  );
  const [notes, setNotes] = useState(existingQuotation?.notes || "");
  const [validDays, setValidDays] = useState(
    existingQuotation?.validDays || 15,
  );
  const [vatPercent, setVatPercent] = useState(
    existingQuotation?.vatPercent || 5,
  );
  const [discount, setDiscount] = useState(existingQuotation?.discount || 0);
  const [items, setItems] = useState<QuotationItem[]>(
    existingQuotation?.items?.length
      ? existingQuotation.items
      : [{ ...DEFAULT_ITEM }],
  );

  // ── Calculations ──────────────────────────
  const subTotal = items.reduce((sum, item) => {
    const qty = parseFloat(String(item.quantity)) || 0;
    const price = parseFloat(String(item.unitPrice)) || 0;
    return sum + qty * price;
  }, 0);

  const discountAmount = parseFloat(String(discount)) || 0;
  const taxableAmount = subTotal - discountAmount;
  const vatAmount = (taxableAmount * vatPercent) / 100;
  const grandTotal = taxableAmount + vatAmount;

  // ── Item handlers ─────────────────────────
  const addItem = () => setItems([...items, { ...DEFAULT_ITEM }]);

  const removeItem = (index: number) => {
    if (items.length === 1) return; // keep at least 1
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof QuotationItem,
    value: string | number,
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // Auto calculate total
    const qty =
      parseFloat(
        String(field === "quantity" ? value : updated[index].quantity),
      ) || 0;
    const price =
      parseFloat(
        String(field === "unitPrice" ? value : updated[index].unitPrice),
      ) || 0;
    updated[index].total = qty * price;

    setItems(updated);
  };

  // ── Populate from lead products ───────────
  const populateFromProducts = () => {
    if (!lead.products?.length) {
      toast.error("No products linked to this lead");
      return;
    }
    const productItems: QuotationItem[] = lead.products.map((p: any) => ({
      description: p.name,
      quantity: 1,
      unitPrice: p.price || 0,
      total: p.price || 0,
    }));
    setItems(productItems);
    toast.success("Items populated from lead products");
  };

  // ── Submit ────────────────────────────────
  const handleSubmit = async () => {
    // Validation
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    const hasEmptyItems = items.some((i) => !i.description.trim());
    if (hasEmptyItems) {
      toast.error("All item descriptions are required");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      subject,
      attention,
      notes,
      validDays: parseInt(String(validDays)),
      vatPercent: parseFloat(String(vatPercent)),
      discount: discountAmount,
      subTotal,
      taxAmount: vatAmount,
      totalAmount: grandTotal,
      items: items.map((item) => ({
        ...item,
        quantity: parseFloat(String(item.quantity)) || 1,
        unitPrice: parseFloat(String(item.unitPrice)) || 0,
        total: parseFloat(String(item.total)) || 0,
      })),
    };

    try {
      const result = isEditing
        ? await updateQuotation(existingQuotation.id, payload)
        : await createQuotation(lead.id, payload);

      if (result.success) {
        toast.success(
          isEditing
            ? result.newVersion
              ? "New version created"
              : "Quotation updated"
            : "Quotation created",
        );
        onSuccess();
      } else {
        toast.error(result.error || "Failed to save quotation");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
            {isEditing ? "Edit Quotation" : "New Quotation"}
          </h3>
          {isEditing && existingQuotation.status !== "DRAFT" && (
            <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
              Will create v{existingQuotation.version + 1}
            </span>
          )}
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Client Info — read only from lead */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Client Details (from lead)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Company
            </Label>
            <p className="text-sm font-bold text-slate-700 mt-0.5">
              {lead.clientCompany || "—"}
            </p>
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Attention
            </Label>
            <Input
              value={attention}
              onChange={(e) => setAttention(e.target.value)}
              className="bg-white h-8 text-xs mt-0.5"
              placeholder="Contact person"
            />
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-slate-400">
          Subject / Proposal For
        </Label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Proposal for MPOS 2.0 – Android-Based Route Sales..."
          className="bg-slate-50 border-slate-200"
        />
      </div>

      {/* Items Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Line Items
          </Label>
          {lead.products?.length > 0 && (
            <button
              type="button"
              onClick={populateFromProducts}
              className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors"
            >
              + Auto-fill from products
            </button>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-3">
          <span className="col-span-5 text-[9px] font-black uppercase text-slate-400">
            Description
          </span>
          <span className="col-span-2 text-[9px] font-black uppercase text-slate-400 text-center">
            Qty
          </span>
          <span className="col-span-2 text-[9px] font-black uppercase text-slate-400 text-right">
            Rate
          </span>
          <span className="col-span-2 text-[9px] font-black uppercase text-slate-400 text-right">
            Amount
          </span>
          <span className="col-span-1" />
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 items-center"
            >
              <Input
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                placeholder="Item description"
                className="col-span-5 bg-white h-8 text-xs border-slate-200"
              />
              <Input
                value={item.quantity}
                type="number"
                min="0"
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                className="col-span-2 bg-white h-8 text-xs text-center border-slate-200"
              />
              <Input
                value={item.unitPrice}
                type="number"
                min="0"
                onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                className="col-span-2 bg-white h-8 text-xs text-right border-slate-200"
              />
              <div className="col-span-2 text-right">
                <span className="text-xs font-bold text-slate-700">
                  {(
                    (parseFloat(String(item.quantity)) || 0) *
                    (parseFloat(String(item.unitPrice)) || 0)
                  ).toLocaleString("en-AE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="col-span-1 flex justify-center text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Row */}
        <button
          type="button"
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add Row
        </button>
      </div>

      {/* Totals */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Summary
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Sub Total</span>
            <span className="font-bold text-slate-700">
              AED{" "}
              {subTotal.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium text-sm">Discount</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">AED</span>
              <Input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 h-7 text-xs text-right bg-white border-slate-200"
              />
            </div>
          </div>

          {/* VAT */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium text-sm">VAT</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={vatPercent}
                  onChange={(e) => setVatPercent(e.target.value)}
                  className="w-14 h-7 text-xs text-center bg-white border-slate-200"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
            </div>
            <span className="font-bold text-slate-700 text-sm">
              AED{" "}
              {vatAmount.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-2 flex justify-between">
            <span className="font-black text-slate-800 uppercase text-sm">
              Grand Total
            </span>
            <span className="font-black text-blue-600 text-lg">
              AED{" "}
              {grandTotal.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Valid For (Days)
          </Label>
          <Input
            type="number"
            min="1"
            value={validDays}
            onChange={(e) => setValidDays(e.target.value)}
            className="bg-slate-50 border-slate-200 h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            VAT %
          </Label>
          <Input
            type="number"
            min="0"
            value={vatPercent}
            onChange={(e) => setVatPercent(e.target.value)}
            className="bg-slate-50 border-slate-200 h-9"
          />
        </div>
      </div>

      {/* Notes / Covering text */}
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-slate-400">
          Covering Note (optional)
        </Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Kindly refer to the discussions held with Mr Sunil regarding..."
          className="w-full bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black h-11"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "SAVE CHANGES" : "CREATE QUOTATION"}
            </>
          )}
        </Button>
        <Button onClick={onCancel} variant="outline" className="font-bold h-11">
          Cancel
        </Button>
      </div>
    </div>
  );
}
