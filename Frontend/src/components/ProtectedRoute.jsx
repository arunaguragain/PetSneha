import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from './ui';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    if (location.pathname.startsWith('/vet')) {
      return <Navigate to="/vet/login" replace state={{ redirect: location.pathname + location.search }} />;
    }
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace state={{ redirect: location.pathname + location.search }} />;
    }
    return <Navigate to="/login" replace state={{ redirect: location.pathname + location.search }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
