"use client";

import { useState, useRef, useEffect } from "react";
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input";
// import type { CountryCode } from "react-phone-number-input/types";
type CountryCode = any;
import en from "react-phone-number-input/locale/en.json";
import {
  Dialog,
  DialogContent,
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
import {
  UserPlus,
  ShieldCheck,
  Camera,
  Globe,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Paperclip,
  CheckCircle2,
  HeartPulse,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { onboardEmployee } from "@/actions/employee-actions";

export function OnboardModal({
  departments,
  designations,
  managers,
  nextId,
}: any) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("AE" as CountryCode);
  const [phoneCode, setPhoneCode] = useState("+971");

  // Track attachments: { categoryName: File }
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [customDocs, setCustomDocs] = useState<{ id: string; label: string }[]>(
    [],
  );
  const [activeUploadCategory, setActiveUploadCategory] = useState<
    string | null
  >(null);

  const countries = getCountries();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const code = getCountryCallingCode(selectedCountry);
      setPhoneCode(`+${code}`);
    } catch (e) {
      setPhoneCode("+");
    }
  }, [selectedCountry]);

  const handleAttachClick = (category: string) => {
    setActiveUploadCategory(category);
    attachmentInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadCategory) {
      setFiles((prev) => ({ ...prev, [activeUploadCategory]: file }));
      toast.success(`${activeUploadCategory} attached!`);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    const loadingToast = toast.loading("Executing Onboarding Protocol...");

    // In a real app, you'd upload 'files' to S3/UploadThing here first
    const result = await onboardEmployee({
      ...rawData,
      imageUrl: imagePreview,
      phone: `${phoneCode}${rawData.phone}`,
      // Pass file info if needed, or handle upload inside action
    });

    if (result.error) {
      toast.error(result.error, { id: loadingToast });
    } else {
      toast.success("Identity Committed to Ledger", { id: loadingToast });
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-950 hover:bg-black rounded-xl font-black uppercase text-[10px] tracking-widest px-8 h-12 text-white shadow-2xl transition-all active:scale-95">
          <UserPlus className="h-4 w-4 mr-2 text-indigo-400" /> Onboard Staff
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[850px] rounded-[2.5rem] border-none p-0 overflow-hidden flex flex-col max-h-[94vh] bg-white shadow-2xl">
        {/* HEADER */}
        <div className="bg-slate-950 p-6 text-white shrink-0 flex justify-between items-center relative">
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-md">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                Personnel <span className="text-indigo-400">Master</span> Ledger
              </DialogTitle>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                Identity Verification Protocol
              </p>
            </div>
          </div>
          <div className="bg-white/5 px-5 py-2 rounded-xl border border-white/10 text-right backdrop-blur-md">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-1">
              Emp ID
            </p>
            <p className="text-lg font-black text-indigo-400 italic leading-none">
              #{nextId}
            </p>
          </div>
        </div>

        {/* Hidden Global File Inputs */}
        <input
          type="file"
          ref={attachmentInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-10 overflow-y-auto custom-scrollbar bg-white"
        >
          {/* SECTION 1: IDENTITY */}
          <div className="flex gap-10 items-start border-b border-slate-50 pb-8">
            <div className="relative shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-32 w-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-all shadow-inner group relative"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="h-full w-full object-cover"
                    alt="Staff Preview"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="h-5 w-5 text-slate-300 mx-auto mb-1 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-tight">
                      Biometric
                      <br />
                      Photo
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () =>
                      setImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-black uppercase text-indigo-500 tracking-widest italic">
                  Date of Birth
                </label>
                <Input
                  name="dob"
                  type="date"
                  required
                  className="rounded-xl border-slate-100 bg-indigo-50/30 h-11 font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  First Name
                </label>
                <Input
                  name="firstName"
                  required
                  className="rounded-xl border-slate-100 bg-slate-50/50 h-11 font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  Last Name
                </label>
                <Input
                  name="lastName"
                  required
                  className="rounded-xl border-slate-100 bg-slate-50/50 h-11 font-bold"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 italic tracking-widest">
                  Official Email
                </label>
                <Input
                  name="email"
                  type="email"
                  required
                  className="rounded-xl border-slate-100 bg-slate-50/50 h-11 font-bold"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: COMMUNICATION & ADDRESS */}
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-500" /> Communication
              </h3>
              <div className="space-y-3">
                <Select
                  value={selectedCountry}
                  onValueChange={(v) => setSelectedCountry(v as CountryCode)}
                >
                  <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-11 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] rounded-xl">
                    {countries.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="text-xs font-bold"
                      >
                        {en[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-1 h-11 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-[10px] font-black italic">
                    {phoneCode}
                  </div>
                  <Input
                    name="phone"
                    required
                    placeholder="Mobile"
                    className="col-span-4 rounded-xl border-slate-100 bg-slate-50 h-11 font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-500" /> Physical Address
              </h3>
              <textarea
                name="fullAddress"
                required
                className="w-full rounded-[1.5rem] border border-slate-100 bg-slate-50/50 p-4 text-xs font-bold h-[105px] resize-none outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Detailed Registered Address..."
              />
            </div>
          </div>

          {/* SECTION 3: EMERGENCY & BANKING (RESTORED) */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2 px-1">
                <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Emergency
              </h3>
              <div className="p-5 rounded-[2rem] bg-rose-50/30 border border-rose-100 space-y-3">
                <Input
                  name="emergencyName"
                  placeholder="Contact Name"
                  className="rounded-lg bg-white/80 h-10 text-xs font-bold"
                />
                <Input
                  name="emergencyPhone"
                  placeholder="Mobile Number"
                  className="rounded-lg bg-white/80 h-10 text-xs font-bold"
                />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2 px-1">
                <Landmark className="h-3.5 w-3.5 text-indigo-500" /> Banking
              </h3>
              <div className="p-5 rounded-[2rem] bg-indigo-50/30 border border-indigo-100 space-y-2">
                <Input
                  name="bankName"
                  placeholder="Bank Name"
                  className="rounded-lg bg-white/80 h-10 text-[10px] font-bold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="iban"
                    placeholder="IBAN"
                    className="rounded-lg bg-white/80 h-10 text-[10px] font-bold uppercase"
                  />
                  <Input
                    name="swiftCode"
                    placeholder="SWIFT"
                    className="rounded-lg bg-white/80 h-10 text-[10px] font-bold uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: HIERARCHY */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase">
                Department
              </label>
              <Select name="departmentId" required>
                <SelectTrigger className="rounded-xl bg-slate-50 h-11 font-bold text-xs">
                  <SelectValue placeholder="Select Dept" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((d: any) => (
                    <SelectItem
                      key={d.id}
                      value={d.id}
                      className="text-xs font-bold"
                    >
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase">
                Designation
              </label>
              <Select name="designationId" required>
                <SelectTrigger className="rounded-xl bg-slate-50 h-11 font-bold text-xs">
                  <SelectValue placeholder="Select Title" />
                </SelectTrigger>
                <SelectContent>
                  {designations?.map((d: any) => (
                    <SelectItem
                      key={d.id}
                      value={d.id}
                      className="text-xs font-bold uppercase"
                    >
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Reporting To
              </label>
              <Select name="reportingToId">
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-11 font-bold text-xs">
                  <SelectValue placeholder="No Manager Assigned" />
                </SelectTrigger>
                <SelectContent>
                  {managers?.map((m: any) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      className="text-xs font-bold"
                    >
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase">
                  Joining Date
                </label>
                <Input
                  name="joiningDate"
                  type="date"
                  className="rounded-xl bg-slate-50 h-11 font-bold text-xs"
                />
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase">
                  Probation Time
                </label>
                <Input
                  name="probationDays"
                  type="number"
                  defaultValue={90}
                  className="rounded-xl bg-slate-50 h-11 font-bold text-center text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: COMPLIANCE (WITH WORKING ATTACH) */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-500" /> Compliance
              </h3>
              <Button
                type="button"
                onClick={() =>
                  setCustomDocs([
                    ...customDocs,
                    { id: Math.random().toString(), label: "" },
                  ])
                }
                className="text-[8px] uppercase tracking-widest h-8 px-4"
                variant="ghost"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Manual Slot
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {["Passport", "Emirates ID"].map((doc) => (
                <div
                  key={doc}
                  className="group bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-3"
                >
                  <Paperclip
                    className={`h-4 w-4 ${files[doc] ? "text-emerald-500" : "text-slate-300"}`}
                  />
                  <p className="text-[8px] font-black uppercase text-slate-700">
                    {doc}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleAttachClick(doc)}
                    className={`h-8 text-[8px] font-black uppercase w-full rounded-xl ${files[doc] ? "bg-emerald-50 text-emerald-600" : "bg-white text-indigo-500 border-indigo-50"}`}
                  >
                    {files[doc] ? "Re-attach" : "Attach"}
                  </Button>
                </div>
              ))}

              {customDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="relative bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100 flex flex-col items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCustomDocs(customDocs.filter((d) => d.id !== doc.id))
                    }
                    className="absolute top-3 right-3 text-rose-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <Input
                    placeholder="Doc Name..."
                    onBlur={(e) => (doc.label = e.target.value)}
                    className="h-7 text-[8px] font-black uppercase bg-white text-center rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleAttachClick(doc.label || "Custom Doc")}
                    className="h-8 text-[8px] font-black uppercase text-indigo-500 bg-white w-full rounded-xl"
                  >
                    Attach
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-16 bg-slate-950 text-white rounded-[2rem] font-black uppercase text-xs italic tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-all"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-400" /> Commit to
            Master Ledger
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
