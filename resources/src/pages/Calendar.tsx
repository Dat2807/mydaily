import React, { useState, useMemo } from "react";
import { useApp, SAVING_CATEGORY_ID } from "../store";
import { formatVNDCompact, formatVND, getCurrentMonthKey, getDateMonthKey, getPreviousMonthKey, getNextMonthKey, formatMonthKey, getDaysInMonth } from "../lib/format";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import type { Transaction } from "../types";

export default function Calendar() {
  const { data } = useApp();
  const { transactions, categories } = data;
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = getDaysInMonth(monthKey);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const adjustedFirst = (firstDayOfWeek + 6) % 7; // Mon=0

  // Group transactions by date
  const txByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    transactions
      .filter((t) => getDateMonthKey(t.date) === monthKey)
      .forEach((t) => {
        if (!map[t.date]) map[t.date] = [];
        map[t.date].push(t);
      });
    return map;
  }, [transactions, monthKey]);

  const selectedTxs = selectedDate ? (txByDate[selectedDate] ?? []) : [];

  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const getDayStats = (day: number) => {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const txs = txByDate[date] ?? [];
    const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, count: txs.length };
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#e6edf3]">{formatMonthKey(monthKey)}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMonthKey(getPreviousMonthKey(monthKey))}
            className="p-2 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-[8px] transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setMonthKey(getCurrentMonthKey())}
            className="px-3 py-1.5 text-xs text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-[8px] transition-colors"
          >
            Hôm nay
          </button>
          <button
            onClick={() => setMonthKey(getNextMonthKey(monthKey))}
            className="p-2 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-[8px] transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-[14px] overflow-hidden">
        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-[#30363d]">
          {dayLabels.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-[#6e7681]">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: adjustedFirst }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[64px] border-r border-b border-[#21262d]" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const { income, expense, count } = getDayStats(day);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const hasData = count > 0;

            return (
              <div
                key={day}
                onClick={() => hasData && setSelectedDate(isSelected ? null : dateStr)}
                className={`min-h-[64px] border-r border-b border-[#21262d] p-1.5 transition-all
                  ${(adjustedFirst + idx) % 7 === 6 ? "border-r-0" : ""}
                  ${hasData ? "cursor-pointer hover:bg-[#1c2128]" : ""}
                  ${isSelected ? "bg-[#2dd4bf]/5 ring-inset ring-1 ring-[#2dd4bf]/30" : ""}
                `}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full mb-1 ${
                    isToday ? "bg-[#2dd4bf] text-[#0d1117] font-bold" : "text-[#8b949e]"
                  }`}>
                    {day}
                  </span>
                  {expense > 0 && (
                    <span className="text-[9px] font-mono text-[#f87171] leading-tight">-{formatVNDCompact(expense)}</span>
                  )}
                  {income > 0 && (
                    <span className="text-[9px] font-mono text-[#4ade80] leading-tight">+{formatVNDCompact(income)}</span>
                  )}
                  {count > 0 && (
                    <span className="text-[8px] text-[#6e7681] mt-auto">{count} GD</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail modal */}
      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? new Date(selectedDate).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}
        size="sm"
      >
        {selectedTxs.length === 0 ? (
          <p className="text-sm text-[#6e7681]">Không có giao dịch nào.</p>
        ) : (
          <div className="space-y-2">
            {selectedTxs
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                const isSaving = tx.categoryId === SAVING_CATEGORY_ID;
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-[#21262d] last:border-0">
                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-base shrink-0 ${
                      isSaving ? "bg-[#fbbf24]/10" : tx.type === "income" ? "bg-[#4ade80]/10" : "bg-[#f87171]/10"
                    }`}>
                      {cat?.emoji ?? "💸"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#e6edf3]">{tx.note || cat?.name}</p>
                      <p className="text-xs text-[#6e7681]">{cat?.name}</p>
                    </div>
                    <span className={`text-sm font-mono font-semibold ${
                      isSaving ? "text-[#fbbf24]" : tx.type === "income" ? "text-[#4ade80]" : "text-[#f87171]"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}{formatVND(tx.amount)}
                    </span>
                  </div>
                );
              })}
            <div className="pt-2 border-t border-[#30363d] flex justify-between">
              <span className="text-xs text-[#6e7681]">Tổng chi</span>
              <span className="text-sm font-mono text-[#f87171]">
                -{formatVND(selectedTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0))}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
