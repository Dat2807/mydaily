import React, { createContext, useContext, useState, useCallback } from "react";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  const typeStyles = {
    success: "bg-[#161b22] border-[#4ade80]/40 text-[#4ade80]",
    error: "bg-[#161b22] border-[#f87171]/40 text-[#f87171]",
    info: "bg-[#161b22] border-[#2dd4bf]/40 text-[#2dd4bf]",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-[10px] border shadow-xl animate-slide-up pointer-events-auto ${typeStyles[t.type]}`}
          >
            <span className="text-sm font-semibold">{icons[t.type]}</span>
            <span className="text-sm text-[#e6edf3]">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
