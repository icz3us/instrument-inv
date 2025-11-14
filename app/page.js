'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase/client';

export default function RootPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  
  useEffect(() => {
    console.log('Root page loaded, checking session...');
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session in root page:', session);
        
        if (session) {
          // User is logged in, check their role
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('email', session.user.email);
          
          if (!userError && userData && userData.length > 0) {
            const userRole = userData[0].role;
            if (userRole === 'admin') {
              console.log('Redirecting logged-in admin to admin dashboard');
              router.push('/dashboard/admin');
            } else {
              console.log('Redirecting logged-in employee to employee dashboard');
              router.push('/dashboard/employee');
            }
          } else {
            console.log('User not found or error, redirecting to login');
            router.push('/login');
          }
        } else {
          console.log('No session found, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking session in root page:', error);
        router.push('/login');
      } finally {
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [router]);

  if (checkingSession) {
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