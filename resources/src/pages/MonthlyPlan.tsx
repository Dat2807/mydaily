import React, { useState, useEffect, useMemo } from "react";
import { useApp, SAVING_CATEGORY_ID } from "../store";
import { formatVND, formatVNDCompact, getCurrentMonthKey, formatMonthKey, getDateMonthKey, getPreviousMonthKey, getNextMonthKey } from "../lib/format";
import Card, { CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ProgressBar from "../components/ui/ProgressBar";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";
import type { MonthPlan } from "../types";

export default function MonthlyPlan() {
  const { data, saveMonthPlan, createMonthFromPrevious } = useApp();
  const { showToast } = useToast();
  const { transactions, categories, monthPlans } = data;

  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());
  const [editing, setEditing] = useState(false);
  const [showNewMonthModal, setShowNewMonthModal] = useState(false);

  const plan = monthPlans.find((p) => p.monthKey === monthKey);
  const prevKey = getPreviousMonthKey(monthKey);
  const prevPlan = monthPlans.find((p) => p.monthKey === prevKey);

  // Current month actuals
  const monthTx = useMemo(() =>
    transactions.filter((t) => getDateMonthKey(t.date) === monthKey),
    [transactions, monthKey]
  );
  const actualIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const actualSaving = monthTx.filter((t) => t.categoryId === SAVING_CATEGORY_ID).reduce((s, t) => s + t.amount, 0);
  const actualExpenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) - actualSaving;

  const expenseCategories = categories.filter((c) => c.type === "expense" && c.id !== SAVING_CATEGORY_ID);

  // Edit state
  const [editIncome, setEditIncome] = useState("");
  const [editSaving, setEditSaving] = useState("");
  const [editBudgets, setEditBudgets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editing && plan) {
      setEditIncome(plan.expectedIncome.toString());
      setEditSaving(plan.expectedSaving.toString());
      const budgets: Record<string, string> = {};
      plan.budgets.forEach((b) => { budgets[b.categoryId] = b.amount.toString(); });
      setEditBudgets(budgets);
    } else if (editing) {
      setEditIncome("");
      setEditSaving("");
      setEditBudgets({});
    }
  }, [editing, plan]);

  const handleSave = () => {
    const newPlan: Omit<MonthPlan, "createdAt"> = {
      monthKey,
      expectedIncome: parseInt(editIncome) || 0,
      expectedSaving: parseInt(editSaving) || 0,
      budgets: expenseCategories
        .filter((c) => editBudgets[c.id] && parseInt(editBudgets[c.id]) > 0)
        .map((c) => ({ categoryId: c.id, amount: parseInt(editBudgets[c.id]) })),
    };
    saveMonthPlan(newPlan);
    setEditing(false);
    showToast("Đã lưu kế hoạch tháng", "success");
  };

  const handleNewMonth = (reuse: boolean) => {
    if (reuse) {
      createMonthFromPrevious(monthKey);
      showToast("Đã tạo kế hoạch từ tháng trước", "success");
    } else {
      saveMonthPlan({
        monthKey,
        expectedIncome: 0,
        expectedSaving: 0,
        budgets: [],
      });
    }
    setShowNewMonthModal(false);
    setEditing(true);
  };

  const totalBudget = plan?.budgets.reduce((s, b) => s + b.amount, 0) ?? 0;
  const remaining = actualIncome - actualExpenses - actualSaving;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#e6edf3]">Kế hoạch tháng</h1>
          <p className="text-sm text-[#6e7681]">{formatMonthKey(monthKey)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthKey(getPreviousMonthKey(monthKey))}
            className="p-2 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-[8px] transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setMonthKey(getNextMonthKey(monthKey))}
            className="p-2 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-[8px] transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {!plan && !editing ? (
        <EmptyState
          icon="📅"
          title="Chưa có kế hoạch cho tháng này"
          description="Tạo kế hoạch để theo dõi ngân sách và mục tiêu tháng này."
          action={
            <Button
              variant="primary"
              onClick={() => {
                if (prevPlan) setShowNewMonthModal(true);
                else { saveMonthPlan({ monthKey, expectedIncome: 0, expectedSaving: 0, budgets: [] }); setEditing(true); }
              }}
            >
              Tạo kế hoạch
            </Button>
          }
        />
      ) : editing ? (
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-4">Thu nhập & Tiết kiệm dự kiến</CardTitle>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-1.5">Thu nhập dự kiến</label>
                <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-[8px] focus-within:border-[#2dd4bf] transition-colors">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editIncome ? parseInt(editIncome).toLocaleString("vi-VN") : ""}
                    onChange={(e) => setEditIncome(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="15,000,000"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono text-[#e6edf3] placeholder:text-[#6e7681] outline-none"
                  />
                  <span className="pr-3 text-xs text-[#6e7681]">₫</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-1.5">Tiết kiệm dự kiến</label>
                <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-[8px] focus-within:border-[#2dd4bf] transition-colors">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editSaving ? parseInt(editSaving).toLocaleString("vi-VN") : ""}
                    onChange={(e) => setEditSaving(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="5,000,000"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono text-[#e6edf3] placeholder:text-[#6e7681] outline-none"
                  />
                  <span className="pr-3 text-xs text-[#6e7681]">₫</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Ngân sách theo danh mục</CardTitle>
            <div className="grid sm:grid-cols-2 gap-3">
              {expenseCategories.map((cat) => (
                <div key={cat.id}>
                  <label className="text-xs text-[#8b949e] flex items-center gap-1 mb-1.5">
                    <span>{cat.emoji}</span> {cat.name}
                  </label>
                  <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-[8px] focus-within:border-[#2dd4bf] transition-colors">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editBudgets[cat.id] ? parseInt(editBudgets[cat.id]).toLocaleString("vi-VN") : ""}
                      onChange={(e) => setEditBudgets((prev) => ({ ...prev, [cat.id]: e.target.value.replace(/[^0-9]/g, "") }))}
                      placeholder="0"
                      className="flex-1 bg-transparent px-3 py-2 text-sm font-mono text-[#e6edf3] placeholder:text-[#6e7681] outline-none"
                    />
                    <span className="pr-3 text-xs text-[#6e7681]">₫</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditing(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>Lưu kế hoạch</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Thu nhập" actual={actualIncome} planned={plan!.expectedIncome} color="income" />
            <StatCard label="Chi tiêu" actual={actualExpenses} planned={totalBudget} color="expense" />
            <StatCard label="Tiết kiệm" actual={actualSaving} planned={plan!.expectedSaving} color="saving" />
            <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-3">
              <p className="text-[10px] text-[#6e7681] mb-1">Còn lại</p>
              <p className={`text-base font-mono font-bold ${remaining >= 0 ? "text-[#e6edf3]" : "text-[#f87171]"}`}>
                {formatVNDCompact(remaining)}
              </p>
            </div>
          </div>

          {/* Budget breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Ngân sách chi tiêu</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Chỉnh sửa</Button>
            </CardHeader>
            {plan!.budgets.length === 0 ? (
              <EmptyState icon="📊" title="Chưa có ngân sách" description="Thiết lập ngân sách cho từng danh mục" action={<Button variant="primary" size="sm" onClick={() => setEditing(true)}>Thiết lập ngân sách</Button>} />
            ) : (
              <div className="space-y-4">
                {expenseCategories.map((cat) => {
                  const budget = plan!.budgets.find((b) => b.categoryId === cat.id)?.amount ?? 0;
                  const spent = monthTx
                    .filter((t) => t.type === "expense" && t.categoryId === cat.id)
                    .reduce((s, t) => s + t.amount, 0);
                  if (budget === 0 && spent === 0) return null;
                  const pct = budget > 0 ? (spent / budget) * 100 : 0;
                  const over = budget > 0 && spent > budget;
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-[#e6edf3] flex items-center gap-2">
                          <span>{cat.emoji}</span> {cat.name}
                          {over && <span className="text-xs text-[#fb923c] font-medium">⚠ Vượt ngân sách</span>}
                        </span>
                        <span className="text-sm font-mono text-[#8b949e]">
                          <span className={over ? "text-[#fb923c]" : "text-[#e6edf3]"}>{formatVNDCompact(spent)}</span>
                          {budget > 0 && <span className="text-[#6e7681]"> / {formatVNDCompact(budget)}</span>}
                        </span>
                      </div>
                      {budget > 0 && <ProgressBar value={pct} color={over ? "warning" : "expense"} height={5} showLabel />}
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* New month modal */}
      <Modal
        open={showNewMonthModal}
        onClose={() => setShowNewMonthModal(false)}
        title="Tạo kế hoạch tháng mới"
        size="sm"
      >
        <p className="text-sm text-[#8b949e] mb-4">
          Bạn có muốn sử dụng lại kế hoạch của tháng trước không?
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="primary" className="w-full justify-center" onClick={() => handleNewMonth(true)}>
            Dùng lại kế hoạch tháng trước
          </Button>
          <Button variant="secondary" className="w-full justify-center" onClick={() => handleNewMonth(false)}>
            Bắt đầu từ đầu
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, actual, planned, color }: { label: string; actual: number; planned: number; color: "income" | "expense" | "saving" }) {
  const colors = { income: "text-[#4ade80]", expense: "text-[#f87171]", saving: "text-[#fbbf24]" };
  const over = color === "expense" && planned > 0 && actual > planned;
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-3">
      <p className="text-[10px] text-[#6e7681] mb-1">{label}</p>
      <p className={`text-base font-mono font-bold ${over ? "text-[#fb923c]" : colors[color]}`}>
        {formatVNDCompact(actual)}
      </p>
      {planned > 0 && (
        <p className="text-[10px] text-[#6e7681] font-mono mt-0.5">/ {formatVNDCompact(planned)}</p>
      )}
    </div>
  );
}
