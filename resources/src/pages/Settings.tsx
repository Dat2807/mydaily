import React, { useState } from "react";
import { useApp } from "../store";
import { formatVND } from "../lib/format";
import Card, { CardHeader, CardTitle } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";
import type { Category, TransactionType } from "../types";

export default function Settings() {
  const { data, addCategory, updateCategory, deleteCategory, completeSetup } = useApp();
  const { showToast } = useToast();
  const { categories, settings } = data;

  const [catTab, setCatTab] = useState<TransactionType>("expense");
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("📌");

  const [showBalanceForm, setShowBalanceForm] = useState(false);
  const [newBalance, setNewBalance] = useState("");

  const filteredCats = categories.filter((c) => c.type === catTab);

  const openAddCat = () => {
    setCatName(""); setCatEmoji("📌"); setEditCat(null); setShowCatForm(true);
  };
  const openEditCat = (cat: Category) => {
    setCatName(cat.name); setCatEmoji(cat.emoji); setEditCat(cat); setShowCatForm(true);
  };

  const handleSaveCat = () => {
    if (!catName.trim()) return;
    if (editCat) {
      updateCategory(editCat.id, catName.trim(), catEmoji);
      showToast("Đã cập nhật danh mục", "success");
    } else {
      addCategory(catTab, catName.trim(), catEmoji);
      showToast("Đã thêm danh mục", "success");
    }
    setShowCatForm(false);
  };

  const handleSaveBalance = () => {
    const amount = parseInt(newBalance.replace(/[^0-9]/g, ""), 10);
    if (amount > 0) {
      completeSetup(amount);
      showToast("Đã cập nhật số dư ban đầu", "success");
      setShowBalanceForm(false);
    }
  };

  const emojiOptions = [
    "📌", "🍜", "🛵", "🎮", "🛍️", "📄", "🏥", "📚", "🏦",
    "💸", "☕", "🍔", "🚌", "🎬", "💊", "🏋️", "🍕", "🧃",
    "💰", "🎁", "💻", "🎀", "📥", "📤", "🏠", "✈️", "🎓",
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-[#e6edf3] mb-5">Cài đặt</h1>

      {/* Starting balance */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Số dư ban đầu</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => { setNewBalance(settings.startingBalance.toString()); setShowBalanceForm(true); }}>
            Chỉnh sửa
          </Button>
        </CardHeader>
        <p className="text-2xl font-mono font-bold text-[#e6edf3]">{formatVND(settings.startingBalance)}</p>
        <p className="text-xs text-[#6e7681] mt-1">Số dư được nhập lúc bắt đầu sử dụng ứng dụng.</p>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Danh mục</CardTitle>
          <Button variant="primary" size="sm" onClick={openAddCat}>+ Thêm</Button>
        </CardHeader>

        {/* Tab */}
        <div className="flex gap-1 bg-[#0d1117] rounded-[8px] p-1 mb-4 w-fit">
          <button
            onClick={() => setCatTab("expense")}
            className={`px-4 py-1.5 rounded-[6px] text-xs font-medium transition-all ${catTab === "expense" ? "bg-[#21262d] text-[#e6edf3]" : "text-[#6e7681]"}`}
          >
            Chi tiêu
          </button>
          <button
            onClick={() => setCatTab("income")}
            className={`px-4 py-1.5 rounded-[6px] text-xs font-medium transition-all ${catTab === "income" ? "bg-[#21262d] text-[#e6edf3]" : "text-[#6e7681]"}`}
          >
            Thu nhập
          </button>
        </div>

        {filteredCats.length === 0 ? (
          <EmptyState icon="📂" title="Chưa có danh mục" action={<Button variant="primary" size="sm" onClick={openAddCat}>+ Thêm danh mục</Button>} />
        ) : (
          <div className="space-y-1">
            {filteredCats.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-[#21262d] transition-colors group">
                <span className="text-lg w-7 text-center">{cat.emoji}</span>
                <span className="flex-1 text-sm text-[#e6edf3]">{cat.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditCat(cat)}
                    className="p-1.5 text-[#6e7681] hover:text-[#e6edf3] rounded-[6px] transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 10l1.5 1.5L10 5l-1.5-1.5L2 10zm7.5-7.5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  </button>
                  <button
                    onClick={() => setDeleteCat(cat)}
                    className="p-1.5 text-[#6e7681] hover:text-[#f87171] rounded-[6px] transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4l1 8h6l1-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* App info */}
      <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-[12px]">
        <p className="text-xs text-[#6e7681]">
          <strong className="text-[#8b949e]">FinanceVN</strong> — Dữ liệu lưu trên thiết bị. Không kết nối internet.
        </p>
      </div>

      {/* Category form modal */}
      <Modal
        open={showCatForm}
        onClose={() => setShowCatForm(false)}
        title={editCat ? "Sửa danh mục" : "Thêm danh mục"}
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCatForm(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveCat} disabled={!catName.trim()}>
              {editCat ? "Lưu" : "Thêm"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-2">Biểu tượng</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setCatEmoji(emoji)}
                  className={`w-9 h-9 rounded-[8px] text-lg transition-all ${
                    catEmoji === emoji ? "bg-[#2dd4bf]/20 ring-1 ring-[#2dd4bf]" : "bg-[#21262d] hover:bg-[#30363d]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Tên danh mục"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="VD: Ăn uống, Giải trí..."
            autoFocus
          />
        </div>
      </Modal>

      {/* Balance form */}
      <Modal
        open={showBalanceForm}
        onClose={() => setShowBalanceForm(false)}
        title="Cập nhật số dư ban đầu"
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowBalanceForm(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveBalance} disabled={!newBalance || parseInt(newBalance.replace(/\D/g, "")) <= 0}>
              Lưu
            </Button>
          </div>
        }
      >
        <div>
          <p className="text-sm text-[#8b949e] mb-4">Thay đổi này ảnh hưởng đến số dư hiện tại của bạn.</p>
          <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-[8px] focus-within:border-[#2dd4bf] transition-colors">
            <input
              type="text"
              inputMode="numeric"
              value={newBalance ? parseInt(newBalance.replace(/\D/g, "")).toLocaleString("vi-VN") : ""}
              onChange={(e) => setNewBalance(e.target.value.replace(/[^0-9]/g, ""))}
              className="flex-1 bg-transparent px-3 py-3 text-lg font-mono text-[#e6edf3] placeholder:text-[#6e7681] outline-none"
              placeholder="20,000,000"
              autoFocus
            />
            <span className="pr-3 text-sm text-[#6e7681] font-mono">₫</span>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteCat}
        onClose={() => setDeleteCat(null)}
        onConfirm={() => {
          if (deleteCat) { deleteCategory(deleteCat.id); showToast("Đã xóa danh mục", "success"); setDeleteCat(null); }
        }}
        title="Xóa danh mục"
        message={`Xóa danh mục "${deleteCat?.name}"? Các giao dịch thuộc danh mục này sẽ không bị xóa.`}
        confirmLabel="Xóa"
        danger
      />
    </div>
  );
}
