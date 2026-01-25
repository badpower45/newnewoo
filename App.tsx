import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { CartProvider } from './context/CartContext';
import { analyticsService } from './services/analyticsService';
import { AuthProvider } from './context/AuthContext';
import { BranchProvider } from './context/BranchContext';
import { useAuth } from './context/AuthContext';
import { useBranch } from './context/BranchContext';
import FullPageSkeleton from './components/FullPageSkeleton';

// Lazy load all pages for better code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const MorePage = lazy(() => import('./pages/MorePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const OrderInvoice = lazy(() => import('./components/OrderInvoice'));
const CustomerChatPage = lazy(() => import('./pages/CustomerChatPage'));
const CustomerServiceDashboard = lazy(() => import('./pages/CustomerServiceDashboard'));
const MagazinePage = lazy(() => import('./pages/MagazinePage'));
const SpecialOffersPage = lazy(() => import('./pages/SpecialOffersPage'));
const HotDealsPage = lazy(() => import('./pages/HotDealsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const DeliveryPolicyPage = lazy(() => import('./pages/DeliveryPolicyPage'));
const SmartReturnsPage = lazy(() => import('./pages/SmartReturnsPage'));
const ReturnPolicyPage = lazy(() => import('./pages/ReturnPolicyPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const GeneralFAQPage = lazy(() => import('./pages/GeneralFAQPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const EmailVerificationPending = lazy(() => import('./pages/EmailVerificationPending'));
const EmailVerificationSuccess = lazy(() => import('./pages/EmailVerificationSuccess'));
const CompleteProfilePage = lazy(() => import('./pages/CompleteProfilePage'));

// Admin pages - lazy loaded separately
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const DashboardOverview = lazy(() => import('./pages/admin/DashboardOverview'));
const CustomerAnalyticsPage = lazy(() => import('./pages/admin/CustomerAnalyticsPage'));
const ProductsManager = lazy(() => import('./pages/admin/ProductsManager'));
const ProductUploadPage = lazy(() => import('./pages/admin/ProductUploadPage'));
const ProductImporter = lazy(() => import('./pages/admin/ProductImporter'));
const DraftProductsReview = lazy(() => import('./pages/admin/DraftProductsReview'));
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'));
const EmployeesManager = lazy(() => import('./pages/admin/EmployeesManager'));
const LiveChatDashboard = lazy(() => import('./pages/admin/LiveChatDashboard'));
const BranchesManager = lazy(() => import('./pages/admin/BranchesManager'));
const InventoryDashboard = lazy(() => import('./pages/admin/InventoryDashboard'));
const AdminInventoryDashboard = lazy(() => import('./src/pages/AdminInventoryDashboard'));
const OrderDistributorPage = lazy(() => import('./pages/admin/OrderDistributorPage'));
const DeliveryStaffManager = lazy(() => import('./pages/admin/DeliveryStaffManager'));
const CouponsManager = lazy(() => import('./pages/admin/CouponsManager'));
const MagazineManager = lazy(() => import('./pages/admin/MagazineManager'));
const HotDealsManager = lazy(() => import('./pages/admin/HotDealsManager'));
const AdminHomeSections = lazy(() => import('./pages/admin/AdminHomeSections'));
const StoriesManager = lazy(() => import('./pages/admin/StoriesManager'));
const CategoriesManager = lazy(() => import('./pages/admin/CategoriesManager'));
const CategoryBannersManager = lazy(() => import('./pages/admin/CategoryBannersManager'));
const FacebookReelsManager = lazy(() => import('./pages/admin/FacebookReelsManager'));
const ProductFramesManager = lazy(() => import('./pages/admin/ProductFramesManager'));
const BrandOffersAdminPage = lazy(() => import('./pages/admin/BrandOffersAdminPage'));
const BrandsManager = lazy(() => import('./pages/admin/BrandsManager'));
const HeroSectionsManager = lazy(() => import('./pages/admin/HeroSectionsManager'));
const ReturnsManager = lazy(() => import('./pages/admin/ReturnsManager'));
const DeliveryFeesManager = lazy(() => import('./pages/admin/DeliveryFeesManager'));
const PopupsManager = lazy(() => import('./pages/admin/PopupsManager'));
const DeliveryTrackingPage = lazy(() => import('./pages/admin/DeliveryTrackingPage'));
const DeliveryDriverPage = lazy(() => import('./pages/DeliveryDriverPage'));
const BrandPage = lazy(() => import('./pages/BrandPage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const LoyaltyPage = lazy(() => import('./pages/LoyaltyPage'));
const LoyaltyBarcodePage = lazy(() => import('./pages/LoyaltyBarcodePage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const BranchMapPage = lazy(() => import('./pages/BranchMapPage'));
const AdminDeliveryMapPage = lazy(() => import('./pages/admin/DeliveryMapPage'));

import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import PhoneNumberGuard from './components/PhoneNumberGuard';
import { DebugProvider } from './context/DebugLogContext';
import DebugPanel from './components/DebugPanel';
import SplashScreen from './pages/SplashScreen';
import CartErrorBoundary from './components/CartErrorBoundary';
import BlockedUserGuard from './components/BlockedUserGuard';
import Seo, { getSiteUrl } from './components/Seo';

// Loading component for lazy routes
const RouteLoader = () => <FullPageSkeleton />;

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [appReady, setAppReady] = React.useState(false);
  const location = useLocation();
  const path = location.pathname;
  const { user } = useAuth();
  const isAdminRoute = path.startsWith('/admin');
  const isChatPage = path === '/chat';
  const isEmployeeRoute = ['/customer-service', '/delivery', '/smart-returns'].some(route =>
    path.startsWith(route)
  );
  const hideBottomNav = isAdminRoute || isEmployeeRoute || isChatPage;
  const canonicalUrl = `${getSiteUrl()}${path}${location.search}`;
  const { loading: authLoading } = useAuth();
  const { loading: branchLoading } = useBranch();
  const globalLoading = authLoading || branchLoading;

  // Track page views
  React.useEffect(() => {
    if (!showSplash && appReady) {
      analyticsService.trackPageView({
        page_path: path,
        page_title: document.title,
        user_id: user?.id
      });
    }
  }, [path, showSplash, appReady, user]);

  // Setup beforeunload tracking
  React.useEffect(() => {
    analyticsService.setupBeforeUnload();
  }, []);

  // Show splash screen on first load
  if (showSplash) {
    return (
      <>
        <Seo url={canonicalUrl} />
        <SplashScreen
          duration={2600}
          onComplete={() => {
            setShowSplash(false);
            setAppReady(true);
          }}
        />
      </>
    );
  }

  if (globalLoading) {
    return <FullPageSkeleton />;
  }

  return (
    <>
      <Seo url={canonicalUrl} />
      <BlockedUserGuard>
        <div className="min-h-screen bg-gray-50 font-sans text-slate-900 relative flex flex-col">
          <main className={`flex-grow ${!hideBottomNav ? 'pb-16 md:pb-0' : ''}`}>
          <div className={!isAdminRoute ? "max-w-7xl mx-auto w-full" : "w-full"}>
            <PhoneNumberGuard>
              <Suspense fallback={<RouteLoader />}>
                <Routes>
                <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartErrorBoundary><CartPage /></CartErrorBoundary>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/order-invoice/:orderId" element={<ProtectedRoute><OrderInvoice /></ProtectedRoute>} />
            <Route path="/orders/:orderId" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/hot-deals" element={<HotDealsPage />} />
            <Route path="/magazine" element={<MagazinePage />} />
            <Route path="/special-offers" element={<SpecialOffersPage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/payment/callback" element={<PaymentCallbackPage />} />
            <Route path="/verify-email" element={<EmailVerificationSuccess />} />
            <Route path="/email-verification-pending" element={<EmailVerificationPending />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/smart-returns" element={<SmartReturnsPage />} />
            <Route path="/delivery-policy" element={<DeliveryPolicyPage />} />
            <Route path="/return-policy" element={<ReturnPolicyPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/general-faq" element={<GeneralFAQPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
            <Route path="/loyalty-barcode" element={<ProtectedRoute><LoyaltyBarcodePage /></ProtectedRoute>} />
            <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/branch-map" element={<BranchMapPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/chat" element={<ProtectedRoute><CustomerChatPage /></ProtectedRoute>} />
            <Route path="/customer-service" element={<ProtectedRoute><CustomerServiceDashboard /></ProtectedRoute>} />
            <Route path="/delivery" element={<ProtectedRoute allowedRoles={['delivery', 'admin']}><DeliveryDriverPage /></ProtectedRoute>} />
            
            {/* All Brand Pages use unified BrandPage component */}
            <Route path="/brand/:brandName" element={<BrandPage />} />

            {/* Admin Routes - Protected with role-based access */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'distributor']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<DashboardOverview />} />
              <Route path="analytics" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CustomerAnalyticsPage /></ProtectedRoute>} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="product-importer" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ProductImporter /></ProtectedRoute>} />
              <Route path="returns" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ReturnsManager /></ProtectedRoute>} />
              <Route path="import" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ProductImporter /></ProtectedRoute>} />
              <Route path="drafts/:batchId?" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DraftProductsReview /></ProtectedRoute>} />
              <Route path="categories" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CategoriesManager /></ProtectedRoute>} />
              <Route path="category-banners" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CategoryBannersManager /></ProtectedRoute>} />
              <Route path="product-frames" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ProductFramesManager /></ProtectedRoute>} />
              <Route path="upload" element={<ProductUploadPage />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="branches" element={<BranchesManager />} />
              <Route path="delivery-fees" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><DeliveryFeesManager /></ProtectedRoute>} />
              <Route path="inventory" element={<InventoryDashboard />} />
              <Route path="inventory-analytics" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminInventoryDashboard /></ProtectedRoute>} />
              <Route path="coupons" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CouponsManager /></ProtectedRoute>} />
              <Route path="magazine" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><MagazineManager /></ProtectedRoute>} />
              <Route path="hot-deals" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><HotDealsManager /></ProtectedRoute>} />
              <Route path="home-sections" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminHomeSections /></ProtectedRoute>} />
              <Route path="hero-sections" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><HeroSectionsManager /></ProtectedRoute>} />
              <Route path="popups" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PopupsManager /></ProtectedRoute>} />
              <Route path="stories" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><StoriesManager /></ProtectedRoute>} />
              <Route path="facebook-reels" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><FacebookReelsManager /></ProtectedRoute>} />
              <Route path="brand-offers" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><BrandOffersAdminPage /></ProtectedRoute>} />
              <Route path="brands" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><BrandsManager /></ProtectedRoute>} />
              <Route path="employees" element={<ProtectedRoute requireAdmin><EmployeesManager /></ProtectedRoute>} />
              <Route path="chat" element={<ProtectedRoute requireAdmin><LiveChatDashboard /></ProtectedRoute>} />
              <Route path="distribution" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'distributor']}><OrderDistributorPage /></ProtectedRoute>} />
              <Route path="delivery-tracking" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'distributor']}><DeliveryTrackingPage /></ProtectedRoute>} />
              <Route path="delivery-staff" element={<DeliveryStaffManager />} />
              <Route path="delivery-map" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminDeliveryMapPage /></ProtectedRoute>} />
            </Route>
          </Routes>
          </Suspense>
          </PhoneNumberGuard>
        </div>
      </main>
      {!hideBottomNav && appReady && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}
        {/* Debug panel - Only in development */}
        {import.meta.env.DEV && <DebugPanel />}
      </div>
      </BlockedUserGuard>
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
