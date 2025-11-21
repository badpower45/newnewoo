
import React from 'react';
import Header from './components/Header';
import HeroBento from './components/HeroBento';
import ProductCard from './components/ProductCard';
import PromoBanner from './components/PromoBanner';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import StickyPromoSection from './components/StickyPromoSection';
import ReelsSection from './components/ReelsSection';
import { FRESH_PRODUCTS, PANTRY_PRODUCTS, SNACK_PRODUCTS, PROMO_BANNERS } from './constants';
import { ArrowLeft, Sparkles, Clock, SearchCheck } from 'lucide-react';

function SectionHeader({ title, linkText = "عرض الكل", children }: { title: string, linkText?: string, children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6 md:mb-8 border-r-4 border-brand-orange pr-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl md:text-3xl font-extrabold text-brand-brown font-header leading-tight">{title}</h2>
        {children}
      </div>
      <a href="#" className="group flex items-center text-xs md:text-sm font-bold text-brand-orange hover:text-brand-brown transition-colors">
        {linkText} <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
      </a>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 relative">
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroBento />

        {/* 1. Current Offers Section */}
        <section className="container mx-auto px-4 md:px-6 pb-12">
          <SectionHeader title="عروضنا الحالية 🚀" />
          {/* Changed grid-cols-1 to grid-cols-2 for mobile, and reduced gap */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {FRESH_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 2. Major Promo Banner - Ramadan (Themed) */}
        <section className="container mx-auto px-4 md:px-6">
            <PromoBanner 
                title={PROMO_BANNERS.ramadan.title}
                subtitle={PROMO_BANNERS.ramadan.subtitle}
                image={PROMO_BANNERS.ramadan.image}
                cta={PROMO_BANNERS.ramadan.cta}
                color={PROMO_BANNERS.ramadan.color}
                height="large"
                theme="ramadan"
            />
        </section>

        {/* 3. Fire Offers Section */}
        <section className="container mx-auto px-4 md:px-6 py-12 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <SectionHeader title="العروض النار 🔥">
                <div className="hidden md:flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-lg border border-red-200">
                    <Clock size={16} className="animate-pulse" />
                    <span className="text-xs font-bold">لفترة محدودة جداً</span>
                </div>
            </SectionHeader>
            
            {/* Changed grid-cols-1 to grid-cols-2 for mobile, and reduced gap */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {PANTRY_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        </section>

        {/* 4. Sticky Promo Section (Redesigned) */}
        <section className="container mx-auto px-4 md:px-6 py-4 md:py-8">
           <StickyPromoSection />
        </section>

        {/* 5. Snacks & Beverages (Renamed & Refreshed) */}
        <section className="container mx-auto px-4 md:px-6 py-4 md:py-8 mb-12">
          <SectionHeader title="بتدور عليه؟ أكيد عندنا 😉" linkText="كل المنتجات">
              <SearchCheck size={24} className="text-brand-orange hidden md:block" />
          </SectionHeader>
          {/* Changed grid-cols-1 to grid-cols-2 for mobile, and reduced gap */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {SNACK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <button className="px-8 md:px-10 py-3 md:py-4 bg-white border border-slate-200 rounded-full text-brand-brown font-bold hover:bg-brand-brown hover:text-white hover:border-brand-brown transition-all shadow-md flex items-center gap-2 text-sm md:text-lg group">
              <Sparkles size={18} className="text-brand-orange group-hover:text-white transition-colors" /> عرض منتجات أكتر
            </button>
          </div>
        </section>

        {/* Reels Section (Replaces App Download) */}
        <ReelsSection />
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;
