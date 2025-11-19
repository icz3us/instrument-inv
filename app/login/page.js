'use client';

import { useAuth } from '../../hooks/useAuth';
import LoginTemplate from '../../components/templates/LoginTemplate';

export default function Login() {
  const { login, loading, error } = useAuth();

  return (
    <LoginTemplate
      onLogin={login}
      loading={loading}
      error={error}
    />
  );
}