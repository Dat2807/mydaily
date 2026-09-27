import React from "react";
import { useApp, SAVING_CATEGORY_ID } from "../store";
import { formatVND, formatVNDCompact, getCurrentMonthKey, formatMonthKey, getDateMonthKey } from "../lib/format";
import Card, { CardHeader, CardTitle } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import EmptyState from "../components/ui/EmptyState";
import type { Page } from "../App";

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onAddTransaction: () => void;
}

export default function Dashboard({ onNavigate, onAddTransaction }: DashboardProps) {
  const { data } = useApp();
  const { settings, transactions, categories, monthPlans, savingGoals } = data;
  const monthKey = getCurrentMonthKey();
  const monthPlan = monthPlans.find((p) => p.monthKey === monthKey);

  // Balance calculation
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const allExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalSavings = transactions
    .filter((t) => t.type === "expense" && t.categoryId === SAVING_CATEGORY_ID)
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = allExpenses - totalSavings;
  const currentBalance = settings.startingBalance + totalIncome - allExpenses;

  // Current month stats
  const monthTx = transactions.filter((t) => getDateMonthKey(t.date) === monthKey);
  const monthIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthSavingsAmt = monthTx
    .filter((t) => t.type === "expense" && t.categoryId === SAVING_CATEGORY_ID)
    .reduce((s, t) => s + t.amount, 0);
  const monthExpenses = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) - monthSavingsAmt;
  const monthRemaining = monthIncome - monthExpenses - monthSavingsAmt;

  // Category spending this month
  const expenseCategories = categories.filter((c) => c.type === "expense" && c.id !== SAVING_CATEGORY_ID);
  const categorySpending = expenseCategories.map((cat) => {
    const spent = monthTx
      .filter((t) => t.type === "expense" && t.categoryId === cat.id)
      .reduce((s, t) => s + t.amount, 0);
    const budget = monthPlan?.budgets.find((b) => b.categoryId === cat.id)?.amount ?? 0;
    return { cat, spent, budget };
  }).filter((c) => c.spent > 0 || c.budget > 0).sort((a, b) => b.spent - a.spent);

  // Saving goals
  const activeGoals = savingGoals.filter((g) => g.status === "active").sort((a, b) => a.priority - b.priority);

  // Recent transactions
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#e6edf3]">Tổng quan</h1>
        <p className="text-sm text-[#6e7681]">{formatMonthKey(monthKey)}</p>
      </div>

      {/* Balance hero */}
      <div className="bg-gradient-to-br from-[#1c2128] to-[#161b22] border border-[#30363d] rounded-[18px] p-5 mb-5">
        <p className="text-xs font-semibold text-[#6e7681] uppercase tracking-wider mb-1">Số dư hiện tại</p>
        <p className={`text-3xl font-mono font-bold mb-4 ${currentBalance >= 0 ? "text-[#e6edf3]" : "text-[#f87171]"}`}>
          {formatVND(currentBalance)}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0d1117]/60 rounded-[10px] px-3 py-2.5">
            <p className="text-[10px] text-[#6e7681] mb-0.5">Thu nhập</p>
            <p className="text-sm font-mono font-semibold text-[#4ade80]">+{formatVNDCompact(totalIncome)}</p>
          </div>
          <div className="bg-[#0d1117]/60 rounded-[10px] px-3 py-2.5">
            <p className="text-[10px] text-[#6e7681] mb-0.5">Chi tiêu</p>
            <p className="text-sm font-mono font-semibold text-[#f87171]">-{formatVNDCompact(totalExpenses)}</p>
          </div>
          <div className="bg-[#0d1117]/60 rounded-[10px] px-3 py-2.5">
            <p className="text-[10px] text-[#6e7681] mb-0.5">Tiết kiệm</p>
            <p className="text-sm font-mono font-semibold text-[#fbbf24]">{formatVNDCompact(totalSavings)}</p>
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* This month */}
        <Card>
          <CardHeader>
            <CardTitle>Tháng này</CardTitle>
            <button onClick={() => onNavigate("plan")} className="text-xs text-[#2dd4bf] hover:text-[#5eead4]">Chi tiết →</button>
          </CardHeader>
          <div className="space-y-3">
            <Row label="Thu nhập" actual={monthIncome} planned={monthPlan?.expectedIncome} type="income" />
            <Row label="Chi tiêu" actual={monthExpenses} planned={monthPlan ? monthPlan.budgets.reduce((s, b) => s + b.amount, 0) : undefined} type="expense" />
            <Row label="Tiết kiệm" actual={monthSavingsAmt} planned={monthPlan?.expectedSaving} type="saving" />
            <div className="pt-2 border-t border-[#21262d]">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#6e7681]">Còn lại</span>
                <span className={`text-sm font-mono font-semibold ${monthRemaining >= 0 ? "text-[#e6edf3]" : "text-[#f87171]"}`}>
                  {formatVND(monthRemaining)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Budget progress */}
        <Card>
          <CardHeader>
            <CardTitle>Ngân sách</CardTitle>
            <button onClick={() => onNavigate("plan")} className="text-xs text-[#2dd4bf] hover:text-[#5eead4]">Chỉnh sửa →</button>
          </CardHeader>
          {categorySpending.length === 0 ? (
            <EmptyState icon="📊" title="Chưa có dữ liệu" description="Thêm giao dịch để xem tiến độ ngân sách" />
          ) : (
            <div className="space-y-3">
              {categorySpending.slice(0, 5).map(({ cat, spent, budget }) => {
                const pct = budget > 0 ? (spent / budget) * 100 : 0;
                const over = budget > 0 && spent > budget;
                return (
                  <div key={cat.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#8b949e] flex items-center gap-1">
                        <span>{cat.emoji}</span> {cat.name}
                        {over && <span className="text-[#fb923c] ml-1">⚠</span>}
                      </span>
                      <span className="text-xs font-mono text-[#6e7681]">
                        {formatVNDCompact(spent)}{budget > 0 ? ` / ${formatVNDCompact(budget)}` : ""}
                      </span>
                    </div>
                    {budget > 0 && (
                      <ProgressBar value={pct} color={over ? "warning" : "expense"} height={4} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Saving goals */}
        <Card>
          <CardHeader>
            <CardTitle>Mục tiêu tiết kiệm</CardTitle>
            <button onClick={() => onNavigate("savings")} className="text-xs text-[#2dd4bf] hover:text-[#5eead4]">Xem tất cả →</button>
          </CardHeader>
          {activeGoals.length === 0 ? (
            <EmptyState icon="🏦" title="Chưa có mục tiêu" description="Tạo mục tiêu tiết kiệm để bắt đầu" />
          ) : (
            <div className="space-y-4">
              {activeGoals.slice(0, 3).map((goal, idx) => {
                const pct = (goal.currentAmount / goal.targetAmount) * 100;
                const isNext = idx === 0;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <span className="text-sm font-medium text-[#e6edf3]">{goal.name}</span>
                        {isNext && (
                          <Badge variant="saving" className="ml-2 text-[10px]">Ưu tiên</Badge>
                        )}
                        {!isNext && (
                          <span className="ml-2 text-[10px] text-[#6e7681]">Đang chờ</span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-[#fbbf24]">{Math.round(pct)}%</span>
                    </div>
                    <ProgressBar value={pct} color="saving" height={5} />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs font-mono text-[#6e7681]">{formatVNDCompact(goal.currentAmount)}</span>
                      <span className="text-xs font-mono text-[#6e7681]">{formatVNDCompact(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Gần đây</CardTitle>
            <button onClick={() => onNavigate("transactions")} className="text-xs text-[#2dd4bf] hover:text-[#5eead4]">Xem tất cả →</button>
          </CardHeader>
          {recent.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Chưa có giao dịch"
              description="Thêm giao dịch đầu tiên của bạn"
              action={
                <button onClick={onAddTransaction} className="text-xs text-[#2dd4bf] hover:text-[#5eead4]">
                  + Thêm giao dịch
                </button>
              }
            />
          ) : (
            <div className="space-y-1">
              {recent.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                const isSaving = tx.categoryId === SAVING_CATEGORY_ID;
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-[#21262d] last:border-0">
                    <div className="w-8 h-8 rounded-[8px] bg-[#21262d] flex items-center justify-center text-sm shrink-0">
                      {cat?.emoji ?? "💸"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#e6edf3] truncate">{tx.note || cat?.name}</p>
                      <p className="text-xs text-[#6e7681]">{tx.date}</p>
                    </div>
                    <span className={`text-sm font-mono font-semibold shrink-0 ${
                      isSaving ? "text-[#fbbf24]" : tx.type === "income" ? "text-[#4ade80]" : "text-[#f87171]"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}{formatVNDCompact(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  actual,
  planned,
  type,
}: {
  label: string;
  actual: number;
  planned?: number;
  type: "income" | "expense" | "saving";
}) {
  const colors = { income: "text-[#4ade80]", expense: "text-[#f87171]", saving: "text-[#fbbf24]" };
  const pct = planned && planned > 0 ? (actual / planned) * 100 : null;
  const over = type === "expense" && planned && actual > planned;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#6e7681]">{label}</span>
        <div className="text-right">
          <span className={`text-sm font-mono font-semibold ${colors[type]}`}>
            {formatVNDCompact(actual)}
          </span>
          {planned !== undefined && (
            <span className="text-xs text-[#6e7681] ml-1">/ {formatVNDCompact(planned)}</span>
          )}
        </div>
      </div>
      {pct !== null && (
        <ProgressBar
          value={pct}
          color={over ? "warning" : type === "income" ? "income" : type === "saving" ? "saving" : "expense"}
          height={3}
        />
      )}
    </div>
  );
}
