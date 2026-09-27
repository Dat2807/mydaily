import React, { useState } from "react";
import { useApp } from "../store";
import { formatVND, formatVNDCompact } from "../lib/format";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { Select } from "../components/ui/Input";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import TransactionForm from "../components/TransactionForm";
import { useToast } from "../components/ui/Toast";
import type { Template, TransactionType } from "../types";

export default function Templates() {
  const { data, addTemplate, updateTemplate, deleteTemplate } = useApp();
  const { showToast } = useToast();
  const { templates, categories } = data;

  const [showForm, setShowForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [deleteT, setDeleteT] = useState<Template | null>(null);
  const [quickAddTemplate, setQuickAddTemplate] = useState<Template | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<TransactionType>("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formEmoji, setFormEmoji] = useState("💸");

  const filteredCats = categories.filter((c) => c.type === formType);

  const openAdd = () => {
    setFormName(""); setFormType("expense"); setFormAmount("");
    setFormCategory(categories.filter((c) => c.type === "expense")[0]?.id ?? "");
    setFormNote(""); setFormEmoji("💸");
    setEditTemplate(null);
    setShowForm(true);
  };

  const openEdit = (t: Template) => {
    setFormName(t.name); setFormType(t.type);
    setFormAmount(t.amount.toString());
    setFormCategory(t.categoryId);
    setFormNote(t.note); setFormEmoji(t.emoji);
    setEditTemplate(t);
    setShowForm(true);
  };

  const handleSubmit = () => {
    const amount = parseInt(formAmount) || 0;
    if (!formName.trim() || amount <= 0 || !formCategory) return;
    if (editTemplate) {
      updateTemplate(editTemplate.id, {
        name: formName.trim(), type: formType, amount, categoryId: formCategory,
        note: formNote.trim(), emoji: formEmoji,
      });
      showToast("Đã cập nhật mẫu", "success");
    } else {
      addTemplate({
        name: formName.trim(), type: formType, amount, categoryId: formCategory,
        note: formNote.trim(), emoji: formEmoji,
      });
      showToast("Đã thêm mẫu giao dịch", "success");
    }
    setShowForm(false);
  };

  const filtered = templates.filter((t) => filter === "all" || t.type === filter);
  const expenseTemplates = filtered.filter((t) => t.type === "expense");
  const incomeTemplates = filtered.filter((t) => t.type === "income");

  const categoryOptions = filteredCats.map((c) => ({ value: c.id, label: `${c.emoji} ${c.name}` }));

  const emojiOptions = ["💸", "☕", "🍜", "🛵", "🎮", "🛍️", "📄", "🏥", "📚", "💰", "🎁", "🍔", "🚌", "🎬", "💊", "🏋️", "🍕", "🧃"];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#e6edf3]">Mẫu giao dịch</h1>
          <p className="text-sm text-[#6e7681]">{templates.length} mẫu đã tạo</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          + Tạo mẫu
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#161b22] border border-[#30363d] rounded-[10px] p-1 mb-5 w-fit">
        {(["all", "expense", "income"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-[7px] text-sm font-medium transition-all ${
              filter === f ? "bg-[#21262d] text-[#e6edf3]" : "text-[#6e7681] hover:text-[#8b949e]"
            }`}
          >
            {f === "all" ? "Tất cả" : f === "expense" ? "Chi tiêu" : "Thu nhập"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Chưa có mẫu nào"
          description="Tạo mẫu giao dịch để ghi nhanh các giao dịch lặp lại mỗi ngày."
          action={<Button variant="primary" onClick={openAdd}>+ Tạo mẫu đầu tiên</Button>}
        />
      ) : (
        <div className="space-y-5">
          {expenseTemplates.length > 0 && (filter === "all" || filter === "expense") && (
            <div>
              {filter === "all" && <h2 className="text-xs font-semibold text-[#6e7681] uppercase tracking-wider mb-2">Chi tiêu</h2>}
              <div className="grid sm:grid-cols-2 gap-2">
                {expenseTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    categories={categories}
                    onUse={() => setQuickAddTemplate(t)}
                    onEdit={() => openEdit(t)}
                    onDelete={() => setDeleteT(t)}
                  />
                ))}
              </div>
            </div>
          )}
          {incomeTemplates.length > 0 && (filter === "all" || filter === "income") && (
            <div>
              {filter === "all" && <h2 className="text-xs font-semibold text-[#6e7681] uppercase tracking-wider mb-2">Thu nhập</h2>}
              <div className="grid sm:grid-cols-2 gap-2">
                {incomeTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    categories={categories}
                    onUse={() => setQuickAddTemplate(t)}
                    onEdit={() => openEdit(t)}
                    onDelete={() => setDeleteT(t)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTemplate ? "Sửa mẫu" : "Tạo mẫu giao dịch"}
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!formName.trim() || !formAmount || parseInt(formAmount) <= 0}>
              {editTemplate ? "Lưu" : "Tạo mẫu"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Emoji picker */}
          <div>
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-1.5">Biểu tượng</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFormEmoji(emoji)}
                  className={`w-9 h-9 rounded-[8px] text-lg transition-all ${
                    formEmoji === emoji ? "bg-[#2dd4bf]/20 ring-1 ring-[#2dd4bf]" : "bg-[#21262d] hover:bg-[#30363d]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Tên mẫu"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="VD: Cà phê sáng, Đổ xăng..."
          />

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-1.5">Loại</label>
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 rounded-[8px] text-sm font-medium transition-all ${formType === "expense" ? "bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30" : "bg-[#21262d] text-[#6e7681] border border-transparent"}`}
                onClick={() => { setFormType("expense"); setFormCategory(categories.filter((c) => c.type === "expense")[0]?.id ?? ""); }}
              >Chi tiêu</button>
              <button
                className={`flex-1 py-2 rounded-[8px] text-sm font-medium transition-all ${formType === "income" ? "bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30" : "bg-[#21262d] text-[#6e7681] border border-transparent"}`}
                onClick={() => { setFormType("income"); setFormCategory(categories.filter((c) => c.type === "income")[0]?.id ?? ""); }}
              >Thu nhập</button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-1.5">Số tiền mặc định</label>
            <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-[8px] focus-within:border-[#2dd4bf] transition-colors">
              <input
                type="text"
                inputMode="numeric"
                value={formAmount ? parseInt(formAmount).toLocaleString("vi-VN") : ""}
                onChange={(e) => setFormAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="35,000"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono text-[#e6edf3] placeholder:text-[#6e7681] outline-none"
              />
              <span className="pr-3 text-xs text-[#6e7681]">₫</span>
            </div>
          </div>

          <Select
            label="Danh mục"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            options={categoryOptions}
          />

          <Input
            label="Ghi chú mặc định (tuỳ chọn)"
            value={formNote}
            onChange={(e) => setFormNote(e.target.value)}
            placeholder="Ghi chú ngắn..."
          />
        </div>
      </Modal>

      {/* Quick add from template */}
      <TransactionForm
        open={!!quickAddTemplate}
        onClose={() => setQuickAddTemplate(null)}
        prefillTemplate={quickAddTemplate ?? undefined}
      />

      <ConfirmDialog
        open={!!deleteT}
        onClose={() => setDeleteT(null)}
        onConfirm={() => {
          if (deleteT) { deleteTemplate(deleteT.id); showToast("Đã xóa mẫu", "success"); setDeleteT(null); }
        }}
        title="Xóa mẫu"
        message={`Xóa mẫu "${deleteT?.name}"?`}
        confirmLabel="Xóa"
        danger
      />
    </div>
  );
}

function TemplateCard({
  template, categories, onUse, onEdit, onDelete,
}: {
  template: Template;
  categories: any[];
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cat = categories.find((c) => c.id === template.categoryId);
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-3 hover:border-[#484f58] transition-all group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0 ${
          template.type === "income" ? "bg-[#4ade80]/10" : "bg-[#f87171]/10"
        }`}>
          {template.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#e6edf3] truncate">{template.name}</p>
          <p className="text-xs text-[#6e7681]">{cat?.emoji} {cat?.name}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-mono font-semibold ${template.type === "income" ? "text-[#4ade80]" : "text-[#f87171]"}`}>
            {formatVNDCompact(template.amount)}
          </p>
        </div>
      </div>
      <div className="flex gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onUse}
          className="px-2.5 py-1 text-xs bg-[#2dd4bf]/10 text-[#2dd4bf] rounded-[6px] hover:bg-[#2dd4bf]/20 transition-colors"
        >
          ⚡ Dùng ngay
        </button>
        <button onClick={onEdit} className="p-1.5 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-[6px] transition-colors">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 10l1.5 1.5L10 5l-1.5-1.5L2 10zm7.5-7.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        </button>
        <button onClick={onDelete} className="p-1.5 text-[#6e7681] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-[6px] transition-colors">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
