import React, { useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../api/auth.api';

export const AuthContext = React.createContext();

const TOKEN_KEY = 'petsneha_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    setRole(null);
  };

  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_KEY);

    if (!existingToken) {
      setLoading(false);
      return;
    }

    const restoreSession = async () => {
      try {
        const response = await getCurrentUser();
        const currentUser = response?.data?.user || null;

        setUser(currentUser);
        setToken(existingToken);
        setRole(currentUser?.role || null);
      } catch (error) {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    const currentUser = response?.data?.user || null;
    const authToken = response?.token || null;

    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
    }

    setUser(currentUser);
    setToken(authToken);
    setRole(currentUser?.role || null);

    return currentUser;
  };

  const register = async (name, email, password, confirmPassword, userRole) => {
    const response = await registerUser({ name, email, password, confirmPassword, role: userRole });
    const currentUser = response?.data?.user || null;
    const authToken = response?.token || null;

    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
    }

    setUser(currentUser);
    setToken(authToken);
    setRole(currentUser?.role || userRole || null);

    return currentUser;
  };

  const logout = () => {
    void logoutUser();
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      role,
      login,
      register,
      logout,
      clearSession,
    }),
    [loading, role, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
