import React, { useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../api/auth.api';

export const AuthContext = React.createContext();

const TOKEN_KEY = 'petsneha_token';
const ROLE_KEY = 'petsneha_role';

const getLoginPathForRole = (userRole) => {
  if (userRole === 'admin') return '/admin/login';
  if (userRole === 'vet') return '/vet/login';
  return '/login';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [language, setLanguage] = useState(() => localStorage.getItem('petsneha_lang') || 'en');

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
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
        setLanguage(currentUser?.language || localStorage.getItem('petsneha_lang') || 'en');
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
    const authToken = response?.data?.token || null;

    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
    }

    if (currentUser?.role) {
      localStorage.setItem(ROLE_KEY, currentUser.role);
    }

    setUser(currentUser);
    setToken(authToken);
    setRole(currentUser?.role || null);
    setLanguage(currentUser?.language || localStorage.getItem('petsneha_lang') || 'en');

    return currentUser;
  };

  const register = async (name, email, password, confirmPassword, userRole, phone) => {
    const response = await registerUser({ name, email, phone, password, confirmPassword, role: userRole });
    const currentUser = response?.data?.user || null;
    const authToken = response?.data?.token || null;

    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
    }

    const userRoleToStore = currentUser?.role || userRole;
    if (userRoleToStore) {
      localStorage.setItem(ROLE_KEY, userRoleToStore);
    }

    setUser(currentUser);
    setToken(authToken);
    setRole(userRoleToStore || null);
    setLanguage(currentUser?.language || localStorage.getItem('petsneha_lang') || 'en');

    return currentUser;
  };

  const logout = () => {
    const loginPath = getLoginPathForRole(role || user?.role || localStorage.getItem(ROLE_KEY));
    void logoutUser();
    clearSession();
    return loginPath;
  };

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      const currentUser = response?.data?.user || null;
      if (currentUser) {
        setUser(currentUser);
        setLanguage(currentUser?.language || language);
      }
      return currentUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  };

  const updateUserLocally = (updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      role,
      language,
      setLanguage,
      login,
      register,
      logout,
      clearSession,
      getLoginPathForRole,
      refreshUser,
      updateUserLocally,
    }),
    [language, loading, role, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
