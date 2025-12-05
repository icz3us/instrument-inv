'use client';

import { useAuth } from '../../hooks/useAuth';
import dynamic from 'next/dynamic';

// Lazy load the LoginTemplate component
const LoginTemplate = dynamic(() => import('../../components/templates/LoginTemplate'), {
  loading: () => <div>Loading login form...</div>,
  ssr: false
});

export default function Login() {
  const { login, loading, error } = useAuth();

  return (
    <main role="main">
      <LoginTemplate
        onLogin={login}
        loading={loading}
        error={error}
      />
    </main>
  );
}