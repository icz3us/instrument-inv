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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    instruments, 
    loading: instrumentsLoading, 
    error, 
    fetchInstruments, 
    createInstrument, 
    updateInstrument, 
    deleteInstrument 
  } = useInstruments();
  
  const [showModal, setShowModal] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    category: '',
    status: 'available'
  });

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    console.log('Logging out from admin dashboard...');
    
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInstrument) {
        await updateInstrument(editingInstrument.id, formData);
      } else {
        await createInstrument(formData);
      }
      
      setShowModal(false);
      setEditingInstrument(null);
      setFormData({ name: '', description: '', quantity: 0, category: '', status: 'available' });
    } catch (err) {
      console.error('Error saving instrument:', err);
    }
  };

  const handleEdit = (instrument) => {
    setEditingInstrument(instrument);
    setFormData({
      name: instrument.name,
      description: instrument.description,
      quantity: instrument.quantity,
      category: instrument.category,
      status: instrument.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this instrument?')) return;
    try {
      await deleteInstrument(id);
    } catch (err) {
      console.error('Error deleting instrument:', err);
    }
  };

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
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div className={styles.actions}>
        <button onClick={() => setShowModal(true)} className={styles.addButton}>
          + Add New Instrument
        </button>
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
              {instruments.length > 0 ? (
                instruments.map((instrument) => (
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
                      <button onClick={() => handleEdit(instrument)} className={styles.editButton}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(instrument.id)} className={styles.deleteButton}>
                        Delete
                      </button>
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

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingInstrument ? 'Edit Instrument' : 'Add New Instrument'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setEditingInstrument(null);
                  setFormData({ name: '', description: '', quantity: 0, category: '', status: 'available' });
                }} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingInstrument ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}