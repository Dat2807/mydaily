export type TransactionType = "income" | "expense";
export type GoalStatus = "active" | "completed";

export interface AppSettings {
  setupComplete: boolean;
  startingBalance: number;
  startingDate: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  emoji: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  note: string;
  templateId?: string;
  createdAt: string;
}

export interface MonthBudgetItem {
  categoryId: string;
  amount: number;
}

export interface MonthPlan {
  monthKey: string; // "2026-08"
  expectedIncome: number;
  expectedSaving: number;
  budgets: MonthBudgetItem[];
  createdAt: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  priority: number;
  deadline?: string;
  status: GoalStatus;
  completedAt?: string;
  createdAt: string;
}

export interface SavingAllocation {
  id: string;
  transactionId: string;
  goalId: string;
  amount: number;
  date: string;
}

export interface Template {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  emoji: string;
  createdAt: string;
}

export interface AppData {
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
  monthPlans: MonthPlan[];
  savingGoals: SavingGoal[];
  savingAllocations: SavingAllocation[];
  templates: Template[];
}
