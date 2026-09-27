import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className = "", onClick, hover }: CardProps) {
  return (
    <div
      className={`
        bg-[#161b22] border border-[#30363d] rounded-[14px] p-5
        ${hover ? "cursor-pointer hover:border-[#484f58] hover:bg-[#1c2128] transition-all duration-150" : ""}
        ${onClick ? "cursor-pointer hover:border-[#484f58] transition-all duration-150" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-sm font-semibold text-[#8b949e] uppercase tracking-wider ${className}`}>
      {children}
    </h3>
  );
}
