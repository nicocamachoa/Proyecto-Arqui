import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './views/components/AdminLayout';
import { ProtectedRoute } from './views/components/ProtectedRoute';
import { Login } from './views/pages/Login';
// Dashboard pages
import { DashboardNegocio } from './views/pages/DashboardNegocio';
import { DashboardContenido } from './views/pages/DashboardContenido';
import { DashboardIT } from './views/pages/DashboardIT';
import { DashboardOperaciones } from './views/pages/DashboardOperaciones';
// Business Admin pages
import { Orders } from './views/pages/Orders';
import { Products } from './views/pages/Products';
import { Customers } from './views/pages/Customers';
// Content Admin pages
import { Content } from './views/pages/Content';
import { Promotions } from './views/pages/Promotions';
import { Categories } from './views/pages/Categories';
// IT Admin pages
import { Services } from './views/pages/Services';
import { Integrations } from './views/pages/Integrations';
import { Logs } from './views/pages/Logs';
import { Metrics } from './views/pages/Metrics';
// Operations Admin pages
import { Shipping } from './views/pages/Shipping';
import { Inventory } from './views/pages/Inventory';
import { useAuthStore } from './stores';

function App() {
  const { user, isAuthenticated, setAuth } = useAuthStore();

  // Check for admin session from customer-portal (shared localStorage)
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const customerPortalAuth = localStorage.getItem('auth-storage');
        if (customerPortalAuth) {
          const parsed = JSON.parse(customerPortalAuth);
          const state = parsed?.state;
          if (state?.user && state?.token && state?.user?.role?.startsWith('ADMIN_')) {
            // Auto-authenticate admin users from customer-portal
            setAuth(state.user, state.token);
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, [isAuthenticated, setAuth]);

  const getDashboardByRole = () => {
    switch (user?.role) {
      case 'ADMIN_NEGOCIO':
        return <DashboardNegocio />;
      case 'ADMIN_CONTENIDO':
        return <DashboardContenido />;
      case 'ADMIN_IT':
        return <DashboardIT />;
      case 'ADMIN_OPERACIONES':
        return <DashboardOperaciones />;
      default:
        return <DashboardNegocio />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={getDashboardByRole()} />

        {/* Business Admin Routes */}
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/reports" element={<DashboardNegocio />} />

        {/* Content Admin Routes */}
        <Route path="/content" element={<Content />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/categories" element={<Categories />} />

        {/* IT Admin Routes */}
        <Route path="/services" element={<Services />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/metrics" element={<Metrics />} />

        {/* Operations Admin Routes */}
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/inventory" element={<Inventory />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
