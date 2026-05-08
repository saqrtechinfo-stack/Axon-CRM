"use client";

import { Input } from "@/components/ui/input";
import { Search, CalendarDays, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce"; // npm i use-debounce

interface FilterProps {
  total: number;
}

export function EnquiryFilters({ total }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );

  // Debounce so we don't fire on every keystroke
  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Always reset to page 1 on search
    router.push(`?${params.toString()}`);
  }, 400);

  const handleDateChange = (type: "from" | "to", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    params.delete("search");
    setSearchValue("");
    router.push(`?${params.toString()}`);
  };

  const hasFilters =
    searchParams.get("from") ||
    searchParams.get("to") ||
    searchParams.get("search");

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search leads..."
            className="pl-10 bg-slate-50 border-slate-200"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </div>

        {/* Date Inputs */}
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="date"
              value={searchParams.get("from") || ""}
              onChange={(e) => handleDateChange("from", e.target.value)}
              className="pl-9 text-xs bg-slate-50 border-slate-200 h-9 w-[140px]"
            />
          </div>
          <span className="text-slate-400 text-xs font-bold italic">TO</span>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="date"
              value={searchParams.get("to") || ""}
              onChange={(e) => handleDateChange("to", e.target.value)}
              className="pl-9 text-xs bg-slate-50 border-slate-200 h-9 w-[140px]"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
        Records Found: <span className="text-blue-600">{total}</span>
      </div>
    </div>
  );
}
