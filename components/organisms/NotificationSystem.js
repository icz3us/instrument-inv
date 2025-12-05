import { useState, useEffect } from 'react';
import { employeeService } from '../../services/employee.service';
import Button from '../atoms/Button';
import styles from './NotificationSystem.module.css';

const NotificationSystem = ({ user, onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getNotifications(user.id);
      setNotifications(data);
      
      // Count unread notifications (for demo, we'll consider all as unread)
      setUnreadCount(data.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    // In a real app, you would update the notification status in the database
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    if (onNotificationClick) {
      onNotificationClick(notificationId);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
        <Button 
          variant="secondary" 
          size="small" 
          onClick={fetchNotifications}
          disabled={loading}
          className={styles.refreshButton}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className={styles.notificationsList}>
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className={styles.notificationContent}>
                <h3 className={styles.notificationTitle}>{notification.action}</h3>
                <p className={styles.notificationDescription}>{notification.description}</p>
                <p className={styles.notificationTime}>
                  {getTimeAgo(notification.created_at)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No notifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;