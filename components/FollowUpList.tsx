// components/FollowUpList.tsx
"use client";

import { useState } from "react";
import { isPast, isToday, format, differenceInDays } from "date-fns";
import {
  AlertCircle,
  Clock,
  Calendar,
  Building2,
  Phone,
  User2,
  ChevronRight,
} from "lucide-react";
import { LeadDetailsDrawer } from "./LeadDetailsDrawer";

export function FollowUpList({
  initialFollowUps,
  isManager,
  // Pass these from your page so drawer works
  statusColumns,
  availableStaff,
  categories,
  products,
  currentUserRole,
}: {
  initialFollowUps: any[];
  isManager: boolean;
  statusColumns: any[];
  availableStaff: any[];
  categories: any[];
  products: any[];
  currentUserRole: string;
}) {
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const overdue = initialFollowUps.filter(
    (f) => isPast(new Date(f.scheduledAt)) && !isToday(new Date(f.scheduledAt)),
  );
  const today = initialFollowUps.filter((f) =>
    isToday(new Date(f.scheduledAt)),
  );
  const upcoming = initialFollowUps.filter(
    (f) =>
      !isPast(new Date(f.scheduledAt)) && !isToday(new Date(f.scheduledAt)),
  );

  const Card = ({
    f,
    variant,
  }: {
    f: any;
    variant: "red" | "amber" | "blue";
  }) => {
    const daysLeft = !isPast(new Date(f.scheduledAt))
      ? differenceInDays(new Date(f.scheduledAt), new Date())
      : null;

    return (
      <button
        onClick={() => setSelectedLead(f.lead)}
        className={`w-full text-left group relative bg-white border rounded-2xl p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden ${
          variant === "red"
            ? "border-red-100 hover:border-red-200"
            : variant === "amber"
              ? "border-amber-100 hover:border-amber-200"
              : "border-slate-200 hover:border-blue-200"
        }`}
      >
        {/* Color bar on left */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
            variant === "red"
              ? "bg-red-400"
              : variant === "amber"
                ? "bg-amber-400"
                : "bg-blue-400"
          }`}
        />

        <div className="pl-3">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {/* Urgency badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    variant === "red"
                      ? "bg-red-100 text-red-600"
                      : variant === "amber"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {variant === "red" ? (
                    <AlertCircle className="h-2.5 w-2.5" />
                  ) : variant === "amber" ? (
                    <Clock className="h-2.5 w-2.5" />
                  ) : (
                    <Calendar className="h-2.5 w-2.5" />
                  )}
                  {variant === "red"
                    ? "Overdue"
                    : variant === "amber"
                      ? "Today"
                      : daysLeft === 1
                        ? "Tomorrow"
                        : `In ${daysLeft} days`}
                </span>

                {f.lead.status && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                    style={{
                      backgroundColor: f.lead.status.color + "20",
                      color: f.lead.status.color,
                    }}
                  >
                    {f.lead.status.label}
                  </span>
                )}
              </div>

              <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                {f.lead.clientCompany || "No Company"}
              </h4>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-black text-slate-700">
                {format(new Date(f.scheduledAt), "hh:mm a")}
              </p>
              <p className="text-[10px] text-slate-400 font-bold">
                {format(new Date(f.scheduledAt), "dd MMM")}
              </p>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex items-center gap-3 mt-2.5">
            <div className="flex items-center gap-1 text-slate-500">
              <User2 className="h-3 w-3" />
              <span className="text-[11px] font-medium">{f.lead.name}</span>
            </div>
            {f.lead.phone && (
              <div className="flex items-center gap-1 text-slate-500">
                <Phone className="h-3 w-3" />
                <span className="text-[11px]">{f.lead.phone}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {f.notes && (
            <div
              className={`mt-3 px-3 py-2 rounded-xl text-[11px] italic text-slate-600 ${
                variant === "red"
                  ? "bg-red-50"
                  : variant === "amber"
                    ? "bg-amber-50"
                    : "bg-blue-50"
              }`}
            >
              "{f.notes}"
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            {isManager && f.user && (
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600">
                  {f.user.name.charAt(0)}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  {f.user.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 ml-auto group-hover:gap-2 transition-all">
              Open Lead <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </button>
    );
  };

  const Section = ({
    title,
    data,
    variant,
    emptyText,
  }: {
    title: string;
    data: any[];
    variant: "red" | "amber" | "blue";
    emptyText: string;
  }) => (
    <div className="space-y-3">
      {/* Section Header */}
      <div
        className={`flex items-center gap-2 p-3 rounded-xl ${
          variant === "red"
            ? "bg-red-50 border border-red-100"
            : variant === "amber"
              ? "bg-amber-50 border border-amber-100"
              : "bg-blue-50 border border-blue-100"
        }`}
      >
        <div
          className={`h-2 w-2 rounded-full ${
            variant === "red"
              ? "bg-red-500 animate-pulse"
              : variant === "amber"
                ? "bg-amber-500"
                : "bg-blue-500"
          }`}
        />
        <h3
          className={`text-xs font-black uppercase tracking-widest ${
            variant === "red"
              ? "text-red-600"
              : variant === "amber"
                ? "text-amber-600"
                : "text-blue-600"
          }`}
        >
          {title}
        </h3>
        <span
          className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${
            variant === "red"
              ? "bg-red-100 text-red-700"
              : variant === "amber"
                ? "bg-amber-100 text-amber-700"
                : "bg-blue-100 text-blue-700"
          }`}
        >
          {data.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              {emptyText}
            </p>
          </div>
        ) : (
          data.map((f) => <Card key={f.id} f={f} variant={variant} />)
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section
          title="Overdue"
          data={overdue}
          variant="red"
          emptyText="No overdue tasks"
        />
        <Section
          title="Today"
          data={today}
          variant="amber"
          emptyText="Nothing due today"
        />
        <Section
          title="Upcoming"
          data={upcoming}
          variant="blue"
          emptyText="No upcoming tasks"
        />
      </div>

      {/* Lead Drawer — opens on card click */}
      {selectedLead && (
        <LeadDetailsDrawer
          key={selectedLead.id}
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={() => setSelectedLead(null)}
          statusColumns={statusColumns}
          availableStaff={availableStaff}
          categories={categories}
          products={products}
          currentUserRole={currentUserRole}
        />
      )}
    </>
  );
}
