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

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

import DealsPage from './pages/DealsPage';
import MorePage from './pages/MorePage';

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 font-sans text-slate-900 relative flex flex-col">
          <main className="flex-grow pb-16 md:pb-0">
            <div className="max-w-7xl mx-auto w-full">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/more" element={<MorePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
              </Routes>
            </div>
          </main>
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
