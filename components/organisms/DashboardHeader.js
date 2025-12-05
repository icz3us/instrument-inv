import Button from '../atoms/Button';
import styles from './DashboardHeader.module.css';

const DashboardHeader = ({ title, onLogout, user }) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{title}</h1>
        {user && (
          <div className={styles.user}>
            <span className={styles.userEmail}>{user.email}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        )}
      </div>
      <Button 
        variant="danger" 
        size="medium" 
        onClick={onLogout}
      >
        Logout
      </Button>
    </div>
  );
};

export default DashboardHeader;