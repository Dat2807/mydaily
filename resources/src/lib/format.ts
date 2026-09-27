export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " ₫";
}

export function formatVNDCompact(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1).replace(".0", "") + " tỷ";
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1).replace(".0", "") + " tr";
  if (amount >= 1_000) return (amount / 1_000).toFixed(0) + "k";
  return amount.toString();
}

export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

export function formatMonthShort(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("vi-VN", { month: "short", year: "numeric" });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getDateMonthKey(dateStr: string): string {
  const date = new Date(dateStr);
  return getMonthKey(date);
}

export function getPreviousMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return getMonthKey(date);
}

export function getNextMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month, 1);
  return getMonthKey(date);
}

export function getDaysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

export function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}
