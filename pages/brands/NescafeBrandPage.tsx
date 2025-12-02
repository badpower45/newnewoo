import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, ShoppingBag, Star, Heart, Coffee, 
    Sparkles, Award, Sun, Moon, Flame, Clock,
    ChevronDown, Gift, Percent, Timer
} from 'lucide-react';
import TopBar from '../../components/TopBar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

// منتجات نسكافيه
const NESCAFE_PRODUCTS = [
    {
        id: 'nescafe-1',
        name: 'نسكافيه جولد 200 جم',
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
        price: 145,
        originalPrice: 180,
        discount: 19,
        rating: 4.9,
        reviews: 2340,
        category: 'premium',
        intensity: 5,
        isBestSeller: true
    },
    {
        id: 'nescafe-2',
        name: 'نسكافيه كلاسيك 100 جم',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        price: 65,
        originalPrice: 80,
        discount: 19,
        rating: 4.8,
        reviews: 3120,
        category: 'classic',
        intensity: 4,
        isBestSeller: true
    },
    {
        id: 'nescafe-3',
        name: 'نسكافيه 3 في 1 - 20 كيس',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        price: 85,
        originalPrice: 100,
        discount: 15,
        rating: 4.7,
        reviews: 1890,
        category: '3in1',
        intensity: 3,
        isNew: true
    },
    {
        id: 'nescafe-4',
        name: 'نسكافيه دولتشي جوستو كبسولات',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
        price: 220,
        originalPrice: 280,
        discount: 21,
        rating: 4.9,
        reviews: 980,
        category: 'capsules',
        intensity: 5,
        isHot: true
    },
    {
        id: 'nescafe-5',
        name: 'نسكافيه كريمي لاتيه',
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        price: 95,
        originalPrice: 110,
        discount: 14,
        rating: 4.6,
        reviews: 670,
        category: 'specialty',
        intensity: 2,
        isNew: true
    },
    {
        id: 'nescafe-6',
        name: 'نسكافيه إسبريسو أوريجينال',
        image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
        price: 175,
        originalPrice: 210,
        discount: 17,
        rating: 4.8,
        reviews: 1240,
        category: 'espresso',
        intensity: 5,
        isHot: true
    }
];

const COFFEE_FACTS = [
    { icon: Coffee, title: 'بن عربي 100%', desc: 'من أجود المزارع' },
    { icon: Sun, title: 'تحميص مثالي', desc: 'لنكهة غنية' },
    { icon: Award, title: 'جودة عالمية', desc: 'منذ 1938' },
    { icon: Flame, title: 'نكهة مميزة', desc: 'لا تُنسى' }
];

const NescafeBrandPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [steamEffect, setSteamEffect] = useState(true);
    const { addItem } = useCart();

    const categories = [
        { id: 'all', name: 'الكل' },
        { id: 'premium', name: 'بريميوم' },
        { id: 'classic', name: 'كلاسيك' },
        { id: '3in1', name: '3 في 1' },
        { id: 'capsules', name: 'كبسولات' },
        { id: 'specialty', name: 'مميزة' }
    ];

    const filteredProducts = selectedCategory === 'all' 
        ? NESCAFE_PRODUCTS 
        : NESCAFE_PRODUCTS.filter(p => p.category === selectedCategory);

    const handleAddToCart = (product: typeof NESCAFE_PRODUCTS[0]) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    };

    // Intensity meter component
    const IntensityMeter = ({ level }: { level: number }) => (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i}
                    className={`w-2 h-4 rounded-sm transition-colors ${
                        i < level ? 'bg-amber-600' : 'bg-amber-200'
                    }`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1A0F0A]">
            <TopBar />
            
            {/* Coffee-themed Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Warm gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D1810] via-[#1A0F0A] to-[#0D0705]" />
                
                {/* Coffee bean pattern overlay */}
                <div 
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-8 0-15 7-15 15s7 15 15 15 15-7 15-15-7-15-15-15zm0 25c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z' fill='%23D4A574' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}
                />
                
                {/* Floating steam */}
                {steamEffect && [...Array(8)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-gradient-to-t from-amber-200/10 to-transparent rounded-full animate-steam"
                        style={{
                            width: `${Math.random() * 100 + 50}px`,
                            height: `${Math.random() * 200 + 100}px`,
                            left: `${10 + i * 12}%`,
                            bottom: '0',
                            animationDuration: `${4 + Math.random() * 4}s`,
                            animationDelay: `${i * 0.5}s`
                        }}
                    />
                ))}
                
                {/* Warm glow spots */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-700/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-900/15 rounded-full blur-[150px]" />
            </div>
            
            <main className="relative">
                {/* Hero Section - Coffee Cup Style */}
                <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                    {/* Large coffee cup background element */}
                    <div className="absolute inset-0">
                        <img 
                            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600"
                            alt="Coffee Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#1A0F0A]/90 via-[#1A0F0A]/70 to-[#1A0F0A]" />
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-900/80 to-amber-800/80 backdrop-blur-lg px-6 py-2 rounded-full border border-amber-600/30 mb-8">
                            <Coffee className="text-amber-400" size={20} />
                            <span className="text-amber-200 font-bold">منذ 1938</span>
                            <Sparkles className="text-amber-400" size={16} />
                        </div>
                        
                        {/* Main Title */}
                        <h1 className="mb-6">
                            <span className="block text-7xl md:text-9xl font-black">
                                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-2xl">
                                    NESCAFÉ
                                </span>
                            </span>
                        </h1>
                        
                        {/* Slogan */}
                        <p className="text-3xl md:text-4xl font-bold text-amber-100/90 mb-4">
                            ابدأ يومك بنسكافيه
                        </p>
                        <p className="text-xl text-amber-200/60 mb-10 max-w-2xl mx-auto">
                            قهوة فاخرة من أجود أنواع البن العالمي، 
                            محمصة بإتقان لتمنحك تجربة لا تُنسى
                        </p>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                to="#products"
                                className="group bg-gradient-to-r from-amber-600 to-amber-700 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-amber-600/30 transition-all flex items-center gap-3"
                            >
                                <Coffee size={24} />
                                تسوق الآن
                                <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                            </Link>
                            <button 
                                className="bg-white/10 backdrop-blur-lg text-amber-100 px-8 py-4 rounded-2xl font-bold border border-amber-600/30 hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                                <Gift size={20} />
                                اشتري 2 واحصل على 1 مجاناً
                            </button>
                        </div>
                        
                        {/* Scroll indicator */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                            <ChevronDown className="text-amber-400/50" size={32} />
                        </div>
                    </div>
                </section>
                
                {/* Coffee Facts Section */}
                <section className="relative py-16 bg-gradient-to-b from-[#1A0F0A] to-[#2D1810]/50">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {COFFEE_FACTS.map((fact, idx) => (
                                <div 
                                    key={idx}
                                    className="group text-center p-6 bg-gradient-to-b from-amber-900/20 to-amber-800/10 rounded-3xl border border-amber-800/30 hover:border-amber-600/50 transition-all hover:-translate-y-2"
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/50 group-hover:scale-110 transition-transform">
                                        <fact.icon className="text-amber-100" size={28} />
                                    </div>
                                    <h3 className="text-lg font-bold text-amber-100 mb-1">{fact.title}</h3>
                                    <p className="text-sm text-amber-200/60">{fact.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Special Offer Banner */}
                <section className="py-8 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 rounded-3xl p-8 md:p-12 overflow-hidden border border-amber-700/50">
                            {/* Decorative coffee beans */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-600/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-700/20 rounded-full blur-2xl" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="hidden md:flex w-24 h-24 bg-amber-700 rounded-full items-center justify-center">
                                        <Timer className="text-amber-200" size={48} />
                                    </div>
                                    <div className="text-center md:text-right">
                                        <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-1 rounded-full text-sm font-bold mb-3">
                                            <Flame size={16} />
                                            عرض اليوم فقط
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-black text-amber-100 mb-2">
                                            خصم 25% على الطلب الأول
                                        </h3>
                                        <p className="text-amber-200/70">استخدم كود: COFFEE25</p>
                                    </div>
                                </div>
                                <Link 
                                    to="/products?brand=nescafe"
                                    className="bg-amber-100 text-amber-900 px-8 py-4 rounded-2xl font-bold hover:bg-white transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                    <ShoppingBag size={20} />
                                    تسوق الآن
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Products Section */}
                <section id="products" className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black text-amber-100 mb-4">تشكيلتنا المميزة</h2>
                            <p className="text-amber-200/60 max-w-lg mx-auto">
                                اختر من بين مجموعة واسعة من أجود أنواع القهوة
                            </p>
                        </div>
                        
                        {/* Category Filter */}
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-6 py-2.5 rounded-full font-bold transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/50'
                                            : 'bg-amber-900/30 text-amber-200 hover:bg-amber-800/50 border border-amber-800/50'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        
                        {/* Products Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {filteredProducts.map((product, idx) => (
                                <div 
                                    key={product.id}
                                    className="group relative bg-gradient-to-b from-amber-900/40 to-amber-950/40 backdrop-blur-lg rounded-3xl overflow-hidden border border-amber-800/30 hover:border-amber-600/50 transition-all duration-300 hover:-translate-y-2"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Badges */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                        {product.isBestSeller && (
                                            <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                <Award size={12} />
                                                الأفضل مبيعاً
                                            </span>
                                        )}
                                        {product.isNew && (
                                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                جديد ✨
                                            </span>
                                        )}
                                        {product.isHot && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                <Flame size={12} />
                                                رائج
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Favorite */}
                                    <button className="absolute top-4 left-4 w-10 h-10 bg-amber-900/50 backdrop-blur rounded-full flex items-center justify-center text-amber-200 hover:bg-red-500 hover:text-white transition-colors z-10">
                                        <Heart size={18} />
                                    </button>
                                    
                                    {/* Image */}
                                    <div className="relative aspect-square overflow-hidden">
                                        <img 
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0A] via-transparent to-transparent" />
                                        
                                        {/* Discount Badge */}
                                        <div className="absolute bottom-3 left-3 bg-red-500 text-white px-3 py-1 rounded-xl font-bold text-sm flex items-center gap-1">
                                            <Percent size={14} />
                                            {product.discount}% خصم
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-5 space-y-3">
                                        <h3 className="font-bold text-amber-100 line-clamp-2 group-hover:text-amber-200 transition-colors">
                                            {product.name}
                                        </h3>
                                        
                                        {/* Rating & Intensity */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Star className="text-amber-400" size={14} fill="#F59E0B" />
                                                <span className="text-amber-100 font-bold text-sm">{product.rating}</span>
                                                <span className="text-amber-400/50 text-xs">({product.reviews})</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-amber-400/70 text-xs">الحدة:</span>
                                                <IntensityMeter level={product.intensity} />
                                            </div>
                                        </div>
                                        
                                        {/* Price & Add to Cart */}
                                        <div className="flex items-end justify-between pt-2">
                                            <div>
                                                <span className="text-2xl font-black text-amber-400">{product.price}</span>
                                                <span className="text-amber-400/60 text-sm mr-1">ج.م</span>
                                                <div className="text-sm text-amber-400/40 line-through">{product.originalPrice} ج.م</div>
                                            </div>
                                            <button 
                                                onClick={() => handleAddToCart(product)}
                                                className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-3 rounded-xl hover:shadow-lg hover:shadow-amber-600/30 transition-all"
                                            >
                                                <ShoppingBag size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* View All */}
                        <div className="text-center mt-12">
                            <Link 
                                to="/products?brand=nescafe"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-amber-600/20 transition-all"
                            >
                                عرض كل المنتجات
                                <ArrowLeft size={20} />
                            </Link>
                        </div>
                    </div>
                </section>
                
                {/* Coffee Quote Section */}
                <section className="py-20 px-4 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <Coffee className="mx-auto text-amber-600/50 mb-6" size={64} />
                        <blockquote className="text-3xl md:text-4xl font-bold text-amber-100/90 mb-6 leading-relaxed">
                            "القهوة ليست مجرد مشروب،
                            <br />
                            إنها لحظة من السكينة في يوم مزدحم"
                        </blockquote>
                        <p className="text-amber-400/60 text-lg">— نسكافيه</p>
                    </div>
                </section>
            </main>
            
            <Footer />
            
            <style>{`
                @keyframes steam {
                    0% { 
                        opacity: 0;
                        transform: translateY(0) scaleX(1);
                    }
                    50% { 
                        opacity: 0.3;
                        transform: translateY(-100px) scaleX(1.5);
                    }
                    100% { 
                        opacity: 0;
                        transform: translateY(-200px) scaleX(0.5);
                    }
                }
                .animate-steam {
                    animation: steam ease-out infinite;
                }
            `}</style>
        </div>
    );
};

export default NescafeBrandPage;
