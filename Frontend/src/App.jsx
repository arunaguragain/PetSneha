import React from 'react';
import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VetLayout from './components/VetLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { Card, PageHeader } from './components/ui';
import { getPets } from './api/pet.api';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/owner/DashboardPage';
import AddPetPage from './pages/owner/AddPetPage';
import EditPetPage from './pages/owner/EditPetPage';
import PetProfilePage from './pages/owner/PetProfilePage';
import SetReminderPage from './pages/owner/SetReminderPage';
import ReminderSuccessPage from './pages/owner/ReminderSuccessPage';
import VetDirectoryPage from './pages/owner/VetDirectoryPage';
import VetProfilePage from './pages/owner/VetProfilePage';
import BookingPage from './pages/owner/BookingPage';
import EmergencyPage from './pages/owner/EmergencyPage';
import ArticlesPage from './pages/owner/ArticlesPage';
import ArticleDetailPage from './pages/owner/ArticleDetailPage';
import ArticleCreatePage from './pages/owner/ArticleCreatePage';
import ForumPage from './pages/owner/ForumPage';
import ForumPostPage from './pages/owner/ForumPostPage';
import ForumCreatePage from './pages/owner/ForumCreatePage';
import ShopPage from './pages/owner/ShopPage';
import ProductPage from './pages/owner/ProductPage';
import CheckoutPage from './pages/owner/CheckoutPage';
import OrdersPage from './pages/owner/OrdersPage';
import VetDashboardPage from './pages/vet/VetDashboardPage';
import VetAppointmentsPage from './pages/vet/VetAppointmentsPage';
import VetArticlesPage from './pages/vet/VetArticlesPage';
import VetLandingPage from './pages/vet/VetLandingPage';
import VetRegisterPage from './pages/vet/VetRegisterPage';
import VetProductsPage from './pages/vet/VetProductsPage';
import AppointmentDetailPage from './pages/owner/AppointmentDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

function AuthenticatedLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-[#F8FAFC]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function RecordsGateway() {
  const [loading, setLoading] = React.useState(true);
  const [petId, setPetId] = React.useState(null);

  React.useEffect(() => {
    getPets()
      .then((res) => {
        const petsList = res.data?.pets || res.data?.items || (Array.isArray(res.data) ? res.data : res || []);
        if (petsList.length > 0) {
          setPetId(petsList[0]._id || petsList[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse font-semibold text-[#64748B]">Loading records...</div>
      </div>
    );
  }

  if (petId) {
    return <Navigate to={`/pets/${petId}`} replace />;
  }

  return <Navigate to="/dashboard" replace />;
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
      <Route path="/vet/login" element={<LoginPage variant="vet" />} />
      <Route path="/admin/login" element={<LoginPage variant="admin" />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/vets-landing" element={<VetLandingPage />} />
      <Route path="/vet/register" element={<VetRegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute allowedRoles={['petOwner', 'vet', 'admin']} />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['petOwner', 'vet']} />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/new" element={<ForumCreatePage />} />
          <Route path="/forum/:postId" element={<ForumPostPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['petOwner']} />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/records" element={<RecordsGateway />} />
          <Route path="/pets/new" element={<AddPetPage />} />
          <Route path="/pets/:petId" element={<PetProfilePage />} />
          <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
          <Route path="/pets/:petId/edit" element={<EditPetPage />} />
          <Route path="/reminders/new" element={<SetReminderPage />} />
          <Route path="/reminders/success" element={<ReminderSuccessPage />} />
          <Route path="/vets" element={<VetDirectoryPage />} />
          <Route path="/vets/:vetId" element={<VetProfilePage />} />
          <Route path="/vets/:vetId/book" element={<BookingPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/new" element={<ArticleCreatePage />} />
          <Route path="/articles/:articleId" element={<ArticleDetailPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:productId" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['vet']} />}>
        <Route element={<VetLayout />}>
          <Route path="/vet/dashboard" element={<VetDashboardPage />} />
          <Route path="/vet/appointments" element={<VetAppointmentsPage />} />
          <Route path="/vet/articles" element={<VetArticlesPage />} />
          <Route path="/vet/products" element={<VetProductsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
