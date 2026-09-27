import { useEffect, useState } from 'react';
import { monthPlanAPI } from '../../api/finance';
import type { MonthPlan, MonthBudget } from '../../api/types';
import styles from './MonthlyPlan.module.css';
import Button from '../../components/ui/Button/Button.tsx';

export default function MonthlyPlan() {
  const [plans, setPlans] = useState<MonthPlan[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(monthKey);
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await monthPlanAPI.list();
      const data = Array.isArray(response.data) ? response.data : [];
      setPlans(data);
    } catch (error) {
      console.error('Failed to load month plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFromPrevious = async () => {
    if (!selectedMonth) return;
    
    try {
      await monthPlanAPI.copyFromPrevious(selectedMonth);
      alert('Copied from previous month successfully!');
      loadPlans();
    } catch (error) {
      console.error('Failed to copy from previous:', error);
      alert('Failed to copy from previous month');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const currentPlan = plans.find(p => p.month_key === selectedMonth);

  const totalBudget = currentPlan?.budgets?.reduce((sum, b) => sum + b.budget_amount, 0) || 0;
  const totalSpent = currentPlan?.budgets?.reduce((sum, b) => sum + (b.spent_amount || 0), 0) || 0;
  const remaining = totalBudget - totalSpent;

  const getProgressClass = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return styles.danger;
    if (percentage >= 70) return styles.warning;
    return '';
  };

  return (
    <div className={styles.monthlyPlan}>
      <h1>Monthly Plan</h1>
      
      <div className={styles.monthSelector}>
        <label>Month:</label>
        <input
          type="month"
          className={styles.monthInput}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <Button 
          className={styles.copyButton}
          onClick={handleCopyFromPrevious}
          disabled={!selectedMonth}
        >
          Copy from Previous
        </Button>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : !currentPlan ? (
        <p className={styles.empty}>
          No plan for {selectedMonth}. Click "Copy from Previous" to create one.
        </p>
      ) : (
        <>
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Total Budget</div>
              <p className={styles.summaryValue}>{formatCurrency(totalBudget)}</p>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Total Spent</div>
              <p className={`${styles.summaryValue} ${styles.expense}`}>{formatCurrency(totalSpent)}</p>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Remaining</div>
              <p className={`${styles.summaryValue} ${styles.balance}`}>{formatCurrency(remaining)}</p>
            </div>
          </div>

          <div className={styles.budgetsList}>
            {currentPlan.budgets?.map((budget: MonthBudget) => (
              <div key={budget.id} className={styles.budgetCard}>
                <div className={styles.budgetHeader}>
                  <h3 className={styles.budgetCategory}>{budget.category_name}</h3>
                </div>
                
                <div className={styles.budgetProgress}>
                  <div className={styles.progressBar}>
                    <div
                      className={`${styles.progressFill} ${getProgressClass(budget.spent_amount || 0, budget.budget_amount)}`}
                      style={{ width: `${((budget.spent_amount || 0) / budget.budget_amount) * 100}%` }}
                    />
                  </div>
                  <div className={styles.progressText}>
                    <span>{formatCurrency(budget.spent_amount || 0)}</span>
                    <span>{formatCurrency(budget.budget_amount)}</span>
                  </div>
                </div>

                <div className={styles.budgetDetails}>
                  <div>
                    <strong>Spent:</strong> {formatCurrency(budget.spent_amount || 0)}
                  </div>
                  <div>
                    <strong>Budget:</strong> {formatCurrency(budget.budget_amount)}
                  </div>
                  <div>
                    <strong>Remaining:</strong> {formatCurrency(budget.budget_amount - (budget.spent_amount || 0))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
