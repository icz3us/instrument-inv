'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    console.log('Root page loaded, checking session...');
    
    // Redirect based on authentication status
    if (!loading) {
      if (user) {
        // User is logged in, redirect to appropriate dashboard
        if (user.role === 'admin') {
          console.log('Redirecting logged-in admin to admin dashboard');
          router.push('/dashboard/admin');
        } else {
          console.log('Redirecting logged-in employee to employee dashboard');
          router.push('/dashboard/employee');
        }
      } else {
        // No user, redirect to login
        console.log('No session found, redirecting to login');
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.125rem',
        color: '#718096'
      }}>
        Checking session...
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '1.125rem',
      color: '#718096'
    }}>
      Redirecting...
    </div>
  );
}