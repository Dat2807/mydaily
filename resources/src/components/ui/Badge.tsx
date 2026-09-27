import React from "react";

type BadgeVariant = "default" | "income" | "expense" | "saving" | "warning" | "success" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "bg-[#21262d] text-[#8b949e]",
  income: "bg-[#4ade80]/10 text-[#4ade80]",
  expense: "bg-[#f87171]/10 text-[#f87171]",
  saving: "bg-[#fbbf24]/10 text-[#fbbf24]",
  warning: "bg-[#fb923c]/10 text-[#fb923c]",
  success: "bg-[#4ade80]/10 text-[#4ade80]",
  muted: "bg-[#21262d] text-[#6e7681]",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
