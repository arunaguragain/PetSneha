import React from 'react';
import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Card, PageHeader } from './components/ui';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

function AuthenticatedLayout() {
  return (
    <>
      <Navbar />
      <main className="container-app page-content">
        <Outlet />
      </main>
    </>
  );
}

function PlaceholderPage({ title, subtitle }) {
  return (
    <Card className="p-8">
      <PageHeader title={title} subtitle={subtitle} />
    </Card>
  );
}

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-heading-lg font-display text-neutral-900">Access denied</h1>
        <p className="mt-3 text-body-md text-neutral-600">You do not have permission to view this page.</p>
        <div className="mt-6">
          <Link to="/login" className="font-semibold text-primary-600">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute allowedRoles={['petOwner', 'vet', 'admin']} />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/onboarding" element={<PlaceholderPage title="Onboarding coming in Sprint 2" subtitle="Your account is ready. The onboarding flow will land here next." />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['petOwner']} />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard coming in Sprint 2" subtitle="The pet owner dashboard is on the way." />} />
          <Route path="/pets" element={<PlaceholderPage title="Pets coming in Sprint 2" subtitle="Manage pet profiles, vaccination history, and reminders here." />} />
          <Route path="/vets" element={<PlaceholderPage title="Vets coming in Sprint 2" subtitle="Verified vet discovery will live here." />} />
          <Route path="/records" element={<PlaceholderPage title="Records coming in Sprint 2" subtitle="Medical history and files will appear here." />} />
          <Route path="/shop" element={<PlaceholderPage title="Shop coming in Sprint 2" subtitle="Pet products and delivery flow will be added here." />} />
          <Route path="/articles" element={<PlaceholderPage title="Articles coming in Sprint 2" subtitle="Educational content will appear here." />} />
          <Route path="/community" element={<PlaceholderPage title="Community coming in Sprint 2" subtitle="Forums and owner discussions will be added here." />} />
          <Route path="/emergency" element={<PlaceholderPage title="Emergency coming in Sprint 2" subtitle="Urgent care shortcuts will be added here." />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['vet']} />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/vet/dashboard" element={<PlaceholderPage title="Vet Dashboard coming in Sprint 3" subtitle="Vet operations and appointments will appear here." />} />
          <Route path="/vet/appointments" element={<PlaceholderPage title="Vet Appointments coming in Sprint 3" subtitle="Appointment management will live here." />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/admin/dashboard" element={<PlaceholderPage title="Admin Dashboard coming in Sprint 4" subtitle="Platform administration tools will appear here." />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
