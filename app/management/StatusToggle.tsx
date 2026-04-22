"use client";

import { toggleEmployeeStatus } from "@/actions/employee-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UserMinus, UserCheck } from "lucide-react";
import { toast } from "sonner";

export function StatusToggle({ id, status }: { id: string; status: string }) {
  const handleToggle = async () => {
    const res: any = await toggleEmployeeStatus(id, status);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(
        `Staff member is now ${status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}`,
      );
    }
  };

  return (
    <DropdownMenuItem
      onClick={handleToggle}
      className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest p-3 rounded-xl cursor-pointer ${
        status === "ACTIVE"
          ? "text-rose-500 hover:bg-rose-50"
          : "text-green-600 hover:bg-green-50"
      }`}
    >
      {status === "ACTIVE" ? (
        <>
          <UserMinus className="h-3 w-3" /> Deactivate Staff
        </>
      ) : (
        <>
          <UserCheck className="h-3 w-3" /> Reactivate Staff
        </>
      )}
    </DropdownMenuItem>
  );
}
