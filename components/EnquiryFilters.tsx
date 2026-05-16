"use client";

import { Input } from "@/components/ui/input";
import { Search, CalendarDays, X, Filter, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface FilterProps {
  total: number;
  currentUserRole: string;
  isManager: boolean;
  activeView: string;
  viewCounts: Record<string, number>;
}

const VIEW_OPTIONS = [
  {
    value: "all",
    label: "All Team",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
  },
  {
    value: "mine",
    label: "My Leads",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "SALES_EXECUTIVE"],
  },
  {
    value: "assigned",
    label: "Assigned to Me",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER", "SALES_EXECUTIVE"],
  },
  {
    value: "unassigned",
    label: "Unassigned",
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
  },
];

export function EnquiryFilters({
  total,
  currentUserRole,
  isManager,
  activeView,
  viewCounts,
}: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );
  // ✅ Date filter collapsed by default on mobile
  const [showDateFilter, setShowDateFilter] = useState(false);

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, 400);

  const handleDateChange = (type: "from" | "to", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(type, value);
    else params.delete(type);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "all") params.delete("view");
    else params.set("view", view);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const clearViewFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    params.delete("search");
    params.delete("view");
    params.set("page", "1");
    setSearchValue("");
    router.push(`?${params.toString()}`);
  };

  const hasFilters =
    searchParams.get("from") ||
    searchParams.get("to") ||
    searchParams.get("search") ||
    searchParams.get("view");

  const fromValue = searchParams.get("from") || "";
  const toValue = searchParams.get("to") || "";
  const hasDateFilter = fromValue || toValue;

  // Filter view options based on role
  const visibleViews = VIEW_OPTIONS.filter((v) =>
    v.roles.includes(currentUserRole) ||
    (isManager && v.roles.includes("MANAGER")),
  );
  const showViewToggle =
    isManager || ["ADMIN", "SUPER_ADMIN"].includes(currentUserRole);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
      {/* ── Row 1: Search + Records count ── */}
      <div className="flex items-center gap-3 p-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search leads, company, phone..."
            className="pl-10 bg-slate-50 border-none h-9 text-sm"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </div>

        {/* Date filter toggle button */}
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all shrink-0 ${
            hasDateFilter
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Date</span>
          {hasDateFilter && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
          <ChevronDown
            className={`h-3 w-3 transition-transform ${showDateFilter ? "rotate-180" : ""}`}
          />
        </button>

        {/* Records count */}
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-100 shrink-0 hidden sm:block">
          <span className="text-blue-600">{total}</span> records
        </div>

        {/* Clear all */}
        {hasFilters && !showViewToggle && (
          <button
            onClick={clearAll}
            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors shrink-0"
            title="Clear all filters"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Row 2: Date filter — collapsible ── */}
      {showDateFilter && (
        <div className="px-3 pb-3 border-t border-slate-100 pt-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Filter by Date Range
          </p>
          {/* ✅ On mobile: stacks vertically. On sm+: side by side */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="date"
                value={fromValue}
                onChange={(e) => handleDateChange("from", e.target.value)}
                className="pl-9 text-xs bg-slate-50 border-slate-200 h-9 w-full"
              />
            </div>
            <span className="text-slate-400 text-xs font-black italic text-center py-1 sm:py-0">
              TO
            </span>
            <div className="relative flex-1">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="date"
                value={toValue}
                onChange={(e) => handleDateChange("to", e.target.value)}
                className="pl-9 text-xs bg-slate-50 border-slate-200 h-9 w-full"
              />
            </div>
            {hasDateFilter && (
              <button
                onClick={() => {
                  handleDateChange("from", "");
                  handleDateChange("to", "");
                }}
                className="text-[10px] font-black uppercase text-red-400 hover:text-red-600 px-2 shrink-0"
              >
                Clear dates
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Row 3: View toggle — only for managers/admins ── */}
      {showViewToggle && (
        <div className="px-3 pb-3 border-t border-slate-100 pt-3">
          {/* ✅ On mobile: scrollable horizontally */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            <Filter className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-1 shrink-0">
              View:
            </span>
            {visibleViews.map((v) => (
              <button
                key={v.value}
                onClick={() => handleViewChange(v.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${
                  activeView === v.value
                    ? "bg-blue-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <span>{v.label}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] ${
                    activeView === v.value
                      ? "bg-white/15 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {viewCounts[v.value] ?? 0}
                </span>
              </button>
            ))}
            {activeView !== "all" && (
              <button
                onClick={clearViewFilter}
                className="ml-1 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 hover:bg-red-100 transition-colors shrink-0"
                title="Clear view filter"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-red-500 transition-colors shrink-0"
                title="Clear all filters"
              >
                <X className="h-3 w-3" />
                All
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile only: records count ── */}
      <div className="sm:hidden px-3 pb-2 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Records: <span className="text-blue-600">{total}</span>
        </span>
        {hasDateFilter && (
          <span className="text-[9px] font-bold text-blue-500 uppercase">
            Date filter active
          </span>
        )}
      </div>
    </div>
  );
}
