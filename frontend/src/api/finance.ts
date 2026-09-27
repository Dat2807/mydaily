import api from './client';
import type {
  Category,
  Transaction,
  MonthPlan,
  SavingGoal,
  Template,
  AppSettings,
} from './types';

// Categories
export const categoryAPI = {
  list: () => api.get<Category[]>('/categories/'),
  create: (data: Partial<Category>) => api.post<Category>('/categories/', data),
  retrieve: (id: number) => api.get<Category>(`/categories/${id}/`),
  update: (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}/`, data),
  destroy: (id: number) => api.delete(`/categories/${id}/`),
};

// Transactions
export const transactionAPI = {
  list: (params?: { type?: string; category?: number; start_date?: string; end_date?: string }) =>
    api.get<Transaction[]>('/transactions/', { params }),
  create: (data: Partial<Transaction>) => api.post<Transaction>('/transactions/', data),
  retrieve: (id: number) => api.get<Transaction>(`/transactions/${id}/`),
  update: (id: number, data: Partial<Transaction>) => api.put<Transaction>(`/transactions/${id}/`, data),
  destroy: (id: number) => api.delete(`/transactions/${id}/`),
};

// Month Plans
export const monthPlanAPI = {
  list: () => api.get<MonthPlan[]>('/month-plans/'),
  create: (data: Partial<MonthPlan>) => api.post<MonthPlan>('/month-plans/', data),
  retrieve: (id: number) => api.get<MonthPlan>(`/month-plans/${id}/`),
  update: (id: number, data: Partial<MonthPlan>) => api.put<MonthPlan>(`/month-plans/${id}/`, data),
  destroy: (id: number) => api.delete(`/month-plans/${id}/`),
  copyFromPrevious: (month_key: string) => api.post('/month-plans/copy_from_previous/', { month_key }),
};

// Saving Goals
export const savingGoalAPI = {
  list: () => api.get<SavingGoal[]>('/saving-goals/'),
  create: (data: Partial<SavingGoal>) => api.post<SavingGoal>('/saving-goals/', data),
  retrieve: (id: number) => api.get<SavingGoal>(`/saving-goals/${id}/`),
  update: (id: number, data: Partial<SavingGoal>) => api.put<SavingGoal>(`/saving-goals/${id}/`, data),
  destroy: (id: number) => api.delete(`/saving-goals/${id}/`),
  reorder: (goal_ids: number[]) => api.post('/saving-goals/reorder/', { goal_ids }),
};

// Templates
export const templateAPI = {
  list: () => api.get<Template[]>('/templates/'),
  create: (data: Partial<Template>) => api.post<Template>('/templates/', data),
  retrieve: (id: number) => api.get<Template>(`/templates/${id}/`),
  update: (id: number, data: Partial<Template>) => api.put<Template>(`/templates/${id}/`, data),
  destroy: (id: number) => api.delete(`/templates/${id}/`),
};

// App Settings
export const settingsAPI = {
  list: () => api.get<AppSettings[]>('/settings/'),
  create: (data: Partial<AppSettings>) => api.post<AppSettings>('/settings/', data),
  retrieve: (id: number) => api.get<AppSettings>(`/settings/${id}/`),
  update: (id: number, data: Partial<AppSettings>) => api.put<AppSettings>(`/settings/${id}/`, data),
};
