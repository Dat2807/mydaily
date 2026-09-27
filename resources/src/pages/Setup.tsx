import React, { useState } from "react";
import { useApp } from "../store";
import { formatVND } from "../lib/format";
import Button from "../components/ui/Button";

export default function Setup() {
  const { completeSetup } = useApp();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");

  const amount = parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;

  const handleInput = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setRaw(clean);
    setError("");
  };

  const handleSubmit = () => {
    if (amount <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ.");
      return;
    }
    completeSetup(amount);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#2dd4bf] rounded-[12px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M3 6l4-4 4 4M3 10h8" stroke="#0d1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#e6edf3]">FinanceVN</h1>
            <p className="text-xs text-[#6e7681]">Quản lý tài chính cá nhân</p>
          </div>
        </div>

        {/* Welcome card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-[18px] p-6">
          <h2 className="text-xl font-bold text-[#e6edf3] mb-1">Xin chào! 👋</h2>
          <p className="text-sm text-[#8b949e] mb-6 leading-relaxed">
            Để bắt đầu, hãy cho tôi biết bạn hiện có bao nhiêu tiền. Số dư này chỉ cần nhập một lần.
          </p>

          <div className="mb-4">
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide block mb-2">
              Số dư hiện tại
            </label>
            <div className={`flex items-center bg-[#0d1117] border rounded-[10px] transition-colors ${error ? "border-[#f87171]" : "border-[#30363d] focus-within:border-[#2dd4bf]"}`}>
              <input
                type="text"
                inputMode="numeric"
                value={raw ? parseInt(raw).toLocaleString("vi-VN") : ""}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="20,000,000"
                className="flex-1 bg-transparent px-4 py-4 text-2xl font-mono text-[#e6edf3] placeholder:text-[#30363d] outline-none"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <span className="pr-4 text-base text-[#6e7681] font-mono">₫</span>
            </div>
            {error && <p className="text-xs text-[#f87171] mt-1">{error}</p>}
            {amount > 0 && !error && (
              <p className="text-xs text-[#2dd4bf] mt-1 font-mono">{formatVND(amount)}</p>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center"
            onClick={handleSubmit}
            disabled={amount <= 0}
          >
            Bắt đầu quản lý tài chính
          </Button>
        </div>

        <p className="text-xs text-[#6e7681] text-center mt-4">
          Dữ liệu được lưu trữ hoàn toàn trên thiết bị của bạn.
        </p>
      </div>
    </div>
  );
}
