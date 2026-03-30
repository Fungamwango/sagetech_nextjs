"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppToast = {
  type: "success" | "error";
  message: string;
} | null;

type ToastContextValue = {
  toast: AppToast;
  showToast: (toast: NonNullable<AppToast>) => void;
  clearToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<AppToast>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((nextToast: NonNullable<AppToast>) => {
    setToast(nextToast);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const value = useMemo(
    () => ({ toast, showToast, clearToast }),
    [toast, showToast, clearToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <GlobalToast toast={toast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

function GlobalToast({ toast }: { toast: AppToast }) {
  if (!toast) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[80] pointer-events-none">
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl"
        style={{
          background:
            toast.type === "success"
              ? "linear-gradient(180deg, rgba(6,78,59,0.96), rgba(4,47,46,0.96))"
              : "linear-gradient(180deg, rgba(127,29,29,0.96), rgba(69,10,10,0.96))",
          border:
            toast.type === "success"
              ? "1px solid rgba(16,185,129,0.28)"
              : "1px solid rgba(248,113,113,0.28)",
        }}
      >
        <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} text-white`} />
        <p className="text-sm text-white">{toast.message}</p>
      </div>
    </div>
  );
}
