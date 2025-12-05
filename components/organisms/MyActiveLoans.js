import { useState, useEffect } from 'react';
import { employeeService } from '../../services/employee.service';
import Button from '../atoms/Button';
import styles from './MyActiveLoans.module.css';

const MyActiveLoans = ({ user, onReturnInstrument }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchActiveLoans();
    }
  }, [user]);

  const fetchActiveLoans = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getActiveLoans(user.id);
      setLoans(data);
    } catch (err) {
      console.error('Error fetching active loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    try {
      await employeeService.returnInstrument(loanId);
      
      // Refresh the loans list
      fetchActiveLoans();
      
      // Notify parent component if needed
      if (onReturnInstrument) {
        onReturnInstrument(loanId);
      }
    } catch (err) {
      console.error('Error returning instrument:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueStatus = (dueDate) => {
    const days = getDaysUntilDue(dueDate);
    
    if (days < 0) {
      return { status: 'overdue', days: Math.abs(days) };
    } else if (days === 0) {
      return { status: 'today', days: 0 };
    } else if (days <= 3) {
      return { status: 'soon', days };
    } else {
      return { status: 'normal', days };
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Active Loans</h2>
        <Button 
          variant="secondary" 
          size="small" 
          onClick={fetchActiveLoans}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading active loans...</div>
      ) : (
        <div className={styles.loansGrid}>
          {loans.length > 0 ? (
            loans.map(loan => {
              const dueStatus = getDueStatus(loan.due_date);
              return (
                <div key={loan.id} className={styles.loanCard}>
                  <div className={styles.loanHeader}>
                    <h3>{loan.instrument_name}</h3>
                    <span className={`${styles.daysIndicator} ${styles[dueStatus.status]}`}>
                      {dueStatus.status === 'overdue' 
                        ? `${dueStatus.days} day${dueStatus.days > 1 ? 's' : ''} overdue` 
                        : dueStatus.status === 'today' 
                          ? 'Due today' 
                          : dueStatus.status === 'soon' 
                            ? `Due in ${dueStatus.days} day${dueStatus.days > 1 ? 's' : ''}` 
                            : `Due in ${dueStatus.days} days`}
                    </span>
                  </div>
                  
                  <div className={styles.loanDetails}>
                    <p><strong>Borrowed:</strong> {formatDate(loan.request_date)}</p>
                    <p><strong>Due Date:</strong> {formatDate(loan.due_date)}</p>
                    {loan.quantity && <p><strong>Quantity:</strong> {loan.quantity}</p>}
                  </div>
                  
                  <div className={styles.loanActions}>
                    <Button
                      variant="secondary"
                      onClick={() => handleReturn(loan.id)}
                    >
                      Return Instrument
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <p>You don't have any active loans.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyActiveLoans;