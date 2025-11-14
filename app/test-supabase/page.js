'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import Link from 'next/link';

export default function TestSupabase() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        console.log('Current session:', session);
      } catch (error) {
        console.error('Error getting session:', error);
      }
    };

    checkSession();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('Testing Supabase connection...');
      
      // Test 1: Check if we can get the session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session test:', { sessionData, sessionError });

      // Test 2: Try to fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      console.log('Users table test:', { usersData, usersError });

      // Test 3: Try to fetch instruments
      const { data: instrumentsData, error: instrumentsError } = await supabase
        .from('instruments')
        .select('*');
      console.log('Instruments table test:', { instrumentsData, instrumentsError });

      setTestResult({
        session: sessionData,
        users: usersData,
        instruments: instrumentsData,
        errors: {
          session: sessionError,
          users: usersError,
          instruments: instrumentsError
        }
      });
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Supabase Connection Test</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Current Session:</strong>
        <pre>{session ? JSON.stringify(session, null, 2) : 'No active session'}</pre>
      </div>

      <button 
        onClick={testConnection} 
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Supabase Connection'}
      </button>

      {testResult && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f0f0' }}>
          <h2>Test Results:</h2>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link href="/login" style={{ color: '#0070f3', textDecoration: 'none' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}