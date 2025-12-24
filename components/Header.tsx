import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, User, Heart, MapPin, Sparkles, X, ChevronLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS } from '../constants';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import BranchSelector from './BranchSelector';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBranchSelectorOpen, setIsBranchSelectorOpen] = useState(false);
  const { totalItems, totalPrice } = useCart();
  const { selectedBranch } = useBranch();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 font-header ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4'}`}>
      {/* Top Utility Bar */}
      <div className="hidden md:flex justify-between items-center container mx-auto px-6 text-xs text-slate-500 mb-2 border-b border-slate-100 pb-2 font-body">
        <div className="flex items-center space-x-4 space-x-reverse">
          <span className="flex items-center hover:text-brand-orange cursor-pointer transition-colors">
            <Clock size={14} className="ml-1 text-brand-orange" />
            <span className="font-bold text-brand-brown">مفتوح 24 ساعة</span>
          </span>
          <span 
            onClick={() => setIsBranchSelectorOpen(true)}
            className="flex items-center hover:text-brand-orange cursor-pointer transition-colors"
          >
            <MapPin size={14} className="ml-1" />
            التوصيل إلى: <span className="font-semibold mr-1 text-slate-700">{selectedBranch?.address || 'اختر الفرع'}</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <span className="hover:text-brand-orange cursor-pointer transition-colors">الخط الساخن: 19999</span>
          <Link to="/profile?tab=rewards" className="hover:text-brand-orange cursor-pointer transition-colors">مكافآت علوش</Link>
        </div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="flex items-center justify-between gap-8">
          {/* Logo - Aloush Style */}
          <Link to="/" className="flex items-center flex-shrink-0 group cursor-pointer">
            <div className="w-10 h-10 bg-brand-brown rounded-full flex items-center justify-center ml-2 shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform border-2 border-brand-orange">
              <span className="text-white font-bold text-xl">ع</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-brand-brown leading-none">علوش</span>
              <span className="text-[10px] font-bold text-brand-orange tracking-widest uppercase">ماركت</span>
            </div>
          </Link>

          {/* Desktop Navigation & Mega Menu Trigger */}
          <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => item.subCategories && setActiveMegaMenu(item.label)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Link
                  to={item.href.startsWith('#') ? '/' : item.href}
                  className="text-sm font-bold text-slate-700 hover:text-brand-orange flex items-center py-2 transition-colors"
                >
                  {item.label}
                </Link>

                {/* Mega Menu Dropdown */}
                <AnimatePresence>
                  {activeMegaMenu === item.label && item.subCategories && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-[-100px] w-[800px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 grid grid-cols-4 gap-8 mt-2 before:content-[''] before:absolute before:top-[-10px] before:left-0 before:w-full before:h-[10px] before:bg-transparent z-50"
                    >
                      {item.subCategories.map((sub, idx) => (
                        <div key={idx} className="space-y-4">
                          <h4 className="font-bold text-brand-brown text-sm border-b border-brand-orange/20 pb-2">{sub.title}</h4>
                          <ul className="space-y-2">
                            {sub.items.map((link) => (
                              <li key={link}>
                                <Link to="/products" className="text-slate-500 hover:text-brand-orange text-sm block hover:-translate-x-1 transition-transform duration-200 font-medium font-body">
                                  {link}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="col-span-4 mt-4 bg-brand-brown p-4 rounded-xl flex items-center justify-between overflow-hidden relative">
                        <div className="absolute left-0 top-0 w-32 h-32 bg-brand-orange rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10">
                          <p className="font-bold text-white text-lg">رمضان كريم</p>
                          <p className="text-xs text-orange-100 font-body">اطلب كرتونة رمضان دلوقتي توصلك لحد البيت.</p>
                        </div>
                        <button className="relative z-10 text-xs bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-bold">
                          اطلب الآن
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Semantic AI Search Bar - Responsive */}
          <div className="hidden md:flex flex-1 max-w-xl relative group font-body">
            <div className={`flex items-center w-full bg-slate-50 rounded-full px-4 py-2.5 transition-all duration-300 border-2 ${searchQuery ? 'border-brand-orange bg-white shadow-lg' : 'border-slate-200 group-hover:border-brand-orange/50 group-hover:bg-white'}`}>
              <Search className="text-slate-400 w-5 h-5 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="عايز تطبخ إيه النهاردة؟"
                className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery.length > 0 ? (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0"
                  aria-label="مسح البحث"
                >
                  <X size={16} />
                </button>
              ) : (
                <div className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full flex-shrink-0">
                  <Sparkles size={12} className="text-brand-orange" />
                </div>
              )}
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full right-0 w-full bg-white rounded-2xl shadow-xl border border-slate-100 mt-2 p-2 overflow-hidden z-50"
                >
                  <div className="p-2">
                    <p className="text-xs font-semibold text-slate-400 mb-2">مقترحات</p>
                    <Link 
                      to={`/products?search=${encodeURIComponent(searchQuery)}`}
                      className="flex items-center p-2 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => setSearchQuery('')}
                    >
                      <Search size={14} className="text-brand-orange ml-2" />
                      <span className="text-sm text-slate-700">بحث عن <span className="font-bold">"{searchQuery}"</span></span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Search Icon - Opens search bar */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-slate-700 p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="فتح البحث"
          >
            <Search size={22} />
          </button>

          {/* Right Actions - Mobile Optimized */}
          <div className="flex items-center space-x-3 md:space-x-6 space-x-reverse">
            {/* Login - Hidden on mobile, shown on tablet+ */}
            <Link to="/login" className="hidden md:flex flex-col items-start cursor-pointer group">
              <span className="text-xs text-slate-500 font-body">أهلاً بك</span>
              <span className="text-sm font-bold text-slate-700 group-hover:text-brand-orange flex items-center transition-colors">
                تسجيل دخول <User size={14} className="mr-1" />
              </span>
            </Link>
            
            {/* Favorites - Larger touch target */}
            <Link to="/favorites" className="relative text-slate-700 hover:text-brand-orange transition-colors p-2 -m-2">
              <Heart size={22} className="md:w-6 md:h-6" />
            </Link>
            
            {/* Cart - Mobile optimized */}
            <Link to="/cart" className="relative text-brand-brown hover:text-brand-orange transition-colors flex items-center p-2 -m-2 min-h-[44px]">
              <div className="relative">
                <ShoppingCart size={22} className="md:w-6 md:h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-brand-orange rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-white px-1">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden xl:block mr-2 font-bold text-sm whitespace-nowrap">{totalPrice.toFixed(0)} ج.م</span>
            </Link>
            
            {/* Mobile Menu Toggle - Larger touch target */}
            <button
              className="lg:hidden text-slate-700 p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="فتح القائمة"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu with Animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 top-[80px]"
            />
            
            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-[80px] right-0 w-[85%] max-w-sm bg-white shadow-2xl z-50 h-[calc(100vh-80px)] overflow-y-auto"
            >
              <div className="p-6 space-y-6 font-header">
                {/* Mobile Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن منتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-orange focus:bg-white outline-none transition-all text-sm"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  {searchQuery && (
                    <Link
                      to={`/products?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setSearchQuery('');
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-orange text-white text-xs rounded-lg font-bold"
                    >
                      بحث
                    </Link>
                  )}
                </div>

                {/* User Section */}
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-brown to-brand-orange rounded-xl text-white"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold">تسجيل الدخول</p>
                    <p className="text-xs opacity-90">احصل على نقاط ومكافآت</p>
                  </div>
                </Link>

                {/* Branch Selector */}
                <button
                  onClick={() => {
                    setIsBranchSelectorOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <MapPin size={20} className="text-brand-orange" />
                  <div className="flex-1 text-right">
                    <p className="text-xs text-slate-500">التوصيل إلى</p>
                    <p className="font-bold text-sm text-slate-700">{selectedBranch?.address || 'اختر الفرع'}</p>
                  </div>
                </button>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {NAV_ITEMS.map(item => (
                    <Link 
                      key={item.label} 
                      to={item.href.startsWith('#') ? '/' : item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-4 hover:bg-orange-50 rounded-xl transition-colors group"
                    >
                      <span className="text-lg font-bold text-slate-700 group-hover:text-brand-orange">
                        {item.label}
                      </span>
                      <ChevronLeft size={20} className="text-slate-400 group-hover:text-brand-orange group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </nav>

                {/* Quick Links */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <Link 
                    to="/profile?tab=rewards"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-slate-600 hover:text-brand-orange transition-colors"
                  >
                    <Sparkles size={18} />
                    <span>مكافآت علوش</span>
                  </Link>
                  <a 
                    href="tel:19999"
                    className="flex items-center gap-3 p-3 text-slate-600 hover:text-brand-orange transition-colors"
                  >
                    <Clock size={18} />
                    <span>الخط الساخن: 19999</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Branch Selector Modal */}
      <BranchSelector 
        isOpen={isBranchSelectorOpen} 
        onClose={() => setIsBranchSelectorOpen(false)} 
      />
    </header>
  );
}