'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useInstruments } from '../../../hooks/useInstruments';
import { createClient } from '@supabase/supabase-js'
import DashboardTemplate from '../../../components/templates/DashboardTemplate';

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
    createInstrument, 
    updateInstrument, 
    deleteInstrument 
  } = useInstruments();
  
  const [showModal, setShowModal] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

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

  const handleAddInstrument = () => {
    setEditingInstrument(null);
    setShowModal(true);
  };

  const handleEditInstrument = (instrument) => {
    setEditingInstrument(instrument);
    setShowModal(true);
  };

  const handleDeleteInstrument = async (id) => {
    if (!confirm('Are you sure you want to delete this instrument?')) return;
    try {
      await deleteInstrument(id);
    } catch (err) {
      console.error('Error deleting instrument:', err);
    }
  };

  const handleStatusChange = async (instrument, newStatus) => {
    try {
      await updateInstrument(instrument.id, { ...instrument, status: newStatus });
    } catch (err) {
      console.error('Error updating instrument status:', err);
    }
  };

  const handleSubmitModal = async (formData) => {
    setModalLoading(true);
    try {
      if (editingInstrument) {
        await updateInstrument(editingInstrument.id, formData);
      } else {
        await createInstrument(formData);
      }
      
      setShowModal(false);
      setEditingInstrument(null);
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

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="container">
        <div className="loading">Checking authentication...</div>
      </div>
    );
  }

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <DashboardTemplate
      title="Admin Dashboard"
      user={user}
      instruments={instruments}
      loading={instrumentsLoading}
      error={error}
      showModal={showModal}
      editingInstrument={editingInstrument}
      filterStatus={filterStatus}
      onLogout={handleLogout}
      onAddInstrument={handleAddInstrument}
      onEditInstrument={handleEditInstrument}
      onDeleteInstrument={handleDeleteInstrument}
      onStatusChange={handleStatusChange}
      onFilterChange={setFilterStatus}
      onSubmitModal={handleSubmitModal}
      onCancelModal={handleCancelModal}
      modalLoading={modalLoading}
    />
  );
}