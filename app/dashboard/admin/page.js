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

export default function AdminDashboard() {
  const router = useRouter();
  const [instruments, setInstruments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    category: '',
    status: 'available'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Admin dashboard loaded');
    fetchInstruments();
    setLoading(false); // Set loading to false since we're not checking auth
  }, []);

  const fetchInstruments = async () => {
    try {
      console.log('Fetching instruments in admin dashboard...');
      
      const { data, error } = await supabase
        .from('instruments')
        .select('*')
      
      console.log('API response in admin dashboard:', { data, error });
      
      if (error) {
        throw new Error('Failed to fetch instruments: ' + error.message);
      }
      
      setInstruments(data);
    } catch (err) {
      console.error('Error fetching instruments in admin dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Logging out from admin dashboard...');
    
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Submitting instrument data in admin dashboard:', formData);
      
      if (editingInstrument) {
        console.log('Updating existing instrument in admin dashboard');
        // Update existing instrument
        const { data, error } = await supabase
          .from('instruments')
          .update({
            name: formData.name,
            description: formData.description,
            quantity: formData.quantity,
            category: formData.category,
            status: formData.status
          })
          .eq('id', editingInstrument.id)
          .select()

        if (error) {
          throw new Error('Failed to update instrument: ' + error.message);
        }
      } else {
        console.log('Creating new instrument in admin dashboard');
        // Create new instrument
        const { data, error } = await supabase
          .from('instruments')
          .insert([
            {
              name: formData.name,
              description: formData.description,
              quantity: formData.quantity,
              category: formData.category,
              status: formData.status
            }
          ])
          .select()

        if (error) {
          throw new Error('Failed to create instrument: ' + error.message);
        }
      }

      fetchInstruments();
      setShowModal(false);
      setEditingInstrument(null);
      setFormData({ name: '', description: '', quantity: 0, category: '', status: 'available' });
    } catch (err) {
      console.error('Error saving instrument in admin dashboard:', err);
      setError(err.message);
    }
  };

  const handleEdit = (instrument) => {
    console.log('Editing instrument in admin dashboard:', instrument);
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
    console.log('Deleting instrument with ID in admin dashboard:', id);
    
    if (!confirm('Are you sure you want to delete this instrument?')) return;

    try {
      const { error } = await supabase
        .from('instruments')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error('Failed to delete instrument: ' + error.message);
      }

      fetchInstruments();
    } catch (err) {
      console.error('Error deleting instrument in admin dashboard:', err);
      setError(err.message);
    }
  };

  // Add a simple test to see if the component is rendering
  console.log('Admin dashboard component rendering');

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