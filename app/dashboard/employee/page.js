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

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    instruments, 
    loading: instrumentsLoading, 
    error,
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

  const handleStatusChange = async (instrument, newStatus) => {
    try {
      await updateInstrument(instrument.id, { ...instrument, status: newStatus });
    } catch (err) {
      console.error('Error updating instrument status:', err);
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

  // Redirect if not employee or admin
  if (!user || (user.role !== 'employee' && user.role !== 'admin')) {
    return null;
  }

  return (
    <DashboardTemplate
      title="Employee Dashboard"
      user={user}
      instruments={instruments}
      loading={instrumentsLoading}
      error={error}
      showModal={false}
      editingInstrument={null}
      filterStatus={filterStatus}
      onLogout={handleLogout}
      onFilterChange={setFilterStatus}
      onStatusChange={handleStatusChange}
    />
  );
}