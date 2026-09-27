import React, { useState, useEffect } from "react";
import { useApp, SAVING_CATEGORY_ID } from "../store";
import type { Transaction, Template, TransactionType } from "../types";
import { todayString, parseAmount, formatVND } from "../lib/format";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Select } from "./ui/Input";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  editTransaction?: Transaction;
  prefillTemplate?: Template;
  defaultType?: TransactionType;
}

export default function TransactionForm({
  open,
  onClose,
  editTransaction,
  prefillTemplate,
  defaultType = "expense",
}: TransactionFormProps) {
  const { data, addTransaction, updateTransaction } = useApp();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayString());
  const [note, setNote] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredCategories = data.categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!open) return;
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setCategoryId(editTransaction.categoryId);
      setDate(editTransaction.date);
      setNote(editTransaction.note);
    } else if (prefillTemplate) {
      setType(prefillTemplate.type);
      setAmount(prefillTemplate.amount.toString());
      setCategoryId(prefillTemplate.categoryId);
      setDate(todayString());
      setNote(prefillTemplate.note);
    } else {
      setType(defaultType);
      setAmount("");
      setCategoryId("");
      setDate(todayString());
      setNote("");
    }
  }, [open, editTransaction, prefillTemplate, defaultType]);

  // Auto-select first category when type changes
  useEffect(() => {
    const cats = data.categories.filter((c) => c.type === type);
    if (cats.length > 0 && !cats.find((c) => c.id === categoryId)) {
      setCategoryId(cats[0].id);
    }
  }, [type, data.categories]);

  const handleAmountInput = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setAmount(clean);
  };

  const handleSubmit = () => {
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!categoryId) return;
    if (!date) return;

    const txData = {
      type,
      amount: parsedAmount,
      categoryId,
      date,
      note: note.trim(),
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, txData);
    } else {
      addTransaction(txData);
    }
    onClose();
  };

  const applyTemplate = (t: Template) => {
    setType(t.type);
    setAmount(t.amount.toString());
    setCategoryId(t.categoryId);
    setNote(t.note);
    setShowTemplates(false);
  };

  const categoryOptions = filteredCategories.map((c) => ({
    value: c.id,
    label: `${c.emoji} ${c.name}`,
  }));

  const amountNum = parseInt(amount, 10) || 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editTransaction ? "Sửa giao dịch" : "Thêm giao dịch"}
      size="md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!amount || parseInt(amount) <= 0 || !categoryId}
          >
            {editTransaction ? "Lưu thay đổi" : "Thêm"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Type selector */}
        <div className="flex gap-2">
          <button
            className={`flex-1 py-2.5 rounded-[8px] text-sm font-semibold transition-all ${
              type === "expense"
                ? "bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30"
                : "bg-[#21262d] text-[#6e7681] border border-transparent hover:border-[#30363d]"
            }`}
            onClick={() => setType("expense")}
          >
            Chi tiêu
          </button>
          <button
            className={`flex-1 py-2.5 rounded-[8px] text-sm font-semibold transition-all ${
              type === "income"
                ? "bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30"
                : "bg-[#21262d] text-[#6e7681] border border-transparent hover:border-[#30363d]"
            }`}
            onClick={() => setType("income")}
          >
            Thu nhập
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-1.5">Số tiền</label>
          <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-[8px] focus-within:border-[#2dd4bf] transition-colors">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amount ? parseInt(amount).toLocaleString("vi-VN") : ""}
              onChange={(e) => handleAmountInput(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent px-3 py-3 text-lg font-mono text-[#e6edf3] placeholder:text-[#6e7681] outline-none"
            />
            <span className="pr-3 text-sm text-[#6e7681] font-mono">₫</span>
          </div>
          {amountNum > 0 && (
            <p className="text-xs text-[#6e7681] mt-1 font-mono">{formatVND(amountNum)}</p>
          )}
        </div>

        {/* Category */}
        <Select
          label="Danh mục"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
        />

        {/* Date */}
        <Input
          label="Ngày"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Note */}
        <Input
          label="Ghi chú (tuỳ chọn)"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú ngắn..."
        />

        {/* Templates shortcut */}
        {!editTransaction && data.templates.length > 0 && (
          <div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-xs text-[#2dd4bf] hover:text-[#5eead4] transition-colors"
            >
              {showTemplates ? "Ẩn mẫu" : "⚡ Dùng mẫu nhanh"}
            </button>
            {showTemplates && (
              <div className="mt-2 flex flex-wrap gap-2">
                {data.templates
                  .filter((t) => t.type === type)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] rounded-[6px] text-xs text-[#e6edf3] transition-colors border border-[#30363d]"
                    >
                      <span>{t.emoji}</span>
                      <span>{t.name}</span>
                      <span className="text-[#6e7681] font-mono">{(t.amount / 1000).toFixed(0)}k</span>
                    </button>
                  ))}
                {data.templates.filter((t) => t.type === type).length === 0 && (
                  <p className="text-xs text-[#6e7681]">Không có mẫu nào cho loại này</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
