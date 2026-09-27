import React, { useState } from "react";
import { useApp } from "../store";
import { formatVND, formatVNDCompact } from "../lib/format";
import Card, { CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ProgressBar from "../components/ui/ProgressBar";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../components/ui/Toast";
import type { SavingGoal } from "../types";

export default function Savings() {
  const { data, addSavingGoal, updateSavingGoal, deleteSavingGoal, reorderGoals } = useApp();
  const { showToast } = useToast();
  const { savingGoals } = data;

  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingGoal | null>(null);
  const [deleteGoal, setDeleteGoal] = useState<SavingGoal | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const activeGoals = savingGoals.filter((g) => g.status === "active").sort((a, b) => a.priority - b.priority);
  const completedGoals = savingGoals.filter((g) => g.status === "completed").sort((a, b) =>
    (b.completedAt ?? "").localeCompare(a.completedAt ?? "")
  );

  const totalSaved = savingGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = savingGoals.reduce((s, g) => s + g.targetAmount, 0);

  // Form state
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formDeadline, setFormDeadline] = useState("");

  const openAdd = () => {
    setFormName(""); setFormTarget(""); setFormDeadline("");
    setEditGoal(null);
    setShowForm(true);
  };

  const openEdit = (goal: SavingGoal) => {
    setFormName(goal.name);
    setFormTarget(goal.targetAmount.toString());
    setFormDeadline(goal.deadline ?? "");
    setEditGoal(goal);
    setShowForm(true);
  };

  const handleSubmit = () => {
    const target = parseInt(formTarget) || 0;
    if (!formName.trim() || target <= 0) return;
    if (editGoal) {
      updateSavingGoal(editGoal.id, {
        name: formName.trim(),
        targetAmount: target,
        deadline: formDeadline || undefined,
      });
      showToast("Đã cập nhật mục tiêu", "success");
    } else {
      addSavingGoal({
        name: formName.trim(),
        targetAmount: target,
        deadline: formDeadline || undefined,
        priority: activeGoals.length + 1,
      });
      showToast("Đã thêm mục tiêu tiết kiệm", "success");
    }
    setShowForm(false);
  };

  const handleMoveUp = (goal: SavingGoal) => {
    const idx = activeGoals.findIndex((g) => g.id === goal.id);
    if (idx <= 0) return;
    const ids = activeGoals.map((g) => g.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    reorderGoals(ids);
  };

  const handleMoveDown = (goal: SavingGoal) => {
    const idx = activeGoals.findIndex((g) => g.id === goal.id);
    if (idx < 0 || idx >= activeGoals.length - 1) return;
    const ids = activeGoals.map((g) => g.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    reorderGoals(ids);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#e6edf3]">Tiết kiệm</h1>
          <p className="text-sm text-[#6e7681]">
            {activeGoals.length} mục tiêu đang hoạt động
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          + Thêm mục tiêu
        </Button>
      </div>

      {/* Summary */}
      {savingGoals.length > 0 && (
        <div className="bg-gradient-to-br from-[#fbbf24]/10 to-[#161b22] border border-[#fbbf24]/20 rounded-[14px] p-4 mb-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-[#6e7681] mb-0.5">Tổng đã tiết kiệm</p>
              <p className="text-2xl font-mono font-bold text-[#fbbf24]">{formatVND(totalSaved)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#6e7681] mb-0.5">Tổng mục tiêu</p>
              <p className="text-sm font-mono text-[#8b949e]">{formatVND(totalTarget)}</p>
            </div>
          </div>
          <ProgressBar value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0} color="saving" height={6} showLabel />
        </div>
      )}

      {/* Saving queue explanation */}
      {activeGoals.length > 0 && (
        <div className="bg-[#21262d] border border-[#30363d] rounded-[10px] px-4 py-3 mb-4 flex items-start gap-2">
          <span className="text-[#fbbf24] text-sm mt-0.5">💡</span>
          <p className="text-xs text-[#8b949e] leading-relaxed">
            Khi bạn ghi nhận khoản tiết kiệm, hệ thống sẽ tự động phân bổ vào <strong className="text-[#e6edf3]">{activeGoals[0]?.name}</strong> trước. Khi mục tiêu đó hoàn thành, số tiền dư sẽ chuyển sang mục tiêu tiếp theo.
          </p>
        </div>
      )}

      {/* Active goals */}
      {activeGoals.length === 0 ? (
        <EmptyState
          icon="🏦"
          title="Chưa có mục tiêu tiết kiệm"
          description="Thêm mục tiêu để bắt đầu hành trình tiết kiệm của bạn."
          action={<Button variant="primary" onClick={openAdd}>+ Thêm mục tiêu</Button>}
        />
      ) : (
        <div className="space-y-3 mb-6">
          {activeGoals.map((goal, idx) => {
            const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const isActive = idx === 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            return (
              <div
                key={goal.id}
                className={`bg-[#161b22] border rounded-[14px] p-4 transition-all ${
                  isActive ? "border-[#fbbf24]/30" : "border-[#30363d]"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive ? "bg-[#fbbf24] text-[#0d1117]" : "bg-[#21262d] text-[#6e7681]"
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#e6edf3]">{goal.name}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-[#6e7681]">Hạn: {goal.deadline}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isActive && <Badge variant="saving">Ưu tiên 1</Badge>}
                    {!isActive && <span className="text-xs text-[#6e7681]">Đang chờ</span>}
                    <button onClick={() => handleMoveUp(goal)} className="p-1 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors" title="Ưu tiên hơn">↑</button>
                    <button onClick={() => handleMoveDown(goal)} className="p-1 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded transition-colors" title="Ưu tiên thấp hơn">↓</button>
                    <button onClick={() => openEdit(goal)} className="p-1.5 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-[6px] transition-colors">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 10l1.5 1.5L10 5l-1.5-1.5L2 10zm7.5-7.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    </button>
                    <button onClick={() => setDeleteGoal(goal)} className="p-1.5 text-[#6e7681] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-[6px] transition-colors">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                </div>

                <ProgressBar value={pct} color="saving" height={6} />

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-mono text-[#fbbf24]">{formatVNDCompact(goal.currentAmount)}</span>
                  <span className="text-xs font-mono text-[#6e7681]">
                    Còn thiếu: <span className="text-[#8b949e]">{formatVNDCompact(remaining)}</span>
                  </span>
                  <span className="text-sm font-mono text-[#6e7681]">{formatVNDCompact(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-[#6e7681] uppercase tracking-wider mb-3">Đã hoàn thành ✓</h2>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-4 flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-[#4ade80]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#4ade80] text-xs">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#8b949e] line-through">{goal.name}</p>
                  <p className="text-xs text-[#6e7681] font-mono">{formatVNDCompact(goal.targetAmount)}</p>
                </div>
                <Badge variant="success">Hoàn thành</Badge>
                <button onClick={() => setDeleteGoal(goal)} className="p-1.5 text-[#6e7681] hover:text-[#f87171] rounded-[6px] transition-colors">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editGoal ? "Sửa mục tiêu" : "Thêm mục tiêu tiết kiệm"}
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!formName.trim() || !formTarget || parseInt(formTarget) <= 0}>
              {editGoal ? "Lưu" : "Thêm"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tên mục tiêu"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="VD: Laptop, Du lịch Đà Lạt..."
            autoFocus
          />
          <div>
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-1.5">Số tiền mục tiêu</label>
            <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-[8px] focus-within:border-[#2dd4bf] transition-colors">
              <input
                type="text"
                inputMode="numeric"
                value={formTarget ? parseInt(formTarget).toLocaleString("vi-VN") : ""}
                onChange={(e) => setFormTarget(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="20,000,000"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono text-[#e6edf3] placeholder:text-[#6e7681] outline-none"
              />
              <span className="pr-3 text-xs text-[#6e7681]">₫</span>
            </div>
            {formTarget && parseInt(formTarget) > 0 && (
              <p className="text-xs text-[#fbbf24] font-mono mt-1">{formatVND(parseInt(formTarget))}</p>
            )}
          </div>
          <Input
            label="Hạn chót (tuỳ chọn)"
            type="date"
            value={formDeadline}
            onChange={(e) => setFormDeadline(e.target.value)}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteGoal}
        onClose={() => setDeleteGoal(null)}
        onConfirm={() => {
          if (deleteGoal) {
            deleteSavingGoal(deleteGoal.id);
            showToast("Đã xóa mục tiêu", "success");
            setDeleteGoal(null);
          }
        }}
        title="Xóa mục tiêu"
        message={`Xóa mục tiêu "${deleteGoal?.name}"? Lịch sử phân bổ tiết kiệm sẽ bị xóa.`}
        confirmLabel="Xóa"
        danger
      />
    </div>
  );
}
