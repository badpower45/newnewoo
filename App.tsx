import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import CustomerChatPage from './pages/CustomerChatPage';
import CustomerServiceDashboard from './pages/CustomerServiceDashboard';
import MagazinePage from './pages/MagazinePage';
import HotDealsPage from './pages/HotDealsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TrackOrderPage from './pages/TrackOrderPage';
import DeliveryPolicyPage from './pages/DeliveryPolicyPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import FAQPage from './pages/FAQPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ProductsManager from './pages/admin/ProductsManager';
import ProductUploadPage from './pages/admin/ProductUploadPage';
import ProductImporter from './pages/admin/ProductImporter';
import OrdersManager from './pages/admin/OrdersManager';
import EmployeesManager from './pages/admin/EmployeesManager';
import LiveChatDashboard from './pages/admin/LiveChatDashboard';
import BranchesManager from './pages/admin/BranchesManager';
import BranchInventory from './pages/admin/BranchInventory';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import OrderDistributorPage from './pages/admin/OrderDistributorPage';
import DeliveryStaffManager from './pages/admin/DeliveryStaffManager';
import DeliverySlotsManager from './pages/admin/DeliverySlotsManager';
import CouponsManager from './pages/admin/CouponsManager';
import MagazineManager from './pages/admin/MagazineManager';
import HotDealsManager from './pages/admin/HotDealsManager';
import AdminHomeSections from './pages/admin/AdminHomeSections';
import StoriesManager from './pages/admin/StoriesManager';
import CategoriesManager from './pages/admin/CategoriesManager';
import CategoryBannersManager from './pages/admin/CategoryBannersManager';
import FacebookReelsManager from './pages/admin/FacebookReelsManager';
import BrandOffersAdminPage from './pages/admin/BrandOffersAdminPage';
import DeliveryDriverPage from './pages/DeliveryDriverPage';
import BrandPage from './pages/BrandPage';
import BrandsPage from './pages/BrandsPage';
import MyOrdersPage from './pages/MyOrdersPage';
import LoyaltyPage from './pages/LoyaltyPage';
import AddressesPage from './pages/AddressesPage';
import BranchesPage from './pages/BranchesPage';
import SplashScreen from './pages/SplashScreen';

// Premium Brand Pages
import PepsiBrandPage from './pages/brands/PepsiBrandPage';
import NescafeBrandPage from './pages/brands/NescafeBrandPage';
import JuhaynaBrandPage from './pages/brands/JuhaynaBrandPage';

import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider } from './context/LanguageContext';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import { DebugProvider } from './context/DebugLogContext';
import DebugPanel from './components/DebugPanel';
import LottieLoader from './components/LottieLoader';

function AppContent() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [appReady, setAppReady] = React.useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  React.useEffect(() => {
    // Splash screen timing
    const timer = setTimeout(() => {
      setShowSplash(false);
      setAppReady(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
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
            <Route path="/hot-deals" element={<HotDealsPage />} />
            <Route path="/magazine" element={<MagazinePage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/delivery-policy" element={<DeliveryPolicyPage />} />
            <Route path="/return-policy" element={<ReturnPolicyPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
            <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/chat" element={<ProtectedRoute><CustomerChatPage /></ProtectedRoute>} />
            <Route path="/customer-service" element={<ProtectedRoute><CustomerServiceDashboard /></ProtectedRoute>} />
            <Route path="/delivery" element={<ProtectedRoute allowedRoles={['delivery', 'admin']}><DeliveryDriverPage /></ProtectedRoute>} />
            <Route path="/brand/:brandName" element={<BrandPage />} />
            
            {/* Premium Brand Pages - Each with unique design */}
            <Route path="/brand/pepsi" element={<PepsiBrandPage />} />
            <Route path="/brand/nescafe" element={<NescafeBrandPage />} />
            <Route path="/brand/juhayna" element={<JuhaynaBrandPage />} />

            {/* Admin Routes - Protected with role-based access */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'distributor']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<DashboardOverview />} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="product-importer" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ProductImporter /></ProtectedRoute>} />
              <Route path="categories" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CategoriesManager /></ProtectedRoute>} />
              <Route path="category-banners" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CategoryBannersManager /></ProtectedRoute>} />
              <Route path="upload" element={<ProductUploadPage />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="branches" element={<BranchesManager />} />
              <Route path="inventory" element={<BranchInventory />} />
              <Route path="slots" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DeliverySlotsManager /></ProtectedRoute>} />
              <Route path="coupons" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CouponsManager /></ProtectedRoute>} />
              <Route path="magazine" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><MagazineManager /></ProtectedRoute>} />
              <Route path="hot-deals" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><HotDealsManager /></ProtectedRoute>} />
              <Route path="home-sections" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminHomeSections /></ProtectedRoute>} />
              <Route path="stories" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><StoriesManager /></ProtectedRoute>} />
              <Route path="facebook-reels" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><FacebookReelsManager /></ProtectedRoute>} />
              <Route path="brand-offers" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><BrandOffersAdminPage /></ProtectedRoute>} />
              <Route path="employees" element={<ProtectedRoute requireAdmin><EmployeesManager /></ProtectedRoute>} />
              <Route path="chat" element={<ProtectedRoute requireAdmin><LiveChatDashboard /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute requireAdmin><AdminSettingsPage /></ProtectedRoute>} />
              <Route path="distribution" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'distributor']}><OrderDistributorPage /></ProtectedRoute>} />
              <Route path="delivery-staff" element={<DeliveryStaffManager />} />
            </Route>
          </Routes>
        </div>
      </main>
      {!isAdminRoute && appReady && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}
        {/* Debug panel is always available */}
        <DebugPanel />
      </div>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}

export default App;
