import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Layout } from './components/Layout.tsx';

// Pages
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { Marketplace } from './pages/customer/Marketplace.tsx';
import { Cart } from './pages/customer/Cart.tsx';
import { Orders } from './pages/customer/Orders.tsx';
import { Dashboard } from './pages/admin/Dashboard.tsx';
import { Products } from './pages/admin/Products.tsx';
import { AdminOrders } from './pages/admin/AdminOrders.tsx';
import { UserRole } from './types.ts';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== UserRole.ADMIN) return <Navigate to="/marketplace" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Customer Routes */}
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><Products /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />

            {/* Redirect Root */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </HashRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;