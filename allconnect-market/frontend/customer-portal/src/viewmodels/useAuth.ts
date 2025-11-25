import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService, getErrorMessage } from '../services';
import { LoginRequest, RegisterRequest } from '../models';

export const useAuth = () => {
  const { user, token, isAuthenticated, login: storeLogin, logout: storeLogout, setLoading, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(credentials);
      storeLogin(response.user, response.token);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeLogin, setLoading]);

  const register = useCallback(async (data: RegisterRequest) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.register(data);
      storeLogin(response.user, response.token);
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeLogin, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      storeLogout();
    }
  }, [storeLogout]);

  const validateSession = useCallback(async () => {
    if (!token) return false;

    try {
      const validUser = await authService.validateToken();
      if (validUser) {
        return true;
      }
    } catch {
      storeLogout();
    }
    return false;
  }, [token, storeLogout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    validateSession,
    clearError,
  };
};

export default useAuth;
