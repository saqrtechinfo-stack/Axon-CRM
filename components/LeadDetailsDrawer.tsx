"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import {
  RefreshCcw,
  MessageSquare,
  History,
  User,
  Plus,
  Edit3,
  X,
  Check,
  UserCircle2,
  Package,
  ArrowRightCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpdateLeadModal } from "./UpdateLeadModal";
import { EditLeadForm } from "./EditLeadForm";
import { LeadReadOnlyStats } from "./LeadReadOnlyStats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { assignLead, convertEnquiryToLead } from "@/actions/lead-actions";
import useSWR from "swr";
import { Badge } from "./ui/badge";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LeadDetailsDrawer({
  lead,
  statusColumns = [],
  isOpen,
  onClose,
  onUpdate,
  availableStaff = [],
  currentUserRole,
  categories,
  products,
}: {
  lead: any;
  statusColumns: any[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentUserRole: string;
  availableStaff: any[];
  categories: any[];
  products: any[];
}) {
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch activities only when drawer is open
  const {
    data: activities,
    isLoading,
    mutate,
  } = useSWR(
    isOpen && lead?.id ? `/api/leads/${lead.id}/activities` : null,
    fetcher,
  );

  if (!lead) return null;

  const handleAssign = async (employeeId: string) => {
    const res = await assignLead(lead.id, employeeId);
    if (res.success) {
      toast.success("Lead Assigned Successfully");
      mutate();
      onUpdate();
    }
  };

  const handleConvert = async () => {
    const res = await convertEnquiryToLead(lead.id);
    if (res.success) {
      toast.success("Converted to Sales Lead");
      onUpdate();
      onClose();
    } else {
      toast.error(res.error || "Conversion failed");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[540px] bg-slate-50 border-l border-slate-200 text-slate-900 overflow-y-auto p-0 shadow-2xl">
        {/* Accessibility Description */}
        <SheetDescription className="sr-only">
          Detailed view and management for {lead.name}
        </SheetDescription>

        {/* Header: Identity Section */}
        <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                  {lead.isEnquiry ? "Enquiry Profile" : "Lead Profile"}
                </span>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white font-bold uppercase text-[10px] ml-auto"
                >
                  {isEditing ? (
                    <>
                      <X className="h-3 w-3 mr-1" /> Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3 w-3 mr-1" /> Edit
                    </>
                  )}
                </Button>
              </div>

              <SheetTitle className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                {lead.clientCompany}
              </SheetTitle>

              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                  <History className="h-3 w-3 text-blue-200" />
                  <div className="flex flex-col leading-none">
                    <span className="text-[8px] font-black uppercase opacity-60">
                      Created On
                    </span>
                    <span className="text-[11px] font-bold mt-[1px]">
                      {lead.startDate
                        ? format(new Date(lead.startDate), "dd MMM yyyy")
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                  <UserCircle2 className="h-3 w-3 text-blue-200" />
                  <div className="flex flex-col leading-none">
                    <span className="text-[8px] font-black uppercase opacity-60">
                      Lead Owner
                    </span>
                    <span className="text-[11px] font-bold mt-[1px]">
                      {lead.owner?.name || "System"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isEditing ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <EditLeadForm
                lead={lead}
                categories={categories} // Pass these down
                products={products}
                availableStaff={availableStaff}
                onSuccess={() => {
                  setIsEditing(false);
                  onUpdate();
                }}
              />
            </div>
          ) : (
            <>
              {/* CONVERT BUTTON: Only shows if it's an enquiry */}
              {lead.isEnquiry && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleConvert}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] h-7 px-3 rounded-lg border-none ml-2"
                  >
                    <ArrowRightCircle className="h-3.5 w-3.5 mr-1" /> Convert to
                    Lead
                  </Button>
                </div>
              )}
              {/* Assignment Section */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-100">
                    {lead.assignedTo?.imageUrl ? (
                      <img
                        src={lead.assignedTo.imageUrl}
                        alt={lead.assignedTo.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserCircle2 className="h-5 w-5" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase italic">
                    Assigned To
                  </p>
                  {["ADMIN", "MANAGER"].includes(currentUserRole) ? (
                    <Select
                      onValueChange={handleAssign}
                      defaultValue={lead.assignedToId || ""}
                    >
                      <SelectTrigger className="h-6 border-none p-0 bg-transparent font-bold text-xs text-blue-600 shadow-none focus:ring-0">
                        <SelectValue placeholder="Select Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs font-bold text-slate-700">
                      {lead.assignedTo?.name || "Unassigned"}
                    </p>
                  )}
                </div>
              </div>
              <hr />
              {/* Core Stats (Email, Phone, Value) */}
              <LeadReadOnlyStats lead={lead} />

              {/* Product List Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4 text-blue-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    Interested Products
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {lead.products && lead.products.length > 0 ? (
                    lead.products.map((product: any) => (
                      <Badge
                        key={product.id}
                        className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition-colors"
                      >
                        {product.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      No products selected
                    </span>
                  )}
                </div>
              </div>

              {/* Pipeline Stepper - Hidden for Enquiries */}
              {!lead.isEnquiry && statusColumns.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-6">
                    Pipeline Progress
                  </h3>
                  <div className="overflow-x-auto pb-2">
                    <div className="relative flex items-center min-w-max px-2">
                      <div className="absolute top-[15px] left-0 w-full h-[2px] bg-slate-100" />
                      {statusColumns.map((status: any, idx: number) => {
                        const currentIndex = statusColumns.findIndex(
                          (s: any) => s.id === lead.statusId,
                        );
                        const isCompleted = currentIndex >= idx;
                        const isCurrent = status.id === lead.statusId;
                        return (
                          <div
                            key={status.id}
                            className="relative z-10 flex flex-col items-center mx-4 shrink-0"
                          >
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center border-4 transition-all ${
                                isCurrent
                                  ? "bg-blue-600 border-blue-100 scale-110"
                                  : isCompleted
                                    ? "bg-emerald-500 border-emerald-50"
                                    : "bg-white border-slate-100"
                              }`}
                            >
                              {isCompleted && !isCurrent ? (
                                <Check className="h-3 w-3 text-white" />
                              ) : (
                                <div
                                  className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "bg-white" : "bg-slate-200"}`}
                                />
                              )}
                            </div>
                            <span
                              className={`mt-2 text-[10px] font-bold ${isCurrent ? "text-blue-600" : "text-slate-400"}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Log */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-400" />
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.15em]">
                      Activity Log
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => setIsRemarkModalOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> ADD REMARK
                  </Button>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-slate-50 animate-pulse rounded-xl"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-slate-100">
                    {(activities || []).length > 0 ? (
                      activities.map((activity: any) => (
                        <div
                          key={activity.id}
                          className="relative flex items-start pl-8"
                        >
                          <div className="absolute left-0 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-blue-500 shadow-sm z-10">
                            {activity.type === "STATUS_CHANGE" ? (
                              <RefreshCcw className="h-2.5 w-2.5 text-blue-500" />
                            ) : (
                              <MessageSquare className="h-2.5 w-2.5 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-slate-400">
                                {format(
                                  new Date(activity.createdAt),
                                  "MMM d, HH:mm",
                                )}
                              </span>
                              <Badge className="bg-slate-100 text-slate-500 text-[9px] border-none font-black">
                                {activity.user?.name || "System"}
                              </Badge>
                            </div>
                            <p className="text-sm font-bold text-slate-800">
                              {activity.content}
                            </p>
                            {activity.remarks && (
                              <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 italic text-xs text-blue-600">
                                &quot;{activity.remarks}&quot;
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                          No history recorded
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <UpdateLeadModal
          lead={lead}
          isOpen={isRemarkModalOpen}
          onClose={() => {
            setIsRemarkModalOpen(false);
            mutate();
            onUpdate();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
