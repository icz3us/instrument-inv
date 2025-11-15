import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

// Custom hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.login(credentials);
      setUser(userData.user);
      return userData;
    } catch (err) {
      setError(err.message);
      console.error('Error logging in:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
      console.error('Error logging out:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const registeredUser = await authService.register(userData);
      return registeredUser;
    } catch (err) {
      setError(err.message);
      console.error('Error registering:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await authService.getCurrentSession();
      setUser(sessionData ? sessionData.user : null);
    } catch (err) {
      setError(err.message);
      console.error('Error checking session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in when hook is initialized
    checkSession();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    checkSession
  };
};