import { createContext, useContext, useState, useCallback } from "react";
import React from "react";
import type {
  AppData,
  AppSettings,
  Category,
  Transaction,
  MonthPlan,
  SavingGoal,
  SavingAllocation,
  Template,
  TransactionType,
} from "./types";
import { getCurrentMonthKey, getPreviousMonthKey } from "./lib/format";
import { allocateSaving, deallocateSaving } from "./services/saving";

const STORAGE_KEY = "finance_app_data";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: "cat-salary", name: "Lương", type: "income", emoji: "💰", createdAt: new Date().toISOString() },
  { id: "cat-freelance", name: "Freelance", type: "income", emoji: "💻", createdAt: new Date().toISOString() },
  { id: "cat-bonus", name: "Thưởng", type: "income", emoji: "🎁", createdAt: new Date().toISOString() },
  { id: "cat-gift", name: "Quà tặng", type: "income", emoji: "🎀", createdAt: new Date().toISOString() },
  { id: "cat-other-income", name: "Khác", type: "income", emoji: "📥", createdAt: new Date().toISOString() },
];

const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Ăn uống", type: "expense", emoji: "🍜", createdAt: new Date().toISOString() },
  { id: "cat-transport", name: "Di chuyển", type: "expense", emoji: "🛵", createdAt: new Date().toISOString() },
  { id: "cat-entertainment", name: "Giải trí", type: "expense", emoji: "🎮", createdAt: new Date().toISOString() },
  { id: "cat-shopping", name: "Mua sắm", type: "expense", emoji: "🛍️", createdAt: new Date().toISOString() },
  { id: "cat-bills", name: "Hóa đơn", type: "expense", emoji: "📄", createdAt: new Date().toISOString() },
  { id: "cat-health", name: "Sức khỏe", type: "expense", emoji: "🏥", createdAt: new Date().toISOString() },
  { id: "cat-education", name: "Học tập", type: "expense", emoji: "📚", createdAt: new Date().toISOString() },
  { id: "cat-saving", name: "Tiết kiệm", type: "expense", emoji: "🏦", createdAt: new Date().toISOString() },
  { id: "cat-other-expense", name: "Khác", type: "expense", emoji: "📤", createdAt: new Date().toISOString() },
];

const SAVING_CATEGORY_ID = "cat-saving";

function getDefaultData(): AppData {
  return {
    settings: {
      setupComplete: false,
      startingBalance: 0,
      startingDate: new Date().toISOString(),
    },
    categories: [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES],
    transactions: [],
    monthPlans: [],
    savingGoals: [],
    savingAllocations: [],
    templates: [],
  };
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw) as AppData;
  } catch {
    return getDefaultData();
  }
}

function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface AppContextValue {
  data: AppData;
  savingCategoryId: string;

  completeSetup: (startingBalance: number) => void;

  // Categories
  addCategory: (type: TransactionType, name: string, emoji: string) => void;
  updateCategory: (id: string, name: string, emoji: string) => void;
  deleteCategory: (id: string) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id" | "createdAt">>) => void;
  deleteTransaction: (id: string) => void;

  // Month plans
  getMonthPlan: (monthKey: string) => MonthPlan | undefined;
  saveMonthPlan: (plan: Omit<MonthPlan, "createdAt">) => void;
  createMonthFromPrevious: (monthKey: string) => void;

  // Saving goals
  addSavingGoal: (goal: Omit<SavingGoal, "id" | "currentAmount" | "createdAt" | "status">) => void;
  updateSavingGoal: (id: string, updates: Partial<SavingGoal>) => void;
  deleteSavingGoal: (id: string) => void;
  reorderGoals: (orderedIds: string[]) => void;

  // Templates
  addTemplate: (t: Omit<Template, "id" | "createdAt">) => void;
  updateTemplate: (id: string, updates: Partial<Omit<Template, "id" | "createdAt">>) => void;
  deleteTemplate: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const completeSetup = useCallback(
    (startingBalance: number) => {
      update((d) => ({
        ...d,
        settings: {
          ...d.settings,
          setupComplete: true,
          startingBalance,
          startingDate: new Date().toISOString(),
        },
      }));
    },
    [update]
  );

  const addCategory = useCallback(
    (type: TransactionType, name: string, emoji: string) => {
      update((d) => ({
        ...d,
        categories: [
          ...d.categories,
          { id: generateId(), name, type, emoji, createdAt: new Date().toISOString() },
        ],
      }));
    },
    [update]
  );

  const updateCategory = useCallback(
    (id: string, name: string, emoji: string) => {
      update((d) => ({
        ...d,
        categories: d.categories.map((c) => (c.id === id ? { ...c, name, emoji } : c)),
      }));
    },
    [update]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        categories: d.categories.filter((c) => c.id !== id),
      }));
    },
    [update]
  );

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id" | "createdAt">) => {
      const id = generateId();
      const newTx: Transaction = { ...tx, id, createdAt: new Date().toISOString() };

      update((d) => {
        let goals = d.savingGoals;
        let allocs = d.savingAllocations;

        if (tx.type === "expense" && tx.categoryId === SAVING_CATEGORY_ID) {
          const result = allocateSaving(tx.amount, goals, tx.date);
          goals = result.updatedGoals;
          const newAllocs = result.allocations.map((a) => ({
            ...a,
            id: generateId(),
            transactionId: id,
          }));
          allocs = [...allocs, ...newAllocs];
        }

        return {
          ...d,
          transactions: [newTx, ...d.transactions],
          savingGoals: goals,
          savingAllocations: allocs,
        };
      });
    },
    [update]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Omit<Transaction, "id" | "createdAt">>) => {
      update((d) => {
        const existing = d.transactions.find((t) => t.id === id);
        if (!existing) return d;

        // If saving category changed, deallocate old and re-allocate
        const oldIsSaving = existing.type === "expense" && existing.categoryId === SAVING_CATEGORY_ID;
        const newType = updates.type ?? existing.type;
        const newCategoryId = updates.categoryId ?? existing.categoryId;
        const newIsSaving = newType === "expense" && newCategoryId === SAVING_CATEGORY_ID;

        let goals = d.savingGoals;
        let allocs = d.savingAllocations;

        if (oldIsSaving) {
          const result = deallocateSaving(id, allocs, goals);
          goals = result.updatedGoals;
          allocs = result.remainingAllocations;
        }

        const updatedTx = { ...existing, ...updates };

        if (newIsSaving) {
          const result = allocateSaving(updatedTx.amount, goals, updatedTx.date);
          goals = result.updatedGoals;
          const newAllocs = result.allocations.map((a) => ({
            ...a,
            id: generateId(),
            transactionId: id,
          }));
          allocs = [...allocs, ...newAllocs];
        }

        return {
          ...d,
          transactions: d.transactions.map((t) => (t.id === id ? updatedTx : t)),
          savingGoals: goals,
          savingAllocations: allocs,
        };
      });
    },
    [update]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      update((d) => {
        const tx = d.transactions.find((t) => t.id === id);
        if (!tx) return d;

        let goals = d.savingGoals;
        let allocs = d.savingAllocations;

        if (tx.type === "expense" && tx.categoryId === SAVING_CATEGORY_ID) {
          const result = deallocateSaving(id, allocs, goals);
          goals = result.updatedGoals;
          allocs = result.remainingAllocations;
        }

        return {
          ...d,
          transactions: d.transactions.filter((t) => t.id !== id),
          savingGoals: goals,
          savingAllocations: allocs,
        };
      });
    },
    [update]
  );

  const getMonthPlan = useCallback(
    (monthKey: string) => data.monthPlans.find((p) => p.monthKey === monthKey),
    [data.monthPlans]
  );

  const saveMonthPlan = useCallback(
    (plan: Omit<MonthPlan, "createdAt">) => {
      update((d) => {
        const existing = d.monthPlans.find((p) => p.monthKey === plan.monthKey);
        if (existing) {
          return {
            ...d,
            monthPlans: d.monthPlans.map((p) =>
              p.monthKey === plan.monthKey ? { ...plan, createdAt: p.createdAt } : p
            ),
          };
        }
        return {
          ...d,
          monthPlans: [
            ...d.monthPlans,
            { ...plan, createdAt: new Date().toISOString() },
          ],
        };
      });
    },
    [update]
  );

  const createMonthFromPrevious = useCallback(
    (monthKey: string) => {
      const prevKey = getPreviousMonthKey(monthKey);
      update((d) => {
        const prev = d.monthPlans.find((p) => p.monthKey === prevKey);
        if (!prev) return d;
        const exists = d.monthPlans.find((p) => p.monthKey === monthKey);
        if (exists) return d;
        return {
          ...d,
          monthPlans: [
            ...d.monthPlans,
            {
              ...prev,
              monthKey,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [update]
  );

  const addSavingGoal = useCallback(
    (goal: Omit<SavingGoal, "id" | "currentAmount" | "createdAt" | "status">) => {
      update((d) => {
        const maxPriority = d.savingGoals.reduce((m, g) => Math.max(m, g.priority), 0);
        return {
          ...d,
          savingGoals: [
            ...d.savingGoals,
            {
              ...goal,
              id: generateId(),
              currentAmount: 0,
              status: "active",
              priority: maxPriority + 1,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [update]
  );

  const updateSavingGoal = useCallback(
    (id: string, updates: Partial<SavingGoal>) => {
      update((d) => ({
        ...d,
        savingGoals: d.savingGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      }));
    },
    [update]
  );

  const deleteSavingGoal = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        savingGoals: d.savingGoals.filter((g) => g.id !== id),
        savingAllocations: d.savingAllocations.filter((a) => a.goalId !== id),
      }));
    },
    [update]
  );

  const reorderGoals = useCallback(
    (orderedIds: string[]) => {
      update((d) => ({
        ...d,
        savingGoals: d.savingGoals.map((g) => ({
          ...g,
          priority: orderedIds.indexOf(g.id) + 1,
        })),
      }));
    },
    [update]
  );

  const addTemplate = useCallback(
    (t: Omit<Template, "id" | "createdAt">) => {
      update((d) => ({
        ...d,
        templates: [
          ...d.templates,
          { ...t, id: generateId(), createdAt: new Date().toISOString() },
        ],
      }));
    },
    [update]
  );

  const updateTemplate = useCallback(
    (id: string, updates: Partial<Omit<Template, "id" | "createdAt">>) => {
      update((d) => ({
        ...d,
        templates: d.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    },
    [update]
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        templates: d.templates.filter((t) => t.id !== id),
      }));
    },
    [update]
  );

  const value: AppContextValue = {
    data,
    savingCategoryId: SAVING_CATEGORY_ID,
    completeSetup,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthPlan,
    saveMonthPlan,
    createMonthFromPrevious,
    addSavingGoal,
    updateSavingGoal,
    deleteSavingGoal,
    reorderGoals,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };

  return React.createElement(AppContext.Provider, { value }, children);
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { SAVING_CATEGORY_ID };
