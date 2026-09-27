export interface User {
  id: number;
  username: string;
  created_at: string;
  settings: Record<string, any>;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  emoji: string;
  user: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: number;
  category_name?: string;
  category_emoji?: string;
  note: string;
  template?: number | null;
  template_name?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthPlan {
  id: number;
  month_key: string;
  expected_income: number;
  expected_saving: number;
  budgets: MonthBudget[];
  created_at: string;
  updated_at: string;
}

export interface MonthBudget {
  id: number;
  month_plan: number;
  category: number;
  category_name?: string;
  category_type?: string;
  budget_amount: number;
  spent_amount?: number;
}

export interface SavingGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  priority: number;
  deadline?: string | null;
  status: 'active' | 'completed';
  completed_at?: string | null;
  progress_percentage?: number;
  user: number;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: number;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: number;
  category_name?: string;
  note: string;
  emoji: string;
  user: number;
  created_at: string;
}

export interface AppSettings {
  id: number;
  user: number;
  username?: string;
  setup_complete: boolean;
  starting_balance: number;
  starting_date: string;
  created_at: string;
  updated_at: string;
}
