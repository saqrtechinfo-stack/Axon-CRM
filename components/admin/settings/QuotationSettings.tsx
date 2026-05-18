// components/settings/QuotationSettings.tsx
"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  Building2,
  CreditCard,
  PenTool,
  Save,
  Loader2,
} from "lucide-react";
import { updateCompanyQuotationSettings } from "@/actions/quotation";

export function QuotationSettings({ company }: { company: any }) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [logoPreview, setLogoPreview] = useState(company.logo || "");
  const [signaturePreview, setSignaturePreview] = useState(
    company.signature || "",
  );
  const logoRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    quotationPrefix: company.quotationPrefix || "",
    defaultValidDays: company.defaultValidDays || 15,
    defaultVatPercent: company.defaultVatPercent || 5,
    accountName: company.accountName || "",
    bankName: company.bankName || "",
    bankBranch: company.bankBranch || "",
    accountNo: company.accountNo || "",
    iban: company.iban || "",
    swiftCode: company.swiftCode || "",
    website: company.website || "",
    quotationFooter: company.quotationFooter || "",
    quotationTerms: company.quotationTerms || "",
    signatoryName: company.signatoryName || "",
    signatoryTitle: company.signatoryTitle || "",
    signatoryEmail: company.signatoryEmail || "",
    signatoryPhone: company.signatoryPhone || "",
  });

  const update = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    const res = await updateCompanyQuotationSettings(form);
    if (res.success) toast.success("Quotation settings saved");
    else toast.error(res.error || "Failed to save");
    setLoading(false);
  };

  const handleImageUpload = async (file: File, type: "logo" | "signature") => {
    const setter = type === "logo" ? setUploadingLogo : setUploadingSignature;
    setter(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res = await fetch("/api/company/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      if (type === "logo") setLogoPreview(url);
      else setSignaturePreview(url);
      // Save immediately to DB
      await updateCompanyQuotationSettings({
        ...form,
        logo: type === "logo" ? url : logoPreview,
        signature: type === "signature" ? url : signaturePreview,
      });
      toast.success(`${type === "logo" ? "Logo" : "Signature"} updated`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setter(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Section 1: General ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">
            General
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Quotation Prefix
            </Label>
            <Input
              value={form.quotationPrefix}
              onChange={(e) => update("quotationPrefix", e.target.value)}
              placeholder="e.g. AST"
              className="bg-slate-50"
            />
            <p className="text-[10px] text-slate-400">
              Preview: {form.quotationPrefix || "QT"}/20260101001
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Default Valid Days
            </Label>
            <Input
              type="number"
              value={form.defaultValidDays}
              onChange={(e) => update("defaultValidDays", e.target.value)}
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Default VAT %
            </Label>
            <Input
              type="number"
              value={form.defaultVatPercent}
              onChange={(e) => update("defaultVatPercent", e.target.value)}
              className="bg-slate-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Website
          </Label>
          <Input
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://saqrtech.com"
            className="bg-slate-50"
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-500" />

          <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">
            Company Logo
          </h3>
        </div>

        <p className="text-[11px] text-slate-400">
          Upload your company logo for quotation PDFs.
        </p>

  

        {/* Company Logo section — replace existing Input */}
        {logoPreview && (
          <img
            src={logoPreview}
            alt="Logo"
            className="h-20 object-contain border border-slate-200 rounded-xl p-2 bg-white"
          />
        )}
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, "logo");
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploadingLogo}
          onClick={() => logoRef.current?.click()}
          className="text-xs"
        >
          {uploadingLogo ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            "Upload Logo"
          )}
        </Button>
      </div>

      {/* ── Section 2: Bank Details ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">
            Bank Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Account Name
            </Label>
            <Input
              value={form.accountName}
              onChange={(e) => update("accountName", e.target.value)}
              placeholder="AL SAQR TECHNOLOGIES FZE-LLC"
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Bank Name
            </Label>
            <Input
              value={form.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              placeholder="BANK OF BARODA"
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Branch
            </Label>
            <Input
              value={form.bankBranch}
              onChange={(e) => update("bankBranch", e.target.value)}
              placeholder="SHARJAH BRANCH"
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Account No
            </Label>
            <Input
              value={form.accountNo}
              onChange={(e) => update("accountNo", e.target.value)}
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              IBAN
            </Label>
            <Input
              value={form.iban}
              onChange={(e) => update("iban", e.target.value)}
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Swift Code
            </Label>
            <Input
              value={form.swiftCode}
              onChange={(e) => update("swiftCode", e.target.value)}
              className="bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Template Text ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PenTool className="h-4 w-4 text-blue-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">
            Template Text
          </h3>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Footer Note
          </Label>
          <Input
            value={form.quotationFooter}
            onChange={(e) => update("quotationFooter", e.target.value)}
            placeholder="e.g. The validity of this proposal is for 15 days only."
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Default Terms & Conditions
          </Label>
          <textarea
            value={form.quotationTerms}
            onChange={(e) => update("quotationTerms", e.target.value)}
            rows={8}
            placeholder="1. This proposal excludes any other software licenses..."
            className="w-full bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-[10px] text-slate-400">
            This will appear on every quotation PDF by default. Individual
            quotations can override this.
          </p>
        </div>
      </div>

      {/* ── Section 4: Signature ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PenTool className="h-4 w-4 text-blue-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">
            Signature
          </h3>
        </div>
        <p className="text-[11px] text-slate-400">
          Upload a signature image (PNG with transparent background
          recommended). This will appear at the bottom of every quotation PDF.
        </p>
        {/* Reuse your existing Supabase upload pattern */}
        {/* Signature section — replace existing Input */}
        {signaturePreview && (
          <img
            src={signaturePreview}
            alt="Signature"
            className="h-16 object-contain border border-slate-200 rounded-lg p-2 bg-white"
          />
        )}
        <input
          ref={signatureRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, "signature");
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploadingSignature}
          onClick={() => signatureRef.current?.click()}
          className="text-xs"
        >
          {uploadingSignature ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            "Upload Signature"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Signatory Name
          </Label>
          <Input
            value={form.signatoryName}
            onChange={(e) => update("signatoryName", e.target.value)}
            placeholder="Midhun Kuriakose"
            className="bg-slate-50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Signatory Title
          </Label>
          <Input
            value={form.signatoryTitle}
            onChange={(e) => update("signatoryTitle", e.target.value)}
            placeholder="Business Head"
            className="bg-slate-50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Signatory Email
          </Label>
          <Input
            value={form.signatoryEmail}
            onChange={(e) => update("signatoryEmail", e.target.value)}
            placeholder="midhun@saqrtech.com"
            className="bg-slate-50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Signatory Phone
          </Label>
          <Input
            value={form.signatoryPhone}
            onChange={(e) => update("signatoryPhone", e.target.value)}
            placeholder="+971 54 52 52 469"
            className="bg-slate-50"
          />
        </div>
      </div>  
      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 font-black h-11"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" /> SAVE QUOTATION SETTINGS
          </>
        )}
      </Button>
    </div>
  );
}
