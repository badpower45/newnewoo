import React from 'react';
import HeroBento from '../components/HeroBento';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import StickyPromoSection from '../components/StickyPromoSection';
import ReelsSection from '../components/ReelsSection';
import SectionHeader from '../components/SectionHeader';
import { FRESH_PRODUCTS, PANTRY_PRODUCTS, SNACK_PRODUCTS, PROMO_BANNERS } from '../constants';
import { Sparkles, Clock, SearchCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <>
            {/* Hero Section */}
            <HeroBento />

            {/* 1. Current Offers Section */}
            <section className="container mx-auto px-4 md:px-6 pb-12">
                <SectionHeader title="عروضنا الحالية 🚀" linkTo="/products" />
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
                    <SectionHeader title="العروض النار 🔥" linkTo="/products">
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
                <SectionHeader title="بتدور عليه؟ أكيد عندنا 😉" linkText="كل المنتجات" linkTo="/products">
                    <SearchCheck size={24} className="text-brand-orange hidden md:block" />
                </SectionHeader>
                {/* Changed grid-cols-1 to grid-cols-2 for mobile, and reduced gap */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {SNACK_PRODUCTS.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                <div className="mt-12 flex justify-center">
                    <Link to="/products" className="px-8 md:px-10 py-3 md:py-4 bg-white border border-slate-200 rounded-full text-brand-brown font-bold hover:bg-brand-brown hover:text-white hover:border-brand-brown transition-all shadow-md flex items-center gap-2 text-sm md:text-lg group">
                        <Sparkles size={18} className="text-brand-orange group-hover:text-white transition-colors" /> عرض منتجات أكتر
                    </Link>
                </div>
            </section>

            {/* Reels Section (Replaces App Download) */}
            <ReelsSection />
        </>
    );
}
