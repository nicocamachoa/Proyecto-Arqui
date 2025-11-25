import { Routes, Route } from 'react-router-dom';
import { Layout } from './views/components/Layout';
import { ProtectedRoute } from './views/components/ProtectedRoute';
import { Home } from './views/pages/Home';
import { Login } from './views/pages/Login';
import { Register } from './views/pages/Register';
import { Catalog } from './views/pages/Catalog';
import { ProductDetail } from './views/pages/ProductDetail';
import { Cart } from './views/pages/Cart';
import { Checkout } from './views/pages/Checkout';
import { MyOrders } from './views/pages/MyOrders';
import { MyBookings } from './views/pages/MyBookings';
import { MySubscriptions } from './views/pages/MySubscriptions';
import { Profile } from './views/pages/Profile';

function App() {
  return (
    <Routes>
      {/* Public routes without layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes with main layout */}
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Protected routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-subscriptions"
          element={
            <ProtectedRoute>
              <MySubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
