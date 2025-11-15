'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import styles from './login.module.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const router = useRouter();
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const userData = await login(formData);
      
      // Redirect based on user role
      if (userData.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/employee');
      }
    } catch (err) {
      // Error is handled by the hook
      console.error('Login error:', err);
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