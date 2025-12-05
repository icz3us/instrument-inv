'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import { qrService } from '../../../services/qr.service';
import { reportsService } from '../../../services/reports.service';
import styles from './enhanced-admin.module.css';

// Simple icon components
const DashboardIcon = () => <span>📊</span>;
const InventoryIcon = () => <span>📦</span>;
const RequestsIcon = () => <span>📋</span>;
const MaintenanceIcon = () => <span>🔧</span>;
const ReportsIcon = () => <span>📈</span>;
const QRIcon = () => <span>📱</span>;
const UsersIcon = () => <span>👥</span>;
const SettingsIcon = () => <span>⚙️</span>;
const LogoutIcon = () => <span>🚪</span>;

// Create a Supabase client for client-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Client Component - receives initial data from server
export default function EnhancedAdminDashboard({ initialData = {} }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Initialize state with server-fetched data
  const [instruments, setInstruments] = useState(initialData.instruments || []);
  const [borrowRequests, setBorrowRequests] = useState(initialData.borrowRequests || []);
  const [maintenanceItems, setMaintenanceItems] = useState(initialData.maintenanceItems || []);
  const [users, setUsers] = useState(initialData.users || []);
  
  // Other state variables
  const [showModal, setShowModal] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [bulkApprovalMode, setBulkApprovalMode] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    instrument_id: '',
    instrument_name: '',
    scheduled_date: '',
    technician: '',
    notes: ''
  });
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [calibrationForm, setCalibrationForm] = useState({
    instrument_id: '',
    instrument_name: '',
    calibration_date: '',
    next_calibration_date: '',
    technician: '',
    certificate_number: '',
    notes: ''
  });

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch additional data for admin features (client-side hydration)
  useEffect(() => {
    if (user && user.role === 'admin') {
      // Only fetch if we don't already have data from server
      if (borrowRequests.length === 0) {
        fetchBorrowRequests();
      }
      if (maintenanceItems.length === 0) {
        fetchMaintenanceItems();
      }
      if (users.length === 0) {
        fetchUsers();
      }
    }
  }, [user]);

  const fetchBorrowRequests = async () => {
    try {
      const response = await fetch('/api/borrow-requests');
      if (response.ok) {
        const data = await response.json();
        setBorrowRequests(data || []);
      }
    } catch (err) {
      console.error('Error fetching borrow requests:', err);
    }
  };

  const fetchMaintenanceItems = async () => {
    try {
      const response = await fetch('/api/maintenance-logs');
      if (response.ok) {
        const data = await response.json();
        setMaintenanceItems(data || []);
      }
    } catch (err) {
      console.error('Error fetching maintenance items:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleLogout = async () => {
    console.log('Logging out from admin dashboard...');
    
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleAddInstrument = () => {
    setEditingInstrument(null);
    setShowModal(true);
  };

  const handleEditInstrument = (instrument) => {
    setEditingInstrument(instrument);
    setShowModal(true);
  };

  const handleGenerateQRCode = async (instrument) => {
    try {
      const qrCodeUrl = qrService.generateQRCode(instrument.id, instrument.name);
      setQrCodeUrl(qrCodeUrl);
      setSelectedInstrument(instrument);
      // In a real implementation, we would save this to the database
      console.log(`QR Code generated for ${instrument.name}: ${qrCodeUrl}`);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleGenerateAllQRCodes = async () => {
    try {
      if (instruments && instruments.length > 0) {
        // Generate QR codes for all instruments
        const qrCodes = instruments.map(instrument => ({
          instrumentId: instrument.id,
          instrumentName: instrument.name,
          qrCodeUrl: qrService.generateQRCode(instrument.id, instrument.name)
        }));
        
        console.log('Generated QR codes for all instruments:', qrCodes);
        alert(`Generated QR codes for ${instruments.length} instruments. In a real implementation, these would be displayed in a gallery.`);
      }
    } catch (err) {
      console.error('Error generating all QR codes:', err);
    }
  };

  const handleDeleteInstrument = async (id) => {
    if (!confirm('Are you sure you want to delete this instrument?')) return;
    try {
      const response = await fetch(`/api/instruments?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        setInstruments(prev => prev.filter(inst => inst.id !== id));
      } else {
        console.error('Error deleting instrument');
      }
    } catch (err) {
      console.error('Error deleting instrument:', err);
    }
  };

  const handleStatusChange = async (instrument, newStatus) => {
    try {
      const response = await fetch('/api/instruments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: instrument.id,
          ...instrument,
          status: newStatus
        }),
      });
      
      if (response.ok) {
        const updatedInstrument = await response.json();
        // Update local state
        setInstruments(prev => 
          prev.map(inst => inst.id === instrument.id ? updatedInstrument : inst)
        );
      } else {
        console.error('Error updating instrument status');
      }
    } catch (err) {
      console.error('Error updating instrument status:', err);
    }
  };

  const handleSubmitModal = async (formData) => {
    setModalLoading(true);
    try {
      let response;
      if (editingInstrument) {
        response = await fetch('/api/instruments', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingInstrument.id,
            ...formData
          }),
        });
      } else {
        response = await fetch('/api/instruments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      if (response.ok) {
        const savedInstrument = await response.json();
        if (editingInstrument) {
          // Update existing instrument
          setInstruments(prev => 
            prev.map(inst => inst.id === editingInstrument.id ? savedInstrument : inst)
          );
        } else {
          // Add new instrument
          setInstruments(prev => [...prev, savedInstrument]);
        }
        setShowModal(false);
        setEditingInstrument(null);
      } else {
        console.error('Error saving instrument');
      }
    } catch (err) {
      console.error('Error saving instrument:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setEditingInstrument(null);
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await fetch('/api/borrow-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: requestId, status: 'approved' }),
      });
      
      if (response.ok) {
        // Update local state
        setBorrowRequests(prev => 
          prev.map(req => req.id === requestId ? {...req, status: 'approved'} : req)
        );
      }
    } catch (err) {
      console.error('Error approving request:', err);
    }
  };

  const handleDenyRequest = async (requestId) => {
    try {
      const response = await fetch('/api/borrow-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: requestId, status: 'denied' }),
      });
      
      if (response.ok) {
        // Update local state
        setBorrowRequests(prev => 
          prev.map(req => req.id === requestId ? {...req, status: 'denied'} : req)
        );
      }
    } catch (err) {
      console.error('Error denying request:', err);
    }
  };

  const handleBulkApprove = async () => {
    try {
      // Approve all selected requests
      const promises = selectedRequests.map(requestId => 
        fetch('/api/borrow-requests', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: requestId, status: 'approved' }),
        })
      );
      
      await Promise.all(promises);
      setSelectedRequests([]);
      setBulkApprovalMode(false);
      
      // Refresh the borrow requests list
      fetchBorrowRequests();
    } catch (err) {
      console.error('Error bulk approving requests:', err);
    }
  };

  const toggleRequestSelection = (requestId) => {
    if (selectedRequests.includes(requestId)) {
      setSelectedRequests(selectedRequests.filter(id => id !== requestId));
    } else {
      setSelectedRequests([...selectedRequests, requestId]);
    }
  };

  const handleScheduleMaintenance = (instrument) => {
    setMaintenanceForm({
      instrument_id: instrument?.id || '',
      instrument_name: instrument?.name || '',
      scheduled_date: '',
      technician: '',
      notes: ''
    });
    setShowMaintenanceModal(true);
  };

  const handleMaintenanceFormChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveMaintenance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/maintenance-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceForm),
      });
      
      if (response.ok) {
        setShowMaintenanceModal(false);
        setMaintenanceForm({
          instrument_id: '',
          instrument_name: '',
          scheduled_date: '',
          technician: '',
          notes: ''
        });
        fetchMaintenanceItems();
      }
    } catch (err) {
      console.error('Error saving maintenance log:', err);
    }
  };

  const handleAssignTechnician = async (maintenanceId, technician) => {
    try {
      const response = await fetch(`/api/maintenance-logs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: maintenanceId, technician }),
      });
      
      if (response.ok) {
        fetchMaintenanceItems();
      }
    } catch (err) {
      console.error('Error assigning technician:', err);
    }
  };

  const handleUpdateCondition = async (instrumentId, condition) => {
    try {
      const response = await fetch('/api/instruments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: instrumentId, 
          condition 
        }),
      });
      
      if (response.ok) {
        const updatedInstrument = await response.json();
        // Update local state
        setInstruments(prev => 
          prev.map(inst => inst.id === instrumentId ? updatedInstrument : inst)
        );
      }
    } catch (err) {
      console.error('Error updating instrument condition:', err);
    }
  };

  const handleScheduleCalibration = (instrument) => {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    
    setCalibrationForm({
      instrument_id: instrument?.id || '',
      instrument_name: instrument?.name || '',
      calibration_date: today.toISOString().split('T')[0],
      next_calibration_date: nextYear.toISOString().split('T')[0],
      technician: '',
      certificate_number: '',
      notes: ''
    });
    setShowCalibrationModal(true);
  };

  const handleCalibrationFormChange = (e) => {
    const { name, value } = e.target;
    setCalibrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveCalibration = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/calibration-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calibrationForm),
      });
      
      if (response.ok) {
        setShowCalibrationModal(false);
        setCalibrationForm({
          instrument_id: '',
          instrument_name: '',
          calibration_date: '',
          next_calibration_date: '',
          technician: '',
          certificate_number: '',
          notes: ''
        });
      }
    } catch (err) {
      console.error('Error saving calibration log:', err);
    }
  };

  const handleUpdateCalibrationDate = async (instrumentId, date) => {
    try {
      const response = await fetch('/api/instruments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: instrumentId, 
          calibration_due: date 
        }),
      });
      
      if (response.ok) {
        const updatedInstrument = await response.json();
        // Update local state
        setInstruments(prev => 
          prev.map(inst => inst.id === instrumentId ? updatedInstrument : inst)
        );
      }
    } catch (err) {
      console.error('Error updating calibration date:', err);
    }
  };

  // Calculate dashboard metrics
  const totalInstruments = instruments ? instruments.length : 0;
  const borrowedToday = instruments ? instruments.filter(i => i.status === 'checked_out').length : 0;
  const underMaintenance = instruments ? instruments.filter(i => i.status === 'maintenance').length : 0;
  const lowStockItems = instruments ? instruments.filter(i => i.quantity <= 5).length : 0;

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Checking authentication...</div>
      </div>
    );
  }

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Sidebar Navigation */}
      <nav className={styles.sidebar} role="navigation" aria-label="Admin dashboard navigation">
        <div className={styles.logo}>
          <h2>Admin Panel</h2>
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
              className={`${styles.navItem} ${activeTab === 'inventory' ? styles.active : ''}`}
              onClick={() => setActiveTab('inventory')}
              aria-current={activeTab === 'inventory' ? 'page' : undefined}
            >
              <InventoryIcon />
              <span>Inventory</span>
            </button>
          </li>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'requests' ? styles.active : ''}`}
              onClick={() => setActiveTab('requests')}
              aria-current={activeTab === 'requests' ? 'page' : undefined}
            >
              <RequestsIcon />
              <span>Borrowing Requests</span>
            </button>
          </li>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'maintenance' ? styles.active : ''}`}
              onClick={() => setActiveTab('maintenance')}
              aria-current={activeTab === 'maintenance' ? 'page' : undefined}
            >
              <MaintenanceIcon />
              <span>Maintenance</span>
            </button>
          </li>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'reports' ? styles.active : ''}`}
              onClick={() => setActiveTab('reports')}
              aria-current={activeTab === 'reports' ? 'page' : undefined}
            >
              <ReportsIcon />
              <span>Reports</span>
            </button>
          </li>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'qr' ? styles.active : ''}`}
              onClick={() => setActiveTab('qr')}
              aria-current={activeTab === 'qr' ? 'page' : undefined}
            >
              <QRIcon />
              <span>QR Code Center</span>
            </button>
          </li>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
              onClick={() => setActiveTab('users')}
              aria-current={activeTab === 'users' ? 'page' : undefined}
            >
              <UsersIcon />
              <span>Users & Roles</span>
            </button>
          </li>
          <li>
            <button 
              className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
              aria-current={activeTab === 'settings' ? 'page' : undefined}
            >
              <SettingsIcon />
              <span>Settings</span>
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
          <h1>Admin Dashboard</h1>
          <div className={styles.userProfile}>
            <span>{user.email}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <section className={styles.dashboardContent} aria-labelledby="dashboard-heading">
            <h2 id="dashboard-heading" className="sr-only">Dashboard Overview</h2>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Instruments</h3>
                <p className={styles.statValue}>{totalInstruments}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Borrowed Today</h3>
                <p className={styles.statValue}>{borrowedToday}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Under Maintenance</h3>
                <p className={styles.statValue}>{underMaintenance}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Low Stock Alerts</h3>
                <p className={styles.statValue}>{lowStockItems}</p>
              </div>
            </div>

            {/* Charts and Tables */}
            <div className={styles.contentGrid}>
              <div className={styles.chartSection}>
                <h2>Inventory Overview</h2>
                <div className={styles.chartPlaceholder} role="img" aria-label="Instrument status distribution chart">
                  {/* Chart will be implemented here */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', padding: '20px 0' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(#4ADE80 70%, #22c55e 70% 85%, #FBBF24 85% 95%, #F87171 95% 100%)', margin: '0 auto 10px' }}></div>
                      <p>Instrument Status Distribution</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(#60A5FA 40%, #A78BFA 40% 70%, #4ADE80 70% 90%, #FBBF24 90% 100%)', margin: '0 auto 10px' }}></div>
                      <p>Category Distribution</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.recentActivity}>
                <h2>Recent Activity</h2>
                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <span>New instrument added: Microscope XYZ</span>
                    <span className={styles.time}>2 hours ago</span>
                  </div>
                  <div className={styles.activityItem}>
                    <span>Borrow request approved: Spectrophotometer</span>
                    <span className={styles.time}>5 hours ago</span>
                  </div>
                  <div className={styles.activityItem}>
                    <span>Maintenance scheduled: Centrifuge ABC</span>
                    <span className={styles.time}>1 day ago</span>
                  </div>
                  <div className={styles.activityItem}>
                    <span>Calibration completed: pH Meter</span>
                    <span className={styles.time}>2 days ago</span>
                  </div>
                  <div className={styles.activityItem}>
                    <span>Instrument returned: Centrifuge</span>
                    <span className={styles.time}>3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <section className={styles.inventoryContent} aria-labelledby="inventory-heading">
            <h2 id="inventory-heading" className="sr-only">Instrument Inventory</h2>
            <div className={styles.actionsBar}>
              <button className={styles.primaryBtn} onClick={handleAddInstrument}>
                + Add New Instrument
              </button>
              <div className={styles.filters}>
                <label htmlFor="filter-status" className="sr-only">Filter by status</label>
                <select 
                  id="filter-status"
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            
            <div className={styles.tableContainer}>
              <table className={styles.table} aria-label="Instrument inventory table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Category</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Status</th>
                    <th scope="col">Condition</th>
                    <th scope="col">Calibration Due</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instruments && instruments.length > 0 ? (
                    instruments.map((instrument) => (
                      <tr key={instrument.id}>
                        <td>{instrument.name}</td>
                        <td>{instrument.category || 'Uncategorized'}</td>
                        <td>{instrument.quantity}</td>
                        <td>
                          <span className={`${styles.status} ${styles[instrument.status]}`}>
                            {instrument.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <label htmlFor={`condition-${instrument.id}`} className="sr-only">Condition for {instrument.name}</label>
                          <select 
                            id={`condition-${instrument.id}`}
                            className={styles.conditionSelect}
                            value={instrument.condition || 'good'}
                            onChange={(e) => handleUpdateCondition(instrument.id, e.target.value)}
                          >
                            <option value="good">Good</option>
                            <option value="needs_repair">Needs Repair</option>
                            <option value="under_maintenance">Under Maintenance</option>
                            <option value="missing">Missing</option>
                          </select>
                        </td>
                        <td>
                          <label htmlFor={`calibration-${instrument.id}`} className="sr-only">Calibration date for {instrument.name}</label>
                          <input 
                            type="date" 
                            id={`calibration-${instrument.id}`}
                            value={instrument.calibration_due || ''}
                            onChange={(e) => handleUpdateCalibrationDate(instrument.id, e.target.value)}
                            className={styles.dateInput}
                          />
                        </td>
                        <td className={styles.actions}>
                          <button 
                            className={styles.editBtn}
                            onClick={() => handleEditInstrument(instrument)}
                            aria-label={`Edit ${instrument.name}`}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteInstrument(instrument.id)}
                            aria-label={`Delete ${instrument.name}`}
                          >
                            Delete
                          </button>
                          <button 
                            className={styles.qrBtn}
                            onClick={() => handleGenerateQRCode(instrument)}
                            aria-label={`Generate QR code for ${instrument.name}`}
                          >
                            QR
                          </button>
                          <button 
                            className={styles.calibrateBtn}
                            onClick={() => handleScheduleCalibration(instrument)}
                            aria-label={`Schedule calibration for ${instrument.name}`}
                          >
                            Calibrate
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.noData}>
                        No instruments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <section className={styles.requestsContent} aria-labelledby="requests-heading">
            <h2 id="requests-heading" className="sr-only">Borrowing Requests</h2>
            <div className={styles.actionsBar}>
              {bulkApprovalMode ? (
                <>
                  <span className={styles.selectedCount}>
                    {selectedRequests.length} selected
                  </span>
                  <button 
                    className={styles.primaryBtn}
                    onClick={handleBulkApprove}
                    disabled={selectedRequests.length === 0}
                  >
                    Approve Selected
                  </button>
                  <button 
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setBulkApprovalMode(false);
                      setSelectedRequests([]);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  className={styles.primaryBtn}
                  onClick={() => setBulkApprovalMode(true)}
                >
                  Bulk Approval Mode
                </button>
              )}
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table} aria-label="Borrowing requests table">
                <thead>
                  <tr>
                    {bulkApprovalMode && <th scope="col">Select</th>}
                    <th scope="col">Request ID</th>
                    <th scope="col">User</th>
                    <th scope="col">Instrument</th>
                    <th scope="col">Request Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Due Date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowRequests && borrowRequests.length > 0 ? (
                    borrowRequests.map((request) => (
                      <tr key={request.id}>
                        {bulkApprovalMode && (
                          <td>
                            <input 
                              type="checkbox" 
                              checked={selectedRequests.includes(request.id)}
                              onChange={() => toggleRequestSelection(request.id)}
                              aria-label={`Select request ${request.id.slice(0, 8)}`}
                            />
                          </td>
                        )}
                        <td>#{request.id.slice(0, 8)}</td>
                        <td>{request.user_email}</td>
                        <td>{request.instrument_name}</td>
                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`${styles.status} ${styles[request.status]}`}>
                            {request.status}
                          </span>
                        </td>
                        <td>{new Date(request.due_date).toLocaleDateString()}</td>
                        <td className={styles.actions}>
                          {request.status === 'pending' && !bulkApprovalMode && (
                            <>
                              <button 
                                className={styles.approveBtn}
                                onClick={() => handleApproveRequest(request.id)}
                                aria-label={`Approve request ${request.id.slice(0, 8)}`}
                              >
                                Approve
                              </button>
                              <button 
                                className={styles.denyBtn}
                                onClick={() => handleDenyRequest(request.id)}
                                aria-label={`Deny request ${request.id.slice(0, 8)}`}
                              >
                                Deny
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={bulkApprovalMode ? "8" : "7"} className={styles.noData}>
                        No borrowing requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <section className={styles.maintenanceContent} aria-labelledby="maintenance-heading">
            <h2 id="maintenance-heading" className="sr-only">Maintenance Schedule</h2>
            <div className={styles.actionsBar}>
              <button 
                className={styles.primaryBtn}
                onClick={() => {
                  setMaintenanceForm({
                    instrument_id: '',
                    instrument_name: '',
                    scheduled_date: '',
                    technician: '',
                    notes: ''
                  });
                  setShowMaintenanceModal(true);
                }}
              >
                Schedule Maintenance
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table} aria-label="Maintenance schedule table">
                <thead>
                  <tr>
                    <th scope="col">Instrument</th>
                    <th scope="col">Scheduled Date</th>
                    <th scope="col">Technician</th>
                    <th scope="col">Status</th>
                    <th scope="col">Notes</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceItems && maintenanceItems.length > 0 ? (
                    maintenanceItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.instrument_name}</td>
                        <td>{new Date(item.scheduled_date).toLocaleDateString()}</td>
                        <td>{item.technician || 'Unassigned'}</td>
                        <td>
                          <span className={`${styles.status} ${styles[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.notes || '-'}</td>
                        <td className={styles.actions}>
                          <button 
                            className={styles.editBtn}
                            onClick={() => {
                              const technician = prompt('Enter technician name:');
                              if (technician) {
                                handleAssignTechnician(item.id, technician);
                              }
                            }}
                            aria-label={`Assign technician to maintenance item ${item.id.slice(0, 8)}`}
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.noData}>
                        No maintenance items scheduled
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab === 'reports' && (
          <section className={styles.comingSoon} aria-labelledby="reports-heading">
            <h2 id="reports-heading">Reports Section</h2>
            <p>This section is under development. Coming soon!</p>
          </section>
        )}
        
        {activeTab === 'qr' && (
          <section className={styles.qrCenter} aria-labelledby="qr-heading">
            <h2 id="qr-heading">QR Code Center</h2>
            <div className={styles.actionsBar}>
              <button className={styles.primaryBtn} onClick={handleGenerateAllQRCodes}>
                Generate All QR Codes
              </button>
            </div>
            
            {selectedInstrument && qrCodeUrl ? (
              <div className={styles.qrDisplay}>
                <h3>QR Code for {selectedInstrument.name}</h3>
                <div className={styles.qrCodeContainer}>
                  <img src={qrCodeUrl} alt={`QR Code for ${selectedInstrument.name}`} />
                  <p>Scan this QR code to access instrument information</p>
                </div>
                <button 
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setSelectedInstrument(null);
                    setQrCodeUrl('');
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className={styles.qrList}>
                <h3>Instrument QR Codes</h3>
                <p>Select an instrument to generate or view its QR code</p>
                <div className={styles.instrumentGrid}>
                  {instruments && instruments.length > 0 ? (
                    instruments.map(instrument => (
                      <div key={instrument.id} className={styles.instrumentCard}>
                        <h4>{instrument.name}</h4>
                        <p>Category: {instrument.category || 'Uncategorized'}</p>
                        <p>Quantity: {instrument.quantity}</p>
                        <button 
                          className={styles.generateBtn}
                          onClick={() => handleGenerateQRCode(instrument)}
                          aria-label={`Generate QR code for ${instrument.name}`}
                        >
                          Generate QR Code
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No instruments found</p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
        
        {activeTab === 'users' && (
          <section className={styles.comingSoon} aria-labelledby="users-heading">
            <h2 id="users-heading">Users & Roles Section</h2>
            <p>This section is under development. Coming soon!</p>
          </section>
        )}
        
        {activeTab === 'settings' && (
          <section className={styles.comingSoon} aria-labelledby="settings-heading">
            <h2 id="settings-heading">Settings Section</h2>
            <p>This section is under development. Coming soon!</p>
          </section>
        )}
      </main>

      {/* Modal for adding/editing instruments */}
      {showModal && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className={styles.modalContent}>
            <h2 id="modal-title">{editingInstrument ? 'Edit Instrument' : 'Add New Instrument'}</h2>
            <form 
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  quantity: parseInt(formData.get('quantity')),
                  category: formData.get('category'),
                  status: formData.get('status')
                };
                handleSubmitModal(data);
              }}
            >
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editingInstrument?.name || ''}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={editingInstrument?.description || ''}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    defaultValue={editingInstrument?.quantity || 0}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    defaultValue={editingInstrument?.category || ''}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  defaultValue={editingInstrument?.status || 'available'}
                >
                  <option value="available">Available</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={handleCancelModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : (editingInstrument ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showMaintenanceModal && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="maintenance-modal-title">
          <div className={styles.modalContent}>
            <h2 id="maintenance-modal-title">Schedule Maintenance</h2>
            <form 
              className={styles.form}
              onSubmit={handleSaveMaintenance}
            >
              <div className={styles.formGroup}>
                <label htmlFor="instrument_id">Instrument</label>
                <select
                  id="instrument_id"
                  name="instrument_id"
                  value={maintenanceForm.instrument_id}
                  onChange={(e) => {
                    const selectedInstrument = instruments.find(i => i.id === e.target.value);
                    setMaintenanceForm(prev => ({
                      ...prev,
                      instrument_id: e.target.value,
                      instrument_name: selectedInstrument ? selectedInstrument.name : ''
                    }));
                  }}
                  required
                >
                  <option value="">Select an instrument</option>
                  {instruments && instruments.map(instrument => (
                    <option key={instrument.id} value={instrument.id}>
                      {instrument.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="instrument_name_display">Selected Instrument</label>
                <input
                  type="text"
                  id="instrument_name_display"
                  value={maintenanceForm.instrument_name}
                  readOnly
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="scheduled_date">Scheduled Date</label>
                <input
                  type="date"
                  id="scheduled_date"
                  name="scheduled_date"
                  value={maintenanceForm.scheduled_date}
                  onChange={handleMaintenanceFormChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="technician">Technician</label>
                <input
                  type="text"
                  id="technician"
                  name="technician"
                  value={maintenanceForm.technician}
                  onChange={handleMaintenanceFormChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={maintenanceForm.notes}
                  onChange={handleMaintenanceFormChange}
                  rows="4"
                />
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowMaintenanceModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showCalibrationModal && (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="calibration-modal-title">
          <div className={styles.modalContent}>
            <h2 id="calibration-modal-title">Schedule Calibration</h2>
            <form 
              className={styles.form}
              onSubmit={handleSaveCalibration}
            >
              <div className={styles.formGroup}>
                <label htmlFor="cal_instrument_id">Instrument</label>
                <select
                  id="cal_instrument_id"
                  name="instrument_id"
                  value={calibrationForm.instrument_id}
                  onChange={(e) => {
                    const selectedInstrument = instruments.find(i => i.id === e.target.value);
                    setCalibrationForm(prev => ({
                      ...prev,
                      instrument_id: e.target.value,
                      instrument_name: selectedInstrument ? selectedInstrument.name : ''
                    }));
                  }}
                  required
                >
                  <option value="">Select an instrument</option>
                  {instruments && instruments.map(instrument => (
                    <option key={instrument.id} value={instrument.id}>
                      {instrument.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cal_instrument_name_display">Selected Instrument</label>
                <input
                  type="text"
                  id="cal_instrument_name_display"
                  value={calibrationForm.instrument_name}
                  readOnly
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="calibration_date">Calibration Date</label>
                  <input
                    type="date"
                    id="calibration_date"
                    name="calibration_date"
                    value={calibrationForm.calibration_date}
                    onChange={handleCalibrationFormChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="next_calibration_date">Next Calibration</label>
                  <input
                    type="date"
                    id="next_calibration_date"
                    name="next_calibration_date"
                    value={calibrationForm.next_calibration_date}
                    onChange={handleCalibrationFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="cal_technician">Technician</label>
                <input
                  type="text"
                  id="cal_technician"
                  name="technician"
                  value={calibrationForm.technician}
                  onChange={handleCalibrationFormChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="certificate_number">Certificate Number</label>
                <input
                  type="text"
                  id="certificate_number"
                  name="certificate_number"
                  value={calibrationForm.certificate_number}
                  onChange={handleCalibrationFormChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="cal_notes">Notes</label>
                <textarea
                  id="cal_notes"
                  name="notes"
                  value={calibrationForm.notes}
                  onChange={handleCalibrationFormChange}
                  rows="4"
                />
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowCalibrationModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}