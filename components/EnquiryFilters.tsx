// components/EnquiryFilters.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FilterProps {
  onSearch: (term: string) => void;
  total: number;
}

export function EnquiryFilters({ onSearch, total }: FilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search name, email, or company..."
          className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="text-sm font-medium text-slate-500">
        Showing <span className="text-slate-900 font-bold">{total}</span>{" "}
        Enquiries
      </div>
    </div>
  );
}
