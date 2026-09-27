import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-4xl mb-3 opacity-60">{icon}</div>
      <h3 className="text-sm font-semibold text-[#8b949e] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#6e7681] max-w-xs mb-4">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
