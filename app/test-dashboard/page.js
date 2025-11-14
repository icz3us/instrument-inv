'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestDashboard() {
  const router = useRouter();
  
  useEffect(() => {
    console.log('Test dashboard page loaded');
  }, []);

  const goToAdmin = () => {
    console.log('Going to admin dashboard');
    router.push('/dashboard/admin');
  };

  const goToEmployee = () => {
    console.log('Going to employee dashboard');
    router.push('/dashboard/employee');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Dashboard Navigation</h1>
      <p>This page tests if we can navigate to dashboards directly.</p>
      
      <div style={{ marginTop: '1rem' }}>
        <button 
          onClick={goToAdmin}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Go to Admin Dashboard
        </button>
        
        <button 
          onClick={goToEmployee}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Employee Dashboard
        </button>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/login" style={{ color: '#0070f3', textDecoration: 'none' }}>
          ← Back to Login
        </a>
      </div>
    </div>
  );
}