import { useEffect, useState } from 'react';
import { transactionAPI, categoryAPI } from '../../api/finance';
import type { Transaction, Category } from '../../api/types';
import styles from './Transactions.module.css';
import Button from '../../components/ui/Button/Button.tsx';
import Modal from '../../components/ui/Modal/Modal.tsx';
import Input from '../../components/ui/Input/Input.tsx';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    note: '',
  });

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.list();
      const data = Array.isArray(response.data) ? response.data : [];
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.list();
      const data = Array.isArray(response.data) ? response.data : [];
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionAPI.create({
        type: formData.type,
        amount: Number(formData.amount),
        date: formData.date,
        category: Number(formData.category),
        note: formData.note,
      });
      setIsModalOpen(false);
      setFormData({
        type: 'expense',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        note: '',
      });
      loadTransactions();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction');
    }
  };

  const handleSave = () => {
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className={styles.transactions}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Transactions</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Add Transaction
        </Button>
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
                  {transaction.note && (
                    <div className={styles.transactionNote}>{transaction.note}</div>
                  )}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Transaction"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <Input
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              required
            />

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                }}
              >
                <option value="">Select category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Input
              label="Note (optional)"
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Add a note"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
