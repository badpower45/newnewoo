import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu, User, Heart, MapPin, Sparkles, X, ChevronLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS } from '../constants';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, totalPrice } = useCart();

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
          <span className="flex items-center hover:text-brand-orange cursor-pointer transition-colors">
            <MapPin size={14} className="ml-1" />
            التوصيل إلى: <span className="font-semibold mr-1 text-slate-700">وسط البلد، القاهرة</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <span className="hover:text-brand-orange cursor-pointer transition-colors">الخط الساخن: 19999</span>
          <span className="hover:text-brand-orange cursor-pointer transition-colors">مكافآت علوش</span>
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

          {/* Semantic AI Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative group font-body">
            <div className={`flex items-center w-full bg-slate-50 rounded-full px-4 py-2.5 transition-all duration-300 border-2 ${searchQuery ? 'border-brand-orange bg-white shadow-lg' : 'border-slate-200 group-hover:border-brand-orange/50 group-hover:bg-white'}`}>
              <Search className="text-slate-400 w-5 h-5 ml-3" />
              <input
                type="text"
                placeholder="عايز تطبخ إيه النهاردة؟ رز، لحمة، زيت..."
                className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery.length > 0 ? (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              ) : (
                <div className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full">
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
                    <div className="flex items-center p-2 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors">
                      <Search size={14} className="text-brand-orange ml-2" />
                      <span className="text-sm text-slate-700">بحث عن <span className="font-bold">"{searchQuery}"</span></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-6 space-x-reverse">
            <div className="hidden md:flex flex-col items-start cursor-pointer group">
              <span className="text-xs text-slate-500 font-body">أهلاً بك</span>
              <span className="text-sm font-bold text-slate-700 group-hover:text-brand-orange flex items-center transition-colors">
                تسجيل دخول <User size={14} className="mr-1" />
              </span>
            </div>
            <button className="relative text-slate-700 hover:text-brand-orange transition-colors">
              <Heart size={24} />
              {/* Badge */}
            </button>
            <Link to="/cart" className="relative text-brand-brown hover:text-brand-orange transition-colors flex items-center">
              <div className="relative">
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange rounded-full text-[10px] flex items-center justify-center text-white font-bold border border-white">{totalItems}</span>
                )}
              </div>
              <span className="hidden xl:block mr-2 font-bold text-sm">{totalPrice} ج.م</span>
            </Link>
            <button
              className="lg:hidden text-slate-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full right-0 w-full bg-white border-t border-slate-100 shadow-xl p-4 flex flex-col space-y-4 h-screen z-40 font-header">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} to={item.href.startsWith('#') ? '/' : item.href} className="text-lg font-medium text-brand-brown py-2 border-b border-slate-50 flex justify-between items-center">
              {item.label}
              <ChevronLeft size={16} className="text-brand-orange" />
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}