"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Connection Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
      <div className="bg-red-50 p-6 rounded-full border-4 border-red-100">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">
          Connection <span className="text-red-600">Interrupted</span>
        </h2>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">
          The database took too long to respond. This usually happens during
          peak traffic or cold starts.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="font-bold border-slate-200"
        >
          REFRESH PAGE
        </Button>
        <Button
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 font-bold"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> TRY AGAIN
        </Button>
      </div>
    </div>
  );
}
