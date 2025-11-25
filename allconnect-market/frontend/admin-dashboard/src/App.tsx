import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './views/components/AdminLayout';
import { ProtectedRoute } from './views/components/ProtectedRoute';
import { Login } from './views/pages/Login';
import { DashboardNegocio } from './views/pages/DashboardNegocio';
import { DashboardContenido } from './views/pages/DashboardContenido';
import { DashboardIT } from './views/pages/DashboardIT';
import { DashboardOperaciones } from './views/pages/DashboardOperaciones';
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
        <Route path="/orders" element={<DashboardNegocio />} />
        <Route path="/products" element={<DashboardNegocio />} />
        <Route path="/customers" element={<DashboardNegocio />} />
        <Route path="/reports" element={<DashboardNegocio />} />

        {/* Content Admin Routes */}
        <Route path="/content" element={<DashboardContenido />} />
        <Route path="/promotions" element={<DashboardContenido />} />
        <Route path="/categories" element={<DashboardContenido />} />

        {/* IT Admin Routes */}
        <Route path="/services" element={<DashboardIT />} />
        <Route path="/integrations" element={<DashboardIT />} />
        <Route path="/logs" element={<DashboardIT />} />
        <Route path="/metrics" element={<DashboardIT />} />

        {/* Operations Admin Routes */}
        <Route path="/shipping" element={<DashboardOperaciones />} />
        <Route path="/inventory" element={<DashboardOperaciones />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
