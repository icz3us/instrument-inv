'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import DashboardHeader from '../../../components/organisms/DashboardHeader';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import BorrowingHistory from '../../../components/organisms/BorrowingHistory';
import MyActiveLoans from '../../../components/organisms/MyActiveLoans';
import NotificationSystem from '../../../components/organisms/NotificationSystem';
import ConditionReporting from '../../../components/organisms/ConditionReporting';
import { employeeService } from '../../../services/employee.service';
import styles from './enhanced-employee.module.css';

// Simple icon components
const DashboardIcon = () => <span>📊</span>;
const LoansIcon = () => <span>💰</span>;
const BorrowIcon = () => <span>📥</span>;
const HistoryIcon = () => <span>📜</span>;
const LogoutIcon = () => <span>🚪</span>;

// Create a Supabase client for client-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Client Component - receives initial data from server
export default function EnhancedEmployeeDashboard({ initialData = {} }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Initialize state with server-fetched data
  const [instruments, setInstruments] = useState(initialData.instruments || []);
  const [users, setUsers] = useState(initialData.users || []);
  
  // Other state variables
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [borrowForm, setBorrowForm] = useState({
    instrument_id: '',
    instrument_name: '',
    quantity: 1,
    due_date: '',
    purpose: ''
  });

  // Check if user is authenticated and has employee role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'employee')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch user's borrow requests and loans (client-side hydration)
  useEffect(() => {
    if (user && user.id) {
      // Only fetch if we don't already have data from server
      if (borrowRequests.length === 0) {
        fetchBorrowRequests();
      }
      if (myLoans.length === 0) {
        fetchMyLoans();
      }
      if (notifications.length === 0) {
        fetchNotifications();
      }
    }
  }, [user]);

  const fetchBorrowRequests = async () => {
    try {
      const data = await employeeService.getBorrowRequests(user.id);
      setBorrowRequests(data || []);
    } catch (err) {
      console.error('Error fetching borrow requests:', err);
    }
  };

  const fetchMyLoans = async () => {
    try {
      const data = await employeeService.getActiveLoans(user.id);
      setMyLoans(data || []);
    } catch (err) {
      console.error('Error fetching my loans:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await employeeService.getNotifications(user.id);
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleLogout = async () => {
    console.log('Logging out from employee dashboard...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setFilterCategory(value);
        break;
      case 'condition':
        setFilterCondition(value);
        break;
      case 'availability':
        setFilterAvailability(value);
        break;
    }
  };

  const filteredInstruments = instruments.filter(instrument => {
    // Search filter
    const matchesSearch = instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          instrument.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (instrument.category && instrument.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || instrument.category === filterCategory;
    
    // Condition filter
    const matchesCondition = filterCondition === 'all' || instrument.condition === filterCondition;
    
    // Availability filter
    const matchesAvailability = filterAvailability === 'all' || 
                               (filterAvailability === 'available' && instrument.status === 'available') ||
                               (filterAvailability === 'checked_out' && instrument.status === 'checked_out') ||
                               (filterAvailability === 'maintenance' && instrument.status === 'maintenance');
    
    return matchesSearch && matchesCategory && matchesCondition && matchesAvailability;
  });

  const uniqueCategories = [...new Set(instruments.map(i => i.category).filter(Boolean))];

  const handleBorrowRequest = (instrument) => {
    setSelectedInstrument(instrument);
    setBorrowForm({
      instrument_id: instrument.id,
      instrument_name: instrument.name,
      quantity: 1,
      due_date: '',
      purpose: ''
    });
    setShowBorrowModal(true);
  };

  const handleBorrowFormChange = (e) => {
    const { name, value } = e.target;
    setBorrowForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitBorrowRequest = async (e) => {
    e.preventDefault();
    
    try {
      const requestData = {
        user_id: user.id,
        user_email: user.email,
        instrument_id: borrowForm.instrument_id,
        instrument_name: borrowForm.instrument_name,
        quantity: parseInt(borrowForm.quantity),
        due_date: borrowForm.due_date,
        purpose: borrowForm.purpose,
        status: 'pending'
      };
      
      await employeeService.submitBorrowRequest(requestData);
      
      setShowBorrowModal(false);
      setBorrowForm({
        instrument_id: '',
        instrument_name: '',
        quantity: 1,
        due_date: '',
        purpose: ''
      });
      fetchBorrowRequests();
      
      // Add notification
      await employeeService.createNotification({
        user_id: user.id,
        user_email: user.email,
        action: 'Borrow Request',
        description: `Requested to borrow ${borrowForm.instrument_name}`
      });
    } catch (err) {
      console.error('Error submitting borrow request:', err);
    }
  };

  const returnInstrument = async (requestId) => {
    try {
      await employeeService.returnInstrument(requestId);
      fetchMyLoans();
      fetchBorrowRequests();
    } catch (err) {
      console.error('Error returning instrument:', err);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="container">
        <div className="loading">Checking authentication...</div>
      </div>
    );
  }

  // Redirect if not employee
  if (!user || user.role !== 'employee') {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Sidebar Navigation */}
      <nav className={styles.sidebar} role="navigation" aria-label="Employee dashboard navigation">
        <div className={styles.logo}>
          <h2>Instrument Inventory</h2>
        </div>
        
        <ul className={styles.nav}>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => setActiveTab('dashboard')}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            >
              <DashboardIcon />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'loans' ? styles.active : ''}`}
              onClick={() => setActiveTab('loans')}
              aria-current={activeTab === 'loans' ? 'page' : undefined}
            >
              <LoansIcon />
              <span>My Active Loans</span>
            </button>
          </li>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'borrow' ? styles.active : ''}`}
              onClick={() => setActiveTab('borrow')}
              aria-current={activeTab === 'borrow' ? 'page' : undefined}
            >
              <BorrowIcon />
              <span>Borrow Instruments</span>
            </button>
          </li>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'history' ? styles.active : ''}`}
              onClick={() => setActiveTab('history')}
              aria-current={activeTab === 'history' ? 'page' : undefined}
            >
              <HistoryIcon />
              <span>Borrowing History</span>
            </button>
          </li>
        </ul>
        
        <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Logout">
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent} role="main">
        <header className={styles.header}>
          <h1>Employee Dashboard</h1>
          <div className={styles.headerActions}>
            {/* Notification Bell Icon */}
            <div className={styles.notificationBell} onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications">
              <span>🔔</span>
              {notifications.length > 0 && (
                <span className={styles.notificationBadge}>{notifications.length}</span>
              )}
            </div>
            
            <div className={styles.userProfile}>
              <span>{user.email}</span>
              <span className={styles.userRole}>{user.role}</span>
            </div>
          </div>
        </header>

        {/* Notifications Popup */}
        {showNotifications && (
          <div className={styles.notificationsPopup} role="dialog" aria-modal="true" aria-labelledby="notifications-title">
            <div className={styles.popupHeader}>
              <h3 id="notifications-title">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} aria-label="Close notifications">×</button>
            </div>
            <div className={styles.popupContent}>
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map(notification => (
                  <div key={notification.id} className={styles.notificationItem}>
                    <h4>{notification.action}</h4>
                    <p>{notification.description}</p>
                    <span className={styles.notificationTime}>
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p>No notifications</p>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <section className={styles.dashboardContent} aria-labelledby="dashboard-heading">
            <h2 id="dashboard-heading" className="sr-only">Dashboard Overview</h2>
            <div className={styles.widgets}>
              <div className={styles.widget}>
                <h3>My Active Loans</h3>
                <p className={styles.widgetValue}>{myLoans.length}</p>
                <p className={styles.widgetLabel}>Instruments currently borrowed</p>
              </div>
              
              <div className={styles.widget}>
                <h3>Due Soon</h3>
                <p className={styles.widgetValue}>
                  {myLoans.filter(loan => {
                    const dueDate = new Date(loan.due_date);
                    const today = new Date();
                    const diffTime = dueDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 3 && diffDays >= 0;
                  }).length}
                </p>
                <p className={styles.widgetLabel}>Items due in 3 days</p>
              </div>
              
              <div className={styles.widget}>
                <h3>Pending Requests</h3>
                <p className={styles.widgetValue}>
                  {borrowRequests.filter(req => req.status === 'pending').length}
                </p>
                <p className={styles.widgetLabel}>Awaiting approval</p>
              </div>
              
              <div className={styles.widget}>
                <h3>Borrowing Trends</h3>
                <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 0' }} role="img" aria-label="Borrowing trends chart">
                  <div style={{ width: '20px', height: '40px', background: '#4ADE80', borderRadius: '4px' }}></div>
                  <div style={{ width: '20px', height: '60px', background: '#22c55e', borderRadius: '4px' }}></div>
                  <div style={{ width: '20px', height: '30px', background: '#4ADE80', borderRadius: '4px' }}></div>
                  <div style={{ width: '20px', height: '70px', background: '#22c55e', borderRadius: '4px' }}></div>
                  <div style={{ width: '20px', height: '50px', background: '#4ADE80', borderRadius: '4px' }}></div>
                  <div style={{ width: '20px', height: '80px', background: '#22c55e', borderRadius: '4px' }}></div>
                  <div style={{ width: '20px', height: '60px', background: '#4ADE80', borderRadius: '4px' }}></div>
                </div>
                <p className={styles.widgetLabel}>Last 7 days</p>
              </div>
            </div>
          </section>
        )}

        {/* Borrow Instruments Tab */}
        {activeTab === 'borrow' && (
          <section className={styles.borrowContent} aria-labelledby="borrow-heading">
            <h2 id="borrow-heading" className="sr-only">Borrow Instruments</h2>
            <div className={styles.searchPanel}>
              <div className={styles.searchBar}>
                <label htmlFor="search-instruments" className="sr-only">Search instruments</label>
                <Input
                  type="text"
                  id="search-instruments"
                  placeholder="Search by code, name, or category..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              
              <div className={styles.filters}>
                <label htmlFor="filter-category" className="sr-only">Filter by category</label>
                <Select
                  id="filter-category"
                  value={filterCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
                
                <label htmlFor="filter-condition" className="sr-only">Filter by condition</label>
                <Select
                  id="filter-condition"
                  value={filterCondition}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                >
                  <option value="all">All Conditions</option>
                  <option value="good">Good</option>
                  <option value="needs_repair">Needs Repair</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="missing">Missing</option>
                </Select>
                
                <label htmlFor="filter-availability" className="sr-only">Filter by availability</label>
                <Select
                  id="filter-availability"
                  value={filterAvailability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="maintenance">Maintenance</option>
                </Select>
              </div>
            </div>
            
            <div className={styles.instrumentsGrid}>
              {filteredInstruments.length > 0 ? (
                filteredInstruments.map(instrument => (
                  <div key={instrument.id} className={styles.instrumentCard}>
                    <div className={styles.instrumentHeader}>
                      <h3>{instrument.name}</h3>
                      <span className={`${styles.status} ${styles[instrument.status]}`}>
                        {instrument.status}
                      </span>
                    </div>
                    <p className={styles.instrumentId}>ID: {instrument.id.slice(0, 8)}</p>
                    <p className={styles.instrumentCategory}>{instrument.category}</p>
                    <p className={styles.instrumentQuantity}>Quantity: {instrument.quantity}</p>
                    
                    <div className={styles.instrumentActions}>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleBorrowRequest(instrument)}
                        disabled={instrument.status !== 'available'}
                        aria-label={`Request to borrow ${instrument.name}`}
                      >
                        Request to Borrow
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noInstruments}>
                  <p>No instruments found matching your criteria.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Borrowing History Tab */}
        {activeTab === 'history' && (
          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="sr-only">Borrowing History</h2>
            <BorrowingHistory user={user} />
          </section>
        )}

        {/* My Active Loans Tab */}
        {activeTab === 'loans' && (
          <section aria-labelledby="loans-heading">
            <h2 id="loans-heading" className="sr-only">My Active Loans</h2>
            <MyActiveLoans user={user} onReturnInstrument={fetchMyLoans} />
          </section>
        )}

        {/* Borrow Request Modal */}
        {showBorrowModal && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="borrow-modal-title">
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 id="borrow-modal-title">Request to Borrow Instrument</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowBorrowModal(false)}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalBody}>
                <form onSubmit={submitBorrowRequest}>
                  <div className={styles.formGroup}>
                    <label>Instrument</label>
                    <Input
                      type="text"
                      value={borrowForm.instrument_name}
                      readOnly
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="quantity">Quantity</label>
                    <Input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={borrowForm.quantity}
                      onChange={handleBorrowFormChange}
                      min="1"
                      max={selectedInstrument?.quantity || 1}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="due_date">Due Date</label>
                    <Input
                      type="date"
                      id="due_date"
                      name="due_date"
                      value={borrowForm.due_date}
                      onChange={handleBorrowFormChange}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="purpose">Purpose</label>
                    <textarea
                      id="purpose"
                      name="purpose"
                      value={borrowForm.purpose}
                      onChange={handleBorrowFormChange}
                      className={styles.textarea}
                      placeholder="Describe the purpose of borrowing this instrument..."
                    />
                  </div>
                  
                  <div className={styles.modalActions}>
                    <Button
                      variant="secondary"
                      onClick={() => setShowBorrowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                    >
                      Submit Request
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}