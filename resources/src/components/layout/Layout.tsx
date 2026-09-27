import React from "react";
import Sidebar from "./Sidebar";
import type { Page } from "../../App";

const pageTitles: Record<Page, string> = {
  dashboard: "Tổng quan",
  transactions: "Giao dịch",
  plan: "Kế hoạch tháng",
  savings: "Tiết kiệm",
  templates: "Mẫu giao dịch",
  reports: "Báo cáo",
  calendar: "Lịch",
  settings: "Cài đặt",
};

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onAddTransaction: () => void;
  children: React.ReactNode;
}

export default function Layout({ currentPage, onNavigate, onAddTransaction, children }: LayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden bg-[#0d1117]">
      {/* Sidebar — desktop */}
      <div className="hidden md:flex md:w-56 lg:w-60 shrink-0">
        <div className="w-full">
          <Sidebar
            currentPage={currentPage}
            onNavigate={onNavigate}
            onAddTransaction={onAddTransaction}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2dd4bf] rounded-[6px] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M3 6l4-4 4 4M3 10h8" stroke="#0d1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[#e6edf3]">{pageTitles[currentPage]}</span>
          </div>
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2dd4bf] text-[#0d1117] rounded-[8px] text-xs font-bold"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Thêm
          </button>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex bg-[#161b22] border-t border-[#30363d] shrink-0">
          {(["dashboard", "transactions", "plan", "savings", "settings"] as Page[]).map((page) => {
            const icons: Record<string, React.ReactNode> = {
              dashboard: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="1" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" /><rect x="1" y="11" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="11" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" /></svg>,
              transactions: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M3 5h8M3 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M13 7l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
              plan: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M6 1v4M12 1v4M2 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
              savings: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M15 9c0 3.314-2.686 6-6 6S3 12.314 3 9s2.686-6 6-6c1.657 0 3.157.672 4.243 1.757" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M9 6v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
              settings: <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.05 4.05l1.41 1.41M12.54 12.54l1.41 1.41M4.05 13.95l1.41-1.41M12.54 5.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
            };
            const labels: Record<string, string> = {
              dashboard: "Tổng quan",
              transactions: "Giao dịch",
              plan: "Kế hoạch",
              savings: "Tiết kiệm",
              settings: "Cài đặt",
            };
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all ${
                  isActive ? "text-[#2dd4bf]" : "text-[#6e7681] hover:text-[#8b949e]"
                }`}
              >
                {icons[page]}
                <span className="text-[10px] font-medium">{labels[page]}</span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
