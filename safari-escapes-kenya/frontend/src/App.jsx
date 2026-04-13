import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import PackagesPage from './pages/PackagesPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PackageDetail from './pages/PackageDetail';
import EnquiryPage from './pages/EnquiryPage';
import PaymentPage from './pages/PaymentPage';
import UserDashboard from './pages/UserDashboard';
import CancellationPage from './pages/CancellationPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPackages from './pages/admin/AdminPackages';
import AdminPackageForm from './pages/admin/AdminPackageForm';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReviews from './pages/admin/AdminReviews';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminCancellations from './pages/admin/AdminCancellations';

import { useAuth } from './hooks/useAuth';

const Spinner = ({ bg }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg || 'var(--ivory)' }}>
    <div style={{ width: 32, height: 32, border: `3px solid ${bg ? '#6366F1' : 'var(--earth)'}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Public pages: everyone can access (admins bounced to /admin)
function PublicRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />;
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// Auth pages (login/signup): redirect away if already logged in
function AuthRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// Protected user pages: must be logged in (non-admin)
function ProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// Admin pages: must be logged in AND have admin claim
function AdminRoute({ children }) {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner bg="var(--admin-bg)" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1E2130', color: '#E2E8F0', border: '1px solid #2A2D3E', fontFamily: 'Outfit, sans-serif' },
        }}
      />
      <Routes>
        {/* Public routes — admins are bounced to /admin */}
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/about" element={<PublicRoute><AboutUs /></PublicRoute>} />
        <Route path="/packages" element={<PublicRoute><PackagesPage /></PublicRoute>} />
        <Route path="/packages/:slug" element={<PublicRoute><PackageDetail /></PublicRoute>} />
        <Route path="/enquiry/:slug" element={<PublicRoute><EnquiryPage /></PublicRoute>} />
        <Route path="/enquiry" element={<PublicRoute><EnquiryPage /></PublicRoute>} />
        <Route path="/cancellation" element={<PublicRoute><CancellationPage /></PublicRoute>} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />

        {/* Protected user routes — admins bounced to /admin */}
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/pay/:slug" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />

        {/* Admin routes — completely separate, no Navbar/Footer */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="packages/new" element={<AdminPackageForm />} />
          <Route path="packages/:id/edit" element={<AdminPackageForm />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="cancellations" element={<AdminCancellations />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
