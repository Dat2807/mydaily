import type { Transaction, AppSettings, SavingAllocation, SavingGoal } from "../types";

export interface BalanceSummary {
  startingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  currentBalance: number;
  availableBalance: number;
}

export function calculateBalance(
  settings: AppSettings,
  transactions: Transaction[]
): BalanceSummary {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Saving transactions are expense-type with a saving category
  // The user explicitly records saving as a separate expense category
  // totalSaved is tracked separately via savingAllocations
  const totalSaved = 0; // will be from saving allocations sum

  const currentBalance = settings.startingBalance + totalIncome - totalExpenses;

  return {
    startingBalance: settings.startingBalance,
    totalIncome,
    totalExpenses,
    totalSaved,
    currentBalance,
    availableBalance: currentBalance,
  };
}

export interface MonthSummary {
  income: number;
  expenses: number;
  savings: number;
  remaining: number;
}

export function getMonthSummary(
  transactions: Transaction[],
  savingAllocations: SavingAllocation[],
  monthKey: string,
  savingCategoryId: string | undefined
): MonthSummary {
  const monthTransactions = transactions.filter((t) => {
    return t.date.startsWith(monthKey);
  });

  const income = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const savingTransactions = savingCategoryId
    ? monthTransactions.filter((t) => t.type === "expense" && t.categoryId === savingCategoryId)
    : [];

  const savings = savingTransactions.reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0) - savings;

  const remaining = income - expenses - savings;

  return { income, expenses, savings, remaining };
}
