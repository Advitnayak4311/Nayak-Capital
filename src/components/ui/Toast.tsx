"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (options: { title: string; description?: string; type?: ToastType }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({
      title,
      description,
      type = "info",
    }: {
      title: string;
      description?: string;
      type?: ToastType;
    }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start justify-between rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 duration-300",
              t.type === "success" &&
                "bg-charcoal-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/40",
              t.type === "error" &&
                "bg-charcoal-900/95 border-red-500/40 text-slate-100 shadow-red-950/40",
              t.type === "warning" &&
                "bg-charcoal-900/95 border-amber-500/40 text-slate-100 shadow-amber-950/40",
              t.type === "info" &&
                "bg-charcoal-900/95 border-gold-500/40 text-slate-100 shadow-gold-950/40"
            )}
          >
            <div className="flex items-start space-x-3">
              <div className="pt-0.5">
                {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-400" />}
                {t.type === "warning" && <AlertCircle className="h-5 w-5 text-amber-400" />}
                {t.type === "info" && <Info className="h-5 w-5 text-gold-400" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold tracking-wide text-white">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition-colors ml-4 pt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
