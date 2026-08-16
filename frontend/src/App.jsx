import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import Services from './pages/Services';
import ProductDetails from './pages/ProductDetails';
import ServiceDetails from './pages/ServiceDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';
import CreateListing from './pages/CreateListing';
import CreateService from './pages/CreateService';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminReports from './pages/admin/AdminReports';
import AdminFinance from './pages/admin/AdminFinance';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Wallet from './pages/Wallet';
import VerifyPhone from './pages/VerifyPhone';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoaderCircle aria-label="Loading" className="h-10 w-10 animate-spin text-cobalt" />
    </div>
  );
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function Layout() {
  const location = useLocation();
  const noFooter = ['/messages'];
  const showFooter = !noFooter.some((p) => location.pathname.startsWith(p));

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/services" element={<Services />} />
          <Route path="/listings/:id" element={<ProductDetails />} />
          <Route path="/services/:id" element={<ServiceDetails />} />

          {/* Private routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
          <Route path="/listings/new" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
          <Route path="/listings/:id/edit" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
          <Route path="/services/new" element={<PrivateRoute><CreateService /></PrivateRoute>} />
          <Route path="/services/:id/edit" element={<PrivateRoute><CreateService /></PrivateRoute>} />
          <Route path="/checkout/:type/:id" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/orders/:id" element={<PrivateRoute><OrderDetails /></PrivateRoute>} />
          <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
          <Route path="/verify-phone" element={<PrivateRoute><VerifyPhone /></PrivateRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/listings" element={<AdminRoute><AdminListings /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/finance" element={<AdminRoute><AdminFinance /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
