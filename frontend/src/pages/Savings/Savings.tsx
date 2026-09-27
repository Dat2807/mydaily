import { useEffect, useState } from 'react';
import { savingGoalAPI } from '../../api/finance';
import type { SavingGoal } from '../../api/types';
import styles from './Savings.module.css';
import Button from '../../components/ui/Button/Button.tsx';
import Modal from '../../components/ui/Modal/Modal.tsx';
import Input from '../../components/ui/Input/Input.tsx';

export default function Savings() {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    priority: '1',
    deadline: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await savingGoalAPI.list();
      const data = Array.isArray(response.data) ? response.data : [];
      setGoals(data);
    } catch (error) {
      console.error('Failed to load saving goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savingGoalAPI.create({
        name: formData.name,
        target_amount: Number(formData.target_amount),
        current_amount: Number(formData.current_amount),
        priority: Number(formData.priority),
        deadline: formData.deadline || null,
      });
      setIsModalOpen(false);
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '0',
        priority: '1',
        deadline: '',
      });
      loadGoals();
    } catch (error) {
      console.error('Failed to create saving goal:', error);
      alert('Failed to create saving goal');
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
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className={styles.savings}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Savings Goals</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Add Goal
        </Button>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : goals.length === 0 ? (
        <p className={styles.empty}>No saving goals yet</p>
      ) : (
        <div className={styles.goalsList}>
          {goals.map((goal) => (
            <div key={goal.id} className={styles.goalCard}>
              <div className={styles.goalHeader}>
                <h3 className={styles.goalName}>{goal.name}</h3>
                <span className={`${styles.goalStatus} ${styles[goal.status]}`}>
                  {goal.status}
                </span>
              </div>
              
              <div className={styles.goalProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${goal.status === 'completed' ? styles.completed : ''}`}
                    style={{ width: `${goal.progress_percentage || 0}%` }}
                  />
                </div>
                <div className={styles.progressText}>
                  <span>{formatCurrency(goal.current_amount)}</span>
                  <span>{goal.progress_percentage?.toFixed(1) || 0}%</span>
                </div>
              </div>

              <div className={styles.goalDetails}>
                <div className={styles.goalDetail}>
                  <span className={styles.goalDetailLabel}>Target</span>
                  <span className={styles.goalDetailValue}>{formatCurrency(goal.target_amount)}</span>
                </div>
                <div className={styles.goalDetail}>
                  <span className={styles.goalDetailLabel}>Remaining</span>
                  <span className={styles.goalDetailValue}>
                    {formatCurrency(goal.target_amount - goal.current_amount)}
                  </span>
                </div>
                <div className={styles.goalDetail}>
                  <span className={styles.goalDetailLabel}>Deadline</span>
                  <span className={styles.goalDetailValue}>{formatDate(goal.deadline || '')}</span>
                </div>
                <div className={styles.goalDetail}>
                  <span className={styles.goalDetailLabel}>Priority</span>
                  <span className={styles.goalDetailValue}>{goal.priority}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Saving Goal"
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
            <Input
              label="Goal Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter goal name"
              required
            />

            <Input
              label="Target Amount"
              type="number"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              placeholder="Enter target amount"
              required
            />

            <Input
              label="Current Amount"
              type="number"
              value={formData.current_amount}
              onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              placeholder="Enter current amount (default: 0)"
            />

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                <option value="1">1 (Highest)</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 (Lowest)</option>
              </select>
            </div>

            <Input
              label="Deadline (optional)"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
