"use client";

import { isPast, isToday, format } from "date-fns";


export function FollowUpList({
  initialFollowUps,
  isManager,
}: {
  initialFollowUps: any[];
  isManager: boolean;
}) {
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

  const Section = ({
    title,
    data,
    variant,
  }: {
    title: string;
    data: any[];
    variant: "red" | "amber" | "blue";
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <div
          className={`h-2 w-2 rounded-full ${variant === "red" ? "bg-red-500" : variant === "amber" ? "bg-amber-500" : "bg-blue-500"}`}
        />
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
          {title} ({data.length})
        </h3>
      </div>

      <div className="grid gap-3">
        {data.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic px-2">
            No tasks in this category.
          </p>
        ) : (
          data.map((f) => (
            <div
              key={f.id}
              className="group relative bg-white border border-slate-200 p-4 rounded-2xl hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600">
                    {f.lead.clientCompany}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {f.lead.name} • {f.lead.phone || "No Phone"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-700">
                    {format(new Date(f.scheduledAt), "hh:mm a")}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {format(new Date(f.scheduledAt), "dd MMM")}
                  </p>
                </div>
              </div>

              {f.notes && (
                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-600 italic">"{f.notes}"</p>
                </div>
              )}

              {isManager && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold">
                    {f.user.name.charAt(0)}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    Assigned to: {f.user.name}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Section title="Overdue" data={overdue} variant="red" />
      <Section title="Today" data={today} variant="amber" />
      <Section title="Upcoming" data={upcoming} variant="blue" />
    </div>
  );
}
