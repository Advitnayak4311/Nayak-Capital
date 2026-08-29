"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
        <AlertCircle className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-red-400">
          Operational Exception
        </span>
        <h1 className="text-3xl font-serif font-bold text-white">
          An Unexpected Error Occurred
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Our security safeguards have isolated this session. Please try refreshing or return to the main dashboard.
        </p>
      </div>
      <Button
        variant="luxury"
        size="md"
        onClick={() => reset()}
        className="text-xs uppercase tracking-wider font-bold"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        <span>Retry Operation</span>
      </Button>
    </div>
  );
}
