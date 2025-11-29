import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CategoriesPage from './pages/CategoriesPage';
import BottomNav from './components/BottomNav';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { BranchProvider } from './context/BranchContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

import DealsPage from './pages/DealsPage';
import MorePage from './pages/MorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ProductsManager from './pages/admin/ProductsManager';
import ProductUploadPage from './pages/admin/ProductUploadPage';
import OrdersManager from './pages/admin/OrdersManager';
import EmployeesManager from './pages/admin/EmployeesManager';
import LiveChatDashboard from './pages/admin/LiveChatDashboard';
import BranchesManager from './pages/admin/BranchesManager';
import BranchInventory from './pages/admin/BranchInventory';
import DeliverySlotsManager from './pages/admin/DeliverySlotsManager';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

import { FavoritesProvider } from './context/FavoritesContext';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import { DebugProvider } from './context/DebugLogContext';
import DebugPanel from './components/DebugPanel';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 relative flex flex-col">
      <main className={`flex-grow ${!isAdminRoute ? 'pb-16 md:pb-0' : ''}`}>
        <div className={!isAdminRoute ? "max-w-7xl mx-auto w-full" : "w-full"}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/orders/:orderId" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/favorites" element={<FavoritesPage />} />

            {/* Admin Routes (temporarily unprotected) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="upload" element={<ProductUploadPage />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="branches" element={<BranchesManager />} />
              <Route path="inventory" element={<BranchInventory />} />
              <Route path="slots" element={<DeliverySlotsManager />} />
              <Route path="employees" element={<EmployeesManager />} />
              <Route path="chat" element={<LiveChatDashboard />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </div>
      </main>
      {!isAdminRoute && (
        <>
          <Footer />
          <div className="md:hidden">
            <BottomNav />
          </div>
          <ChatWidget />
        </>
      )}
      {/* Debug panel is always available */}
      <DebugPanel />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BranchProvider>
        <FavoritesProvider>
          <CartProvider>
            <DebugProvider>
              <Router>
                <ScrollToTop />
                <AppContent />
              </Router>
            </DebugProvider>
          </CartProvider>
        </FavoritesProvider>
      </BranchProvider>
    </AuthProvider>
  );
}

export default App;
