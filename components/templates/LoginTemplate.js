'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginCard from '../organisms/LoginCard';
import styles from './LoginTemplate.module.css';

const LoginTemplate = ({ onLogin, loading, error }) => {
  const router = useRouter();

  const handleLogin = async (credentials) => {
    try {
      const result = await onLogin(credentials);
      
      // Add a small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on user role
      if (result && result.user) {
        if (result.user.role === 'admin') {
          console.log('Redirecting to admin dashboard');
          router.push('/dashboard/admin');
        } else {
          console.log('Redirecting to employee dashboard');
          router.push('/dashboard/employee');
        }
      }
    } catch (err) {
      // Error is handled by the hook
      console.error('Login error:', err);
    }
  };

  return (
    <div className={styles.container}>
      <LoginCard 
        onLogin={handleLogin} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default LoginTemplate;