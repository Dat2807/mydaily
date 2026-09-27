import styles from './Input.module.css';

interface InputProps {
  label?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'date';
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  name?: string;
  id?: string;
  required?: boolean;
}

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  name,
  id,
  required = false,
}: InputProps) {
  const inputClassName = [
    styles.input,
    error ? styles.inputError : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <input
        type={type}
        className={inputClassName}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        id={id}
        required={required}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
