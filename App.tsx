import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { BranchProvider } from './context/BranchContext';
import { useAuth } from './context/AuthContext';
import { useBranch } from './context/BranchContext';
import { useLanguage } from './context/LanguageContext';
import FullPageSkeleton from './components/FullPageSkeleton';
import { registerImageCacheServiceWorker } from './utils/imageCacheSW';

/**
 * lazyWithRetry – wraps React.lazy() with automatic page reload when a
 * chunk fails to load (stale hash after a new deployment).
 * Prevents "Importing a module script failed" errors in production.
 */
const lazyWithRetry = (factory: () => Promise<{ default: React.ComponentType<any> }>) =>
  lazy(() =>
    factory().catch((err) => {
      // Only reload once to avoid infinite loops
      const reloadKey = 'chunk_reload_' + btoa(String(factory)).slice(0, 16);
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        window.location.reload();
        // Return a never-resolving promise (reload will happen)
        return new Promise<{ default: React.ComponentType<any> }>(() => {});
      }
      throw err;
    })
  );

// Lazy load all pages for better code splitting
const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const ProductsPage = lazyWithRetry(() => import('./pages/ProductsPage'));
const ProductDetailsPage = lazyWithRetry(() => import('./pages/ProductDetailsPage'));
const CartPage = lazyWithRetry(() => import('./pages/CartPage'));
const CheckoutPage = lazyWithRetry(() => import('./pages/CheckoutPage'));
const CategoriesPage = lazyWithRetry(() => import('./pages/CategoriesPage'));
const DealsPage = lazyWithRetry(() => import('./pages/DealsPage'));
const MorePage = lazyWithRetry(() => import('./pages/MorePage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const FavoritesPage = lazyWithRetry(() => import('./pages/FavoritesPage'));
const OrderConfirmationPage = lazyWithRetry(() => import('./pages/OrderConfirmationPage'));
const OrderTrackingPage = lazyWithRetry(() => import('./pages/OrderTrackingPage'));
const OrderInvoice = lazyWithRetry(() => import('./components/OrderInvoice'));
const CustomerChatPage = lazyWithRetry(() => import('./pages/CustomerChatPage'));
const CustomerServiceDashboard = lazyWithRetry(() => import('./pages/CustomerServiceDashboard'));
const MagazinePage = lazyWithRetry(() => import('./pages/MagazinePage'));
const SpecialOffersPage = lazyWithRetry(() => import('./pages/SpecialOffersPage'));
const HotDealsPage = lazyWithRetry(() => import('./pages/HotDealsPage'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/ResetPasswordPage'));
const TrackOrderPage = lazyWithRetry(() => import('./pages/TrackOrderPage'));
const DeliveryPolicyPage = lazyWithRetry(() => import('./pages/DeliveryPolicyPage'));
const SmartReturnsPage = lazyWithRetry(() => import('./pages/SmartReturnsPage'));
const ReturnPolicyPage = lazyWithRetry(() => import('./pages/ReturnPolicyPage'));
const FAQPage = lazyWithRetry(() => import('./pages/FAQPage'));
const PrivacyPolicyPage = lazyWithRetry(() => import('./pages/PrivacyPolicyPage'));
const GeneralFAQPage = lazyWithRetry(() => import('./pages/GeneralFAQPage'));
const AuthCallbackPage = lazyWithRetry(() => import('./pages/AuthCallbackPage'));
const PaymentCallbackPage = lazyWithRetry(() => import('./pages/PaymentCallbackPage'));
const VerifyEmailPage = lazyWithRetry(() => import('./pages/VerifyEmailPage'));
const EmailVerificationPending = lazyWithRetry(() => import('./pages/EmailVerificationPending'));
const EmailVerificationSuccess = lazyWithRetry(() => import('./pages/EmailVerificationSuccess'));
const CompleteProfilePage = lazyWithRetry(() => import('./pages/CompleteProfilePage'));

// Admin pages - lazy loaded separately
const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout'));
const DashboardOverview = lazyWithRetry(() => import('./pages/admin/DashboardOverview'));
const ProductsManager = lazyWithRetry(() => import('./pages/admin/ProductsManager'));
const ProductUploadPage = lazyWithRetry(() => import('./pages/admin/ProductUploadPage'));
const ProductImporter = lazyWithRetry(() => import('./pages/admin/ProductImporter'));
const DraftProductsReview = lazyWithRetry(() => import('./pages/admin/DraftProductsReview'));
const OrdersManager = lazyWithRetry(() => import('./pages/admin/OrdersManager'));
const EmployeesManager = lazyWithRetry(() => import('./pages/admin/EmployeesManager'));
const LiveChatDashboard = lazyWithRetry(() => import('./pages/admin/LiveChatDashboard'));
const BranchesManager = lazyWithRetry(() => import('./pages/admin/BranchesManager'));
const InventoryDashboard = lazyWithRetry(() => import('./pages/admin/InventoryDashboard'));
const AdminInventoryDashboard = lazyWithRetry(() => import('./pages/admin/InventoryDashboard'));
const OrderDistributorPage = lazyWithRetry(() => import('./pages/admin/OrderDistributorPage'));
const DeliveryStaffManager = lazyWithRetry(() => import('./pages/admin/DeliveryStaffManager'));
const CouponsManager = lazyWithRetry(() => import('./pages/admin/CouponsManager'));
const MagazineManager = lazyWithRetry(() => import('./pages/admin/MagazineManager'));
const HotDealsManager = lazyWithRetry(() => import('./pages/admin/HotDealsManager'));
const AdminHomeSections = lazyWithRetry(() => import('./pages/admin/AdminHomeSections'));
const StoriesManager = lazyWithRetry(() => import('./pages/admin/StoriesManager'));
const CategoriesManager = lazyWithRetry(() => import('./pages/admin/CategoriesManager'));
const CategoryBannersManager = lazyWithRetry(() => import('./pages/admin/CategoryBannersManager'));
const FacebookReelsManager = lazyWithRetry(() => import('./pages/admin/FacebookReelsManager'));
const ProductFramesManager = lazyWithRetry(() => import('./pages/admin/ProductFramesManager'));
const BrandOffersAdminPage = lazyWithRetry(() => import('./pages/admin/BrandOffersAdminPage'));
const BrandsManager = lazyWithRetry(() => import('./pages/admin/BrandsManager'));
const HeroSectionsManager = lazyWithRetry(() => import('./pages/admin/HeroSectionsManager'));
const ReturnsManager = lazyWithRetry(() => import('./pages/admin/ReturnsManager'));
const DeliveryFeesManager = lazyWithRetry(() => import('./pages/admin/DeliveryFeesManager'));
const PopupsManager = lazyWithRetry(() => import('./pages/admin/PopupsManager'));
const DeliveryTrackingPage = lazyWithRetry(() => import('./pages/admin/DeliveryTrackingPage'));
const DeliveryDriverPage = lazyWithRetry(() => import('./pages/DeliveryDriverPage'));
const BrandPage = lazyWithRetry(() => import('./pages/BrandPage'));
const BrandsPage = lazyWithRetry(() => import('./pages/BrandsPage'));
const MyOrdersPage = lazyWithRetry(() => import('./pages/MyOrdersPage'));
const LoyaltyPage = lazyWithRetry(() => import('./pages/LoyaltyPage'));
const LoyaltyBarcodePage = lazyWithRetry(() => import('./pages/LoyaltyBarcodePage'));
const DiscountCodesPage = lazyWithRetry(() => import('./pages/DiscountCodesPage'));
const AddressesPage = lazyWithRetry(() => import('./pages/AddressesPage'));
const BranchesPage = lazyWithRetry(() => import('./pages/BranchesPage'));
const BranchMapPage = lazyWithRetry(() => import('./pages/BranchMapPage'));
const AdminDeliveryMapPage = lazyWithRetry(() => import('./pages/admin/DeliveryMapPage'));

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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
  const { language } = useLanguage();

  // 🔥 Register Image Cache Service Worker
  useEffect(() => {
    registerImageCacheServiceWorker();
  }, []);

  // Re-initialize & re-trigger Google Translate on every route change (SPA navigation)
  useEffect(() => {
    if (language !== 'en') return;

    const hideBanner = () => {
      document.querySelectorAll<HTMLElement>(
        '.goog-te-banner-frame, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame, .goog-te-spinner-pos'
      ).forEach(el => {
        el.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;';
      });
      document.body.style.top = '0px';
    };

    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const pollAndTranslate = () => {
      let attempts = 0;
      pollInterval = setInterval(() => {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo) {
          clearInterval(pollInterval!);
          pollInterval = null;
          // Set cookie to ensure GT knows target language
          document.cookie = 'googtrans=/ar/en; path=/';
          document.cookie = `googtrans=/ar/en; path=/; domain=${window.location.hostname}`;
          combo.value = 'en';
          combo.dispatchEvent(new Event('change', { bubbles: true }));
          setTimeout(hideBanner, 800);
          setTimeout(hideBanner, 2000);
        }
        if (++attempts > 25) {
          clearInterval(pollInterval!);
          pollInterval = null;
        }
      }, 300);
    };

    // Wait for React to finish rendering new page, then re-init GT from scratch
    const timer = setTimeout(() => {
      const win = window as any;
      if (win.reInitGoogleTranslate && win.reInitGoogleTranslate()) {
        // GT re-initialized — poll for the new combo
        pollAndTranslate();
      } else {
        // Fallback: GT script not ready yet, just poll existing combo
        pollAndTranslate();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [location.pathname, language]);
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
          <main className={`flex-grow ${!hideBottomNav ? 'pb-20 md:pb-0' : ''}`}>
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
            <Route path="/discount-codes" element={<DiscountCodesPage />} />
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
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
