import React from "react";

interface ProgressBarProps {
  value: number; // 0-100
  color?: "primary" | "income" | "expense" | "saving" | "warning";
  height?: number;
  className?: string;
  showLabel?: boolean;
}

const colors = {
  primary: "#2dd4bf",
  income: "#4ade80",
  expense: "#f87171",
  saving: "#fbbf24",
  warning: "#fb923c",
};

export default function ProgressBar({ value, color = "primary", height = 6, className = "", showLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const isOverBudget = value > 100 && color === "expense";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 bg-[#21262d] rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${clamped}%`,
            backgroundColor: isOverBudget ? colors.warning : colors[color],
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-[#6e7681] tabular-nums w-9 text-right shrink-0">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
