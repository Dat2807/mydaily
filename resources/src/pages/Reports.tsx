import React, { useState, useMemo } from "react";
import { useApp, SAVING_CATEGORY_ID } from "../store";
import { formatVND, formatVNDCompact, getCurrentMonthKey, formatMonthShort, getDateMonthKey, getPreviousMonthKey } from "../lib/format";
import Card, { CardHeader, CardTitle } from "../components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import EmptyState from "../components/ui/EmptyState";

export default function Reports() {
  const { data } = useApp();
  const { transactions, categories, monthPlans } = data;
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  // Build list of months with data
  const allMonths = useMemo(() => {
    const keys = new Set(transactions.map((t) => getDateMonthKey(t.date)));
    return Array.from(keys).sort();
  }, [transactions]);

  if (allMonths.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-bold text-[#e6edf3] mb-5">Báo cáo</h1>
        <EmptyState icon="📈" title="Chưa có dữ liệu" description="Thêm giao dịch để xem báo cáo tài chính." />
      </div>
    );
  }

  // Monthly overview data for bar chart (last 6 months)
  const last6 = allMonths.slice(-6);
  const barData = last6.map((mk) => {
    const txs = transactions.filter((t) => getDateMonthKey(t.date) === mk);
    const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const saving = txs.filter((t) => t.categoryId === SAVING_CATEGORY_ID).reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) - saving;
    return {
      month: formatMonthShort(mk),
      income: income / 1_000_000,
      expense: expense / 1_000_000,
      saving: saving / 1_000_000,
    };
  });

  // Selected month details
  const monthTx = transactions.filter((t) => getDateMonthKey(t.date) === selectedMonth);
  const monthIncome = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthSaving = monthTx.filter((t) => t.categoryId === SAVING_CATEGORY_ID).reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) - monthSaving;
  const monthNet = monthIncome - monthExpense - monthSaving;

  // Previous month for comparison
  const prevKey = getPreviousMonthKey(selectedMonth);
  const prevTx = transactions.filter((t) => getDateMonthKey(t.date) === prevKey);
  const prevIncome = prevTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevSaving = prevTx.filter((t) => t.categoryId === SAVING_CATEGORY_ID).reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) - prevSaving;

  const changePct = (curr: number, prev: number) => {
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  // Expense by category pie
  const expCats = categories.filter((c) => c.type === "expense" && c.id !== SAVING_CATEGORY_ID);
  const pieData = expCats.map((cat) => {
    const spent = monthTx.filter((t) => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0);
    return { name: `${cat.emoji} ${cat.name}`, value: spent };
  }).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);

  const PIE_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#4ade80", "#2dd4bf", "#60a5fa", "#a78bfa", "#f472b6"];

  const monthOptions = [...allMonths].reverse().map((m) => {
    const [y, mo] = m.split("-");
    return { value: m, label: `${mo}/${y}` };
  });

  const formatPct = (v: number | null) => {
    if (v === null) return null;
    const sign = v > 0 ? "+" : "";
    return `${sign}${v.toFixed(0)}%`;
  };

  const tooltipStyle = {
    backgroundColor: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "8px",
    color: "#e6edf3",
    fontSize: "12px",
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[#e6edf3]">Báo cáo</h1>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-[#161b22] border border-[#30363d] rounded-[8px] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#2dd4bf] cursor-pointer"
        >
          {monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Thu nhập", value: monthIncome, prev: prevIncome, color: "text-[#4ade80]" },
          { label: "Chi tiêu", value: monthExpense, prev: prevExpense, color: "text-[#f87171]" },
          { label: "Tiết kiệm", value: monthSaving, prev: prevSaving, color: "text-[#fbbf24]" },
          { label: "Còn lại", value: monthNet, prev: null, color: monthNet >= 0 ? "text-[#e6edf3]" : "text-[#f87171]" },
        ].map((item) => {
          const pct = item.prev !== null ? changePct(item.value, item.prev) : null;
          const pctStr = formatPct(pct);
          return (
            <div key={item.label} className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-3">
              <p className="text-[10px] text-[#6e7681] mb-1">{item.label}</p>
              <p className={`text-base font-mono font-bold ${item.color}`}>{formatVNDCompact(item.value)}</p>
              {pctStr && (
                <p className={`text-[10px] font-mono mt-0.5 ${pct! > 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                  {pctStr} so với tháng trước
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Monthly bar chart */}
      <Card className="mb-4">
        <CardTitle className="mb-4">Xu hướng 6 tháng gần nhất (triệu ₫)</CardTitle>
        {barData.length < 2 ? (
          <EmptyState icon="📊" title="Chưa đủ dữ liệu" description="Cần ít nhất 2 tháng để hiển thị xu hướng." />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barCategoryGap="25%">
              <XAxis dataKey="month" tick={{ fill: "#6e7681", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6e7681", fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}tr`, ""]} />
              <Bar dataKey="income" name="Thu nhập" fill="#4ade80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Chi tiêu" fill="#f87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saving" name="Tiết kiệm" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Legend formatter={(v) => <span style={{ color: "#8b949e", fontSize: 11 }}>{v}</span>} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Expense breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardTitle className="mb-4">Chi tiêu theo danh mục</CardTitle>
          {pieData.length === 0 ? (
            <EmptyState icon="🍕" title="Chưa có chi tiêu" description="Chưa có giao dịch chi tiêu trong tháng này." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatVND(Number(v)), ""]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Chi tiết chi tiêu</CardTitle>
          {pieData.length === 0 ? (
            <EmptyState icon="📋" title="Chưa có dữ liệu" />
          ) : (
            <div className="space-y-2">
              {pieData.map((item, i) => {
                const pct = monthExpense > 0 ? (item.value / monthExpense) * 100 : 0;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-sm text-[#8b949e]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-[#e6edf3]">{formatVNDCompact(item.value)}</span>
                      <span className="text-xs text-[#6e7681] ml-1.5">{pct.toFixed(0)}%</span>
                    </div>
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
