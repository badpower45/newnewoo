import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
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

import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ProductsManager from './pages/admin/ProductsManager';
import ProductUploadPage from './pages/admin/ProductUploadPage';
import OrdersManager from './pages/admin/OrdersManager';
import EmployeesManager from './pages/admin/EmployeesManager';
import LiveChatDashboard from './pages/admin/LiveChatDashboard';

import { FavoritesProvider } from './context/FavoritesContext';
import ChatWidget from './components/ChatWidget';

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
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="upload" element={<ProductUploadPage />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="employees" element={<EmployeesManager />} />
              <Route path="chat" element={<LiveChatDashboard />} />
              <Route path="settings" element={<div>Settings Page</div>} />
            </Route>
          </Routes>
        </div>
      </main>
      {!isAdminRoute && (
        <>
          <div className="md:hidden">
            <BottomNav />
          </div>
          <ChatWidget />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
