import { useEffect, useState } from 'react';
import { settingsAPI } from '../../api/finance';
import type { AppSettings } from '../../api/types';
import styles from './Settings.module.css';
import Button from '../../components/ui/Button/Button.tsx';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.list();
      if (response.data.length > 0) {
        setSettings(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      if (settings.id) {
        await settingsAPI.update(settings.id, settings);
      } else {
        await settingsAPI.create(settings);
      }
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  if (loading) {
    return <p className={styles.loading}>Loading...</p>;
  }

  return (
    <div className={styles.settings}>
      <h1>Settings</h1>

      <div className={styles.settingsCard}>
        <div className={styles.settingsHeader}>
          <h2 className={styles.settingsTitle}>App Settings</h2>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.sectionLabel}>Setup Status</div>
          <div className={styles.infoBox}>
            <span className={`${styles.statusBadge} ${settings?.setup_complete ? styles.complete : styles.incomplete}`}>
              {settings?.setup_complete ? 'Setup Complete' : 'Setup Incomplete'}
            </span>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.sectionLabel}>Initial Balance</div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Starting Balance</label>
            <input
              type="number"
              className={styles.formInput}
              value={settings?.starting_balance || ''}
              onChange={(e) => setSettings({ ...settings!, starting_balance: Number(e.target.value) })}
              disabled={settings?.setup_complete}
              placeholder="Enter your starting balance"
            />
            <p className={styles.formHint}>
              {settings?.setup_complete 
                ? 'Cannot modify after setup is complete' 
                : 'Enter your initial balance when you start tracking'}
            </p>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.sectionLabel}>Starting Date</div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Starting Date</label>
            <input
              type="date"
              className={styles.formInput}
              value={settings?.starting_date || ''}
              onChange={(e) => setSettings({ ...settings!, starting_date: e.target.value })}
              disabled={settings?.setup_complete}
            />
            <p className={styles.formHint}>
              {settings?.setup_complete 
                ? 'Cannot modify after setup is complete' 
                : 'The date when you start tracking your finances'}
            </p>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={saving || settings?.setup_complete}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className={styles.settingsCard}>
        <div className={styles.settingsHeader}>
          <h2 className={styles.settingsTitle}>About</h2>
        </div>
        <div className={styles.infoBox}>
          <p><strong>MyDaily</strong> - Personal Finance Tracker</p>
          <p>Version 1.0.0</p>
          <p>Built with React, Vite, Django, and PostgreSQL</p>
        </div>
      </div>
    </div>
  );
}
