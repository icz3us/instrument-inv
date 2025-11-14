'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js'
import styles from './login.module.css';

// Create a Supabase client for client-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    // Make sure we prevent default form submission
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submit event triggered');
    
    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting login with Supabase client');
      
      console.log('Signing in with email:', formData.email);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      console.log('Auth response:', { data, error: authError });
      
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      
      console.log('Authentication successful, fetching user role...');
      
      // Add a small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Store user session and redirect based on role
      // Use select() without single() to see all results first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', formData.email);
      
      console.log('User role data:', { userData, error: userError });
      
      if (userError) {
        setError('Error fetching user role: ' + userError.message);
        setLoading(false);
        return;
      }
      
      // Check if we got exactly one user
      if (!userData || userData.length === 0) {
        setError('User not found in database. Please contact administrator to set up your account.');
        setLoading(false);
        return;
      }
      
      if (userData.length > 1) {
        setError('Multiple user entries found. Please contact administrator.');
        setLoading(false);
        return;
      }
      
      // Get the role from the first (and only) result
      const userRole = userData[0].role;
      console.log('User role:', userRole);
      
      // Ensure loading state is set to false before navigation
      setLoading(false);
      
      // Force navigation with multiple approaches
      if (userRole === 'admin') {
        console.log('Redirecting to admin dashboard');
        try {
          // Try multiple navigation methods
          router.push('/dashboard/admin');
          console.log('Next.js router.push completed');
        } catch (navError) {
          console.error('Navigation error with router.push:', navError);
        }
        // Force window location change as fallback
        setTimeout(() => {
          console.log('Attempting fallback navigation with window.location');
          window.location.href = '/dashboard/admin';
        }, 200);
      } else {
        console.log('Redirecting to employee dashboard');
        try {
          // Try multiple navigation methods
          router.push('/dashboard/employee');
          console.log('Next.js router.push completed');
        } catch (navError) {
          console.error('Navigation error with router.push:', navError);
        }
        // Force window location change as fallback
        setTimeout(() => {
          console.log('Attempting fallback navigation with window.location');
          window.location.href = '/dashboard/employee';
        }, 200);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login: ' + err.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Instrument Inventory</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account? <Link href="/login" className={styles.link}>Contact admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}