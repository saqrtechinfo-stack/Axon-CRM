// components/NotificationBell.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Calendar, AlertCircle, CheckCheck } from "lucide-react";
import { format, isToday, isPast } from "date-fns";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface NotificationBellProps {
  onLeadClick: (lead: any) => void; // opens the drawer
}

export function NotificationBell({ onLeadClick }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: followUps = [], mutate } = useSWR(
    "/api/notifications",
    fetcher,
    { refreshInterval: 60000 }, // refresh every 60 seconds
  );

  const overdue = followUps.filter(
    (f: any) =>
      isPast(new Date(f.scheduledAt)) && !isToday(new Date(f.scheduledAt)),
  );
  const today = followUps.filter((f: any) => isToday(new Date(f.scheduledAt)));
  const totalUrgent = overdue.length + today.length;

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
      >
        <Bell className="h-4 w-4 text-slate-600" />
        {totalUrgent > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white animate-pulse">
            {totalUrgent > 9 ? "9+" : totalUrgent}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600">
                Follow-Up Alerts
              </span>
            </div>
            <div className="flex items-center gap-2">
              {totalUrgent > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black">
                  {totalUrgent} urgent
                </span>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {followUps.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  All caught up!
                </p>
                <p className="text-[10px] text-slate-300 mt-1">
                  No pending follow-ups for today
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {/* Overdue Section */}
                {overdue.length > 0 && (
                  <div className="p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-2 px-1">
                      ● Overdue
                    </p>
                    {overdue.map((f: any) => (
                      <NotificationCard
                        key={f.id}
                        followUp={f}
                        variant="red"
                        onClick={() => {
                          onLeadClick(f.lead);
                          setIsOpen(false);
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Today Section */}
                {today.length > 0 && (
                  <div className="p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-2 px-1">
                      ● Today
                    </p>
                    {today.map((f: any) => (
                      <NotificationCard
                        key={f.id}
                        followUp={f}
                        variant="amber"
                        onClick={() => {
                          onLeadClick(f.lead);
                          setIsOpen(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {followUps.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <a
                href="/follow-ups"
                className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
              >
                View All Follow-Ups →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  followUp,
  variant,
  onClick,
}: {
  followUp: any;
  variant: "red" | "amber";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 rounded-xl mb-1.5 transition-all hover:scale-[1.01] ${
        variant === "red"
          ? "bg-red-50 hover:bg-red-100 border border-red-100"
          : "bg-amber-50 hover:bg-amber-100 border border-amber-100"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
            variant === "red" ? "bg-red-100" : "bg-amber-100"
          }`}
        >
          <AlertCircle
            className={`h-3.5 w-3.5 ${variant === "red" ? "text-red-500" : "text-amber-500"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-800 truncate">
            {followUp.lead.clientCompany}
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {followUp.notes}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="h-2.5 w-2.5 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400">
              {format(new Date(followUp.scheduledAt), "dd MMM, hh:mm a")}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
