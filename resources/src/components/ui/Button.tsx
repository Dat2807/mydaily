import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "income" | "expense";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#2dd4bf] text-[#0d1117] hover:bg-[#5eead4] font-semibold",
  secondary: "bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] border border-[#30363d]",
  ghost: "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]",
  danger: "bg-[#f87171]/10 text-[#f87171] hover:bg-[#f87171]/20 border border-[#f87171]/20",
  income: "bg-[#4ade80]/10 text-[#4ade80] hover:bg-[#4ade80]/20 border border-[#4ade80]/20",
  expense: "bg-[#f87171]/10 text-[#f87171] hover:bg-[#f87171]/20 border border-[#f87171]/20",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-[6px]",
  md: "px-4 py-2 text-sm rounded-[8px]",
  lg: "px-5 py-2.5 text-sm rounded-[10px]",
};

export default function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center gap-2 font-medium transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
