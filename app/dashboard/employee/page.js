'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js'
import styles from '../dashboard.module.css';

// Create a Supabase client for client-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EmployeeDashboard() {
  const router = useRouter();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    console.log('Employee dashboard loaded');
    fetchInstruments();
    setLoading(false); // Set loading to false since we're not checking auth
  }, []);

  const fetchInstruments = async () => {
    try {
      console.log('Fetching instruments in employee dashboard...');
      
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
      
      console.log('API response in employee dashboard:', { data, error });
      
      if (error) {
        throw new Error('Failed to fetch instruments: ' + error.message);
      }
      
      setInstruments(data);
    } catch (err) {
      console.error('Error fetching instruments in employee dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Logging out from employee dashboard...');
    
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleStatusUpdate = async (instrument, newStatus) => {
    try {
      console.log('Updating instrument status in employee dashboard:', { instrument, newStatus });
      
      const { data, error } = await supabase
        .from('instruments')
        .update({
          name: instrument.name,
          description: instrument.description,
          quantity: instrument.quantity,
          category: instrument.category,
          status: newStatus
        })
        .eq('id', instrument.id)
        .select()

      if (error) {
        throw new Error('Failed to update instrument status: ' + error.message);
      }

      fetchInstruments();
    } catch (err) {
      console.error('Error updating instrument status in employee dashboard:', err);
      setError(err.message);
    }
  };

  const filteredInstruments = filterStatus === 'all'
    ? instruments
    : instruments.filter(instrument => instrument.status === filterStatus);

  // Add a simple test to see if the component is rendering
  console.log('Employee dashboard component rendering');

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

      {loading ? (
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