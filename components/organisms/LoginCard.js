import LoginForm from '../molecules/LoginForm';
import styles from './LoginCard.module.css';

const LoginCard = ({ onLogin, loading, error }) => {
  return (
    <div className={styles.loginCard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Instrument Inventory</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
      </div>
      
      <LoginForm 
        onLogin={onLogin} 
        loading={loading} 
        error={error} 
      />
      
      <div className={styles.footer}>
        <p className={styles.footerText}>
          Don't have an account? <a href="/login" className={styles.link}>Contact admin</a>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;