import { useEffect, useState } from 'react';
import { templateAPI, categoryAPI } from '../../api/finance';
import type { Template, Category } from '../../api/types';
import styles from './Templates.module.css';
import Button from '../../components/ui/Button/Button.tsx';
import Modal from '../../components/ui/Modal/Modal.tsx';
import Input from '../../components/ui/Input/Input.tsx';

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    note: '',
    emoji: '💰',
  });

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templateAPI.list();
      const data = Array.isArray(response.data) ? response.data : [];
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
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
      await templateAPI.create({
        name: formData.name,
        type: formData.type,
        amount: Number(formData.amount),
        category: Number(formData.category),
        note: formData.note,
        emoji: formData.emoji,
      });
      setIsModalOpen(false);
      setFormData({
        name: '',
        type: 'expense',
        amount: '',
        category: '',
        note: '',
        emoji: '💰',
      });
      loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template');
    }
  };

  const handleSave = () => {
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className={styles.templates}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Transaction Templates</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Add Template
        </Button>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : templates.length === 0 ? (
        <p className={styles.empty}>No templates yet</p>
      ) : (
        <div className={styles.templatesList}>
          {templates.map((template) => (
            <div key={template.id} className={styles.templateCard}>
              <div className={styles.templateHeader}>
                <div>
                  <h3 className={styles.templateName}>{template.name}</h3>
                  <span className={`${styles.templateType} ${styles[template.type]}`}>
                    {template.type}
                  </span>
                </div>
                <span className={styles.templateEmoji}>{template.emoji}</span>
              </div>
              
              <div className={styles.templateAmount}>
                {formatCurrency(template.amount)}
              </div>

              <div className={styles.templateCategory}>
                {template.category_name || 'Unknown category'}
              </div>

              {template.note && (
                <div className={styles.templateNote}>{template.note}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Template"
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
              label="Template Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter template name"
              required
            />

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
              label="Emoji"
              type="text"
              value={formData.emoji}
              onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
              placeholder="Enter emoji"
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
