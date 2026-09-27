import { useEffect, useState } from 'react';
import { transactionAPI } from '../../api/finance';
import type { Transaction } from '../../api/types';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.list();
      const data = Array.isArray(response.data) ? response.data : [];
      setTransactions(data.slice(0, 5)); // Show last 5 transactions
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Calculate stats (placeholder for now, will be calculated from API later)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Current Balance</div>
          <p className={styles.statValue}>{formatCurrency(balance)}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Income</div>
          <p className={`${styles.statValue} ${styles.income}`}>{formatCurrency(totalIncome)}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Expense</div>
          <p className={`${styles.statValue} ${styles.expense}`}>{formatCurrency(totalExpense)}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Net Savings</div>
          <p className={`${styles.statValue} ${styles.saving}`}>{formatCurrency(balance)}</p>
        </div>
      </div>

      <div className={styles.recentTransactions}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        </div>
        
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : transactions.length === 0 ? (
          <p className={styles.empty}>No transactions yet</p>
        ) : (
          <div className={styles.transactionList}>
            {transactions.map((transaction) => (
              <div key={transaction.id} className={styles.transactionItem}>
                <div className={styles.transactionInfo}>
                  <span className={styles.transactionEmoji}>
                    {transaction.category_emoji || '💰'}
                  </span>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionCategory}>
                      {transaction.category_name || 'Unknown'}
                    </div>
                    <div className={styles.transactionDate}>
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>
                <div className={`${styles.transactionAmount} ${styles[transaction.type]}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
