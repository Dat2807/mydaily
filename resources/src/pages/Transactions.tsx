import React, { useState, useMemo } from "react";
import { useApp, SAVING_CATEGORY_ID } from "../store";
import { formatVND, formatVNDCompact, getCurrentMonthKey, getDateMonthKey } from "../lib/format";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import TransactionForm from "../components/TransactionForm";
import type { Transaction } from "../types";
import { useToast } from "../components/ui/Toast";

interface TransactionsProps {
  onAddTransaction: () => void;
}

export default function Transactions({ onAddTransaction }: TransactionsProps) {
  const { data, deleteTransaction } = useApp();
  const { showToast } = useToast();
  const { transactions, categories } = data;

  const [monthFilter, setMonthFilter] = useState(getCurrentMonthKey());
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense" | "saving">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);

  // All months that have transactions
  const months = useMemo(() => {
    const keys = new Set(transactions.map((t) => getDateMonthKey(t.date)));
    return Array.from(keys).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (monthFilter !== "all" && getDateMonthKey(t.date) !== monthFilter) return false;
        if (typeFilter === "saving") {
          if (t.categoryId !== SAVING_CATEGORY_ID) return false;
        } else if (typeFilter !== "all") {
          if (t.type !== typeFilter) return false;
          if (t.categoryId === SAVING_CATEGORY_ID) return false;
        }
        if (categoryFilter !== "all" && t.categoryId !== categoryFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          const cat = categories.find((c) => c.id === t.categoryId);
          if (
            !t.note?.toLowerCase().includes(q) &&
            !cat?.name.toLowerCase().includes(q)
          ) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.localeCompare(a.createdAt));
  }, [transactions, monthFilter, typeFilter, categoryFilter, search, categories]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach((t) => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const summary = useMemo(() => {
    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const saving = filtered.filter((t) => t.categoryId === SAVING_CATEGORY_ID).reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) - saving;
    return { income, expense, saving };
  }, [filtered]);

  const monthOptions = [
    { value: "all", label: "Tất cả tháng" },
    ...months.map((m) => {
      const [y, mo] = m.split("-");
      return { value: m, label: `${mo}/${y}` };
    }),
  ];

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    ...categories.map((c) => ({ value: c.id, label: `${c.emoji} ${c.name}` })),
  ];

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) return "Hôm nay";
    if (dateStr === yesterday.toISOString().split("T")[0]) return "Hôm qua";
    return date.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#e6edf3]">Giao dịch</h1>
          <p className="text-sm text-[#6e7681]">{filtered.length} giao dịch</p>
        </div>
        <Button variant="primary" size="sm" onClick={onAddTransaction}>
          + Thêm
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-3">
          <p className="text-[10px] text-[#6e7681] mb-0.5">Thu nhập</p>
          <p className="text-sm font-mono font-semibold text-[#4ade80]">+{formatVNDCompact(summary.income)}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-3">
          <p className="text-[10px] text-[#6e7681] mb-0.5">Chi tiêu</p>
          <p className="text-sm font-mono font-semibold text-[#f87171]">-{formatVNDCompact(summary.expense)}</p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-3">
          <p className="text-[10px] text-[#6e7681] mb-0.5">Tiết kiệm</p>
          <p className="text-sm font-mono font-semibold text-[#fbbf24]">{formatVNDCompact(summary.saving)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-[8px] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#6e7681] outline-none focus:border-[#2dd4bf] transition-colors"
        />
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="bg-[#161b22] border border-[#30363d] rounded-[8px] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#2dd4bf] cursor-pointer"
        >
          {monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="bg-[#161b22] border border-[#30363d] rounded-[8px] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#2dd4bf] cursor-pointer"
        >
          <option value="all">Tất cả loại</option>
          <option value="income">Thu nhập</option>
          <option value="expense">Chi tiêu</option>
          <option value="saving">Tiết kiệm</option>
        </select>
      </div>

      {/* Transaction list */}
      {grouped.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Không có giao dịch"
          description="Chưa có giao dịch nào phù hợp với bộ lọc."
          action={<Button variant="primary" size="sm" onClick={onAddTransaction}>+ Thêm giao dịch</Button>}
        />
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, txs]) => {
            const dayIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
            const dayExpense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-[#6e7681] uppercase tracking-wide">{formatDateLabel(date)}</h3>
                  <div className="flex gap-3">
                    {dayIncome > 0 && <span className="text-xs font-mono text-[#4ade80]">+{formatVNDCompact(dayIncome)}</span>}
                    {dayExpense > 0 && <span className="text-xs font-mono text-[#f87171]">-{formatVNDCompact(dayExpense)}</span>}
                  </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] overflow-hidden">
                  {txs.map((tx, idx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const isSaving = tx.categoryId === SAVING_CATEGORY_ID;
                    return (
                      <div
                        key={tx.id}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1c2128] transition-colors group ${idx < txs.length - 1 ? "border-b border-[#21262d]" : ""}`}
                      >
                        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-base shrink-0 ${
                          isSaving ? "bg-[#fbbf24]/10" : tx.type === "income" ? "bg-[#4ade80]/10" : "bg-[#f87171]/10"
                        }`}>
                          {cat?.emoji ?? "💸"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#e6edf3] truncate">{tx.note || cat?.name}</p>
                          <p className="text-xs text-[#6e7681]">{cat?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-mono font-semibold ${
                            isSaving ? "text-[#fbbf24]" : tx.type === "income" ? "text-[#4ade80]" : "text-[#f87171]"
                          }`}>
                            {tx.type === "income" ? "+" : "-"}{formatVND(tx.amount)}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditTx(tx)}
                            className="p-1.5 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-[6px] transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                              <path d="M2 10l1.5 1.5L10 5l-1.5-1.5L2 10zm7.5-7.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTx(tx)}
                            className="p-1.5 text-[#6e7681] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-[6px] transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                              <path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      <TransactionForm
        open={!!editTx}
        onClose={() => setEditTx(null)}
        editTransaction={editTx ?? undefined}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={() => {
          if (deleteTx) {
            deleteTransaction(deleteTx.id);
            showToast("Đã xóa giao dịch", "success");
            setDeleteTx(null);
          }
        }}
        title="Xóa giao dịch"
        message={`Bạn có chắc chắn muốn xóa giao dịch "${deleteTx?.note || categories.find(c => c.id === deleteTx?.categoryId)?.name}" không?`}
        confirmLabel="Xóa"
        danger
      />
    </div>
  );
}
