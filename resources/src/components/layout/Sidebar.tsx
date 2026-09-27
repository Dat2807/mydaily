import React from "react";
import type { Page } from "../../App";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="1" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="11" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "Giao dịch",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 9h12M3 5h8M3 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 7l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "plan",
    label: "Kế hoạch",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 1v4M12 1v4M2 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "savings",
    label: "Tiết kiệm",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M15 9c0 3.314-2.686 6-6 6S3 12.314 3 9s2.686-6 6-6c1.657 0 3.157.672 4.243 1.757" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 6v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "templates",
    label: "Mẫu giao dịch",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 6h6M6 9h4M6 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Báo cáo",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 14V8M7 14V5M11 14v-3M15 14V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Lịch",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 1v4M12 1v4M2 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="12" r="1" fill="currentColor" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.05 4.05l1.41 1.41M12.54 12.54l1.41 1.41M4.05 13.95l1.41-1.41M12.54 5.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onAddTransaction: () => void;
}

export default function Sidebar({ currentPage, onNavigate, onAddTransaction }: SidebarProps) {
  return (
    <aside className="h-full flex flex-col bg-[#161b22] border-r border-[#30363d]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#30363d]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#2dd4bf] rounded-[8px] flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M3 6l4-4 4 4M3 10h8" stroke="#0d1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[#e6edf3] tracking-tight">FinanceVN</span>
        </div>
      </div>

      {/* Add Transaction */}
      <div className="px-3 py-3 border-b border-[#30363d]">
        <button
          onClick={onAddTransaction}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2dd4bf] hover:bg-[#5eead4] text-[#0d1117] rounded-[10px] text-sm font-bold transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Thêm giao dịch
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all mb-0.5
              ${currentPage === item.id
                ? "bg-[#2dd4bf]/10 text-[#2dd4bf]"
                : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]"
              }
            `}
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#30363d]">
        <p className="text-xs text-[#6e7681]">FinanceVN v1.0</p>
      </div>
    </aside>
  );
}
