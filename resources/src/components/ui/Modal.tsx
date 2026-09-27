import React, { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  footer?: React.ReactNode;
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`
          relative z-10 w-full ${sizes[size]} bg-[#161b22] border border-[#30363d]
          rounded-t-[20px] sm:rounded-[18px] shadow-2xl animate-slide-up
          flex flex-col max-h-[90vh] overflow-hidden
        `}
      >
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#30363d] shrink-0">
            <h2 className="text-base font-semibold text-[#e6edf3]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#6e7681] hover:text-[#e6edf3] transition-colors p-1 rounded-lg hover:bg-[#21262d]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-[#30363d] shrink-0 bg-[#161b22]">{footer}</div>
        )}
      </div>
    </div>
  );
}
