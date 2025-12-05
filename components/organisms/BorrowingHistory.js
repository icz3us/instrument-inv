import { useState, useEffect } from 'react';
import { employeeService } from '../../services/employee.service';
import styles from './BorrowingHistory.module.css';

const BorrowingHistory = ({ user }) => {
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user && user.id) {
      fetchBorrowingHistory();
    }
  }, [user, filter]);

  const fetchBorrowingHistory = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getBorrowRequests(user.id);
      
      // Apply filter if not 'all'
      const filteredData = filter === 'all' 
        ? data 
        : data.filter(request => request.status === filter);
      
      setBorrowRequests(filteredData);
    } catch (err) {
      console.error('Error fetching borrowing history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return styles.approved;
      case 'pending': return styles.pending;
      case 'denied': return styles.denied;
      case 'returned': return styles.returned;
      case 'overdue': return styles.overdue;
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Borrowing History</h2>
        <div className={styles.filters}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading borrowing history...</div>
      ) : (
        <div className={styles.timeline}>
          {borrowRequests.length > 0 ? (
            borrowRequests.map((request, index) => (
              <div key={request.id} className={styles.timelineItem}>
                <div className={styles.timelineMarker}></div>
                <div className={styles.timelineContent}>
                  <div className={styles.requestHeader}>
                    <h3>{request.instrument_name}</h3>
                    <span className={`${styles.status} ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className={styles.requestDetails}>
                    <p><strong>Request Date:</strong> {formatDate(request.created_at)}</p>
                    <p><strong>Due Date:</strong> {formatDate(request.due_date)}</p>
                    {request.quantity && <p><strong>Quantity:</strong> {request.quantity}</p>}
                    {request.purpose && <p><strong>Purpose:</strong> {request.purpose}</p>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No borrowing history found{filter !== 'all' ? ` for ${filter} requests` : ''}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BorrowingHistory;