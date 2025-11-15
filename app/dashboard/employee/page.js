'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useInstruments } from '../../../hooks/useInstruments';
import { createClient } from '@supabase/supabase-js'
import styles from '../dashboard.module.css';

// Create a Supabase client for client-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    instruments, 
    loading: instrumentsLoading, 
    error, 
    fetchInstruments, 
    updateInstrument 
  } = useInstruments();
  
  const [filterStatus, setFilterStatus] = useState('all');

  // Check if user is authenticated and has employee or admin role
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'employee' && user.role !== 'admin'))) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    console.log('Logging out from employee dashboard...');
    
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleStatusUpdate = async (instrument, newStatus) => {
    try {
      await updateInstrument(instrument.id, { ...instrument, status: newStatus });
    } catch (err) {
      console.error('Error updating instrument status:', err);
    }
  };

  const filteredInstruments = filterStatus === 'all'
    ? instruments
    : instruments.filter(instrument => instrument.status === filterStatus);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Checking authentication...</div>
      </div>
    );
  }

  // Redirect if not employee or admin
  if (!user || (user.role !== 'employee' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Employee Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div className={styles.actions}>
        <div className={styles.filterGroup}>
          <label>Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="checked_out">Checked Out</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {instrumentsLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstruments.length > 0 ? (
                filteredInstruments.map((instrument) => (
                  <tr key={instrument.id}>
                    <td>{instrument.name}</td>
                    <td>{instrument.description}</td>
                    <td>{instrument.quantity}</td>
                    <td>{instrument.category}</td>
                    <td>
                      <span className={`${styles.status} ${styles[instrument.status]}`}>
                        {instrument.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={instrument.status}
                        onChange={(e) => handleStatusUpdate(instrument, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="available">Available</option>
                        <option value="checked_out">Checked Out</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.loading}>No instruments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}