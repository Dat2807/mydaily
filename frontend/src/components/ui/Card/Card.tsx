import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
}

export default function Card({ children, header, footer, title }: CardProps) {
  return (
    <div className={styles.card}>
      {(header || title) && (
        <div className={styles.cardHeader}>
          {title ? <h3 className={styles.cardTitle}>{title}</h3> : header}
        </div>
      )}
      <div className={styles.cardContent}>{children}</div>
      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </div>
  );
}
