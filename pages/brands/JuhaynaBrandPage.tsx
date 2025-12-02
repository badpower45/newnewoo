import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, ShoppingBag, Star, Heart, Droplets, 
    Sparkles, Award, Leaf, Sun, Moon, Clock,
    Gift, Percent, Milk, Check, Shield, Truck
} from 'lucide-react';
import TopBar from '../../components/TopBar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

// منتجات جهينة
const JUHAYNA_PRODUCTS = [
    {
        id: 'juhayna-1',
        name: 'حليب جهينة كامل الدسم 1 لتر',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        price: 32,
        originalPrice: 38,
        discount: 16,
        rating: 4.9,
        reviews: 3450,
        category: 'milk',
        isFresh: true,
        isBestSeller: true
    },
    {
        id: 'juhayna-2',
        name: 'زبادي جهينة طبيعي 400 جم',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        price: 18,
        originalPrice: 22,
        discount: 18,
        rating: 4.8,
        reviews: 2890,
        category: 'yogurt',
        isFresh: true,
        isBestSeller: true
    },
    {
        id: 'juhayna-3',
        name: 'عصير جهينة برتقال 1 لتر',
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
        price: 28,
        originalPrice: 35,
        discount: 20,
        rating: 4.7,
        reviews: 1560,
        category: 'juice',
        isFresh: true,
        isNew: true
    },
    {
        id: 'juhayna-4',
        name: 'جبنة جهينة بيضاء 500 جم',
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
        price: 55,
        originalPrice: 65,
        discount: 15,
        rating: 4.9,
        reviews: 1230,
        category: 'cheese',
        isFresh: true,
        isHot: true
    },
    {
        id: 'juhayna-5',
        name: 'حليب جهينة خالي الدسم 1 لتر',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
        price: 30,
        originalPrice: 36,
        discount: 17,
        rating: 4.6,
        reviews: 980,
        category: 'milk',
        isFresh: true,
        isNew: true
    },
    {
        id: 'juhayna-6',
        name: 'زبادي جهينة بالفراولة 125 جم × 4',
        image: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400',
        price: 35,
        originalPrice: 42,
        discount: 17,
        rating: 4.8,
        reviews: 2100,
        category: 'yogurt',
        isFresh: true,
        isHot: true
    }
];

const BRAND_VALUES = [
    { icon: Leaf, title: 'طبيعي 100%', desc: 'بدون إضافات صناعية', color: 'from-green-400 to-green-600' },
    { icon: Shield, title: 'جودة مضمونة', desc: 'معايير عالمية', color: 'from-blue-400 to-blue-600' },
    { icon: Droplets, title: 'طازج يومياً', desc: 'من المزرعة إليك', color: 'from-cyan-400 to-cyan-600' },
    { icon: Truck, title: 'توصيل سريع', desc: 'حافظ على البرودة', color: 'from-sky-400 to-sky-600' }
];

const JuhaynaBrandPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [animateMilk, setAnimateMilk] = useState(true);
    const { addItem } = useCart();

    const categories = [
        { id: 'all', name: 'الكل', icon: '🥛' },
        { id: 'milk', name: 'حليب', icon: '🥛' },
        { id: 'yogurt', name: 'زبادي', icon: '🥣' },
        { id: 'juice', name: 'عصائر', icon: '🍊' },
        { id: 'cheese', name: 'جبنة', icon: '🧀' }
    ];

    const filteredProducts = selectedCategory === 'all' 
        ? JUHAYNA_PRODUCTS 
        : JUHAYNA_PRODUCTS.filter(p => p.category === selectedCategory);

    const handleAddToCart = (product: typeof JUHAYNA_PRODUCTS[0]) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
            <TopBar />
            
            {/* Fresh Dairy Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Soft gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-100/50 via-white to-cyan-50/50" />
                
                {/* Milk splash decorations */}
                <div className="absolute top-20 right-10 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/20 to-cyan-100/20 rounded-full blur-3xl" />
                
                {/* Floating milk drops */}
                {animateMilk && [...Array(12)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-white/80 rounded-full shadow-lg animate-milkdrop"
                        style={{
                            width: `${Math.random() * 20 + 8}px`,
                            height: `${Math.random() * 30 + 12}px`,
                            left: `${Math.random() * 100}%`,
                            top: `-50px`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                            animationDelay: `${i * 0.4}s`,
                            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                        }}
                    />
                ))}
            </div>
            
            <main className="relative">
                {/* Hero Section - Fresh & Clean */}
                <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute inset-0">
                        {/* Wave pattern */}
                        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" fill="none">
                            <path 
                                fill="url(#wave-gradient)" 
                                fillOpacity="0.2"
                                d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            />
                            <defs>
                                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0ea5e9" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    
                    <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Content */}
                            <div className="text-center md:text-right">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-5 py-2 rounded-full mb-6 shadow-lg shadow-sky-200">
                                    <Leaf className="text-green-200" size={18} />
                                    <span className="font-bold">طبيعي 100%</span>
                                    <Sparkles size={14} />
                                </div>
                                
                                {/* Logo/Brand */}
                                <div className="mb-6">
                                    <h1 className="text-6xl md:text-8xl font-black mb-2">
                                        <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                                            جهينة
                                        </span>
                                    </h1>
                                    <p className="text-2xl md:text-3xl font-bold text-sky-700">Juhayna</p>
                                </div>
                                
                                {/* Slogan */}
                                <p className="text-xl md:text-2xl text-gray-600 mb-4">
                                    طبيعي وطازج كل يوم
                                </p>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto md:mx-0">
                                    منتجات ألبان وعصائر طبيعية من مزارعنا الخاصة، 
                                    بجودة لا مثيل لها منذ أكثر من 30 عاماً
                                </p>
                                
                                {/* CTA */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                    <Link 
                                        to="#products"
                                        className="group bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-sky-200 hover:shadow-2xl hover:shadow-sky-300 transition-all flex items-center justify-center gap-3"
                                    >
                                        <ShoppingBag size={22} />
                                        تسوق الآن
                                        <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                                    </Link>
                                    <div className="flex items-center justify-center gap-2 bg-green-100 text-green-700 px-6 py-4 rounded-2xl font-bold">
                                        <Gift size={20} />
                                        خصم 25% على العائلة
                                    </div>
                                </div>
                                
                                {/* Trust badges */}
                                <div className="flex items-center justify-center md:justify-start gap-6 mt-10">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Check className="text-green-500 bg-green-100 rounded-full p-1" size={24} />
                                        <span className="text-sm">طازج يومياً</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Check className="text-green-500 bg-green-100 rounded-full p-1" size={24} />
                                        <span className="text-sm">توصيل مبرّد</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Check className="text-green-500 bg-green-100 rounded-full p-1" size={24} />
                                        <span className="text-sm">ضمان الجودة</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Hero Image */}
                            <div className="relative">
                                <div className="relative w-full aspect-square max-w-lg mx-auto">
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-300/50 to-cyan-300/50 rounded-full blur-3xl scale-75" />
                                    
                                    {/* Main circle container */}
                                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white to-sky-50 shadow-2xl shadow-sky-200/50 p-8 flex items-center justify-center overflow-hidden">
                                        <img 
                                            src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600"
                                            alt="Juhayna Products"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                        
                                        {/* Floating product badges */}
                                        <div className="absolute top-5 right-5 bg-white rounded-2xl p-3 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                                            <span className="text-2xl">🥛</span>
                                        </div>
                                        <div className="absolute bottom-10 left-5 bg-white rounded-2xl p-3 shadow-xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                                            <span className="text-2xl">🧀</span>
                                        </div>
                                        <div className="absolute top-1/3 left-0 bg-white rounded-2xl p-3 shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                                            <span className="text-2xl">🍊</span>
                                        </div>
                                    </div>
                                    
                                    {/* Orbiting elements */}
                                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                                            🥣
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Brand Values */}
                <section className="py-16 px-4 bg-gradient-to-b from-white to-sky-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {BRAND_VALUES.map((value, idx) => (
                                <div 
                                    key={idx}
                                    className="group text-center p-6 bg-white rounded-3xl shadow-lg shadow-sky-100 hover:shadow-xl hover:shadow-sky-200 transition-all hover:-translate-y-2"
                                >
                                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        <value.icon className="text-white" size={28} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{value.title}</h3>
                                    <p className="text-sm text-gray-500">{value.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Special Offer */}
                <section className="py-10 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="relative bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 rounded-3xl p-8 md:p-12 overflow-hidden shadow-xl shadow-sky-200">
                            {/* Milk splash decorations */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                            
                            {/* Decorative drops */}
                            <div className="absolute top-4 right-20 w-4 h-6 bg-white/30 rounded-full" style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }} />
                            <div className="absolute bottom-8 right-40 w-3 h-5 bg-white/20 rounded-full" style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }} />
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-center md:text-right">
                                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
                                        <Sparkles size={16} />
                                        عرض العائلة
                                    </span>
                                    <h3 className="text-2xl md:text-4xl font-black text-white mb-2">
                                        اشتري 3 واحصل على الرابع مجاناً
                                    </h3>
                                    <p className="text-white/80">على جميع منتجات الألبان والعصائر</p>
                                </div>
                                <Link 
                                    to="/products?brand=juhayna"
                                    className="bg-white text-sky-600 px-8 py-4 rounded-2xl font-bold hover:bg-sky-50 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
                                >
                                    <ShoppingBag size={20} />
                                    تسوق العرض
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Products Section */}
                <section id="products" className="py-16 px-4 bg-gradient-to-b from-sky-50 to-white">
                    <div className="max-w-6xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black text-gray-800 mb-4">منتجاتنا الطازجة</h2>
                            <p className="text-gray-500 max-w-lg mx-auto">
                                من مزارعنا إلى منزلك - طازج يومياً
                            </p>
                        </div>
                        
                        {/* Category Filter - Fresh Design */}
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${
                                        selectedCategory === cat.id
                                            ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-200'
                                            : 'bg-white text-gray-600 hover:bg-sky-50 border border-gray-200 hover:border-sky-300'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        
                        {/* Products Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {filteredProducts.map((product, idx) => (
                                <div 
                                    key={product.id}
                                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-sky-100 hover:shadow-xl hover:shadow-sky-200 transition-all duration-300 hover:-translate-y-2"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Badges */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                        {product.isFresh && (
                                            <span className="bg-gradient-to-r from-green-400 to-green-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                                                <Leaf size={12} />
                                                طازج
                                            </span>
                                        )}
                                        {product.isBestSeller && (
                                            <span className="bg-gradient-to-r from-sky-400 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                                ⭐ الأفضل مبيعاً
                                            </span>
                                        )}
                                        {product.isNew && (
                                            <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                                ✨ جديد
                                            </span>
                                        )}
                                        {product.isHot && (
                                            <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                                🔥 رائج
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Favorite */}
                                    <button className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors z-10 shadow-md">
                                        <Heart size={18} />
                                    </button>
                                    
                                    {/* Image */}
                                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-sky-50 to-cyan-50">
                                        <img 
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        
                                        {/* Discount Badge */}
                                        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1 shadow-md">
                                            <Percent size={14} />
                                            {product.discount}% خصم
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-5 space-y-3">
                                        <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-sky-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        
                                        {/* Rating */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <Star className="text-amber-400" size={16} fill="#FBBF24" />
                                                <span className="font-bold text-gray-800">{product.rating}</span>
                                            </div>
                                            <span className="text-gray-400 text-sm">({product.reviews} تقييم)</span>
                                        </div>
                                        
                                        {/* Price & Add to Cart */}
                                        <div className="flex items-end justify-between pt-2">
                                            <div>
                                                <span className="text-2xl font-black text-sky-600">{product.price}</span>
                                                <span className="text-sky-400 text-sm mr-1">ج.م</span>
                                                <div className="text-sm text-gray-400 line-through">{product.originalPrice} ج.م</div>
                                            </div>
                                            <button 
                                                onClick={() => handleAddToCart(product)}
                                                className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white p-3 rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all"
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
                                to="/products?brand=juhayna"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-sky-200 hover:shadow-2xl hover:shadow-sky-300 transition-all"
                            >
                                عرض كل المنتجات
                                <ArrowLeft size={20} />
                            </Link>
                        </div>
                    </div>
                </section>
                
                {/* Fresh Promise Section */}
                <section className="py-20 px-4 bg-gradient-to-br from-sky-500 to-cyan-500 relative overflow-hidden">
                    {/* Decorative waves */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 320">
                            <path fill="white" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"/>
                        </svg>
                    </div>
                    
                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                            <Droplets className="text-white" size={48} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                            وعدنا لك: طازج دائماً
                        </h2>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                            كل منتج يصل إليك في أقل من 24 ساعة من الإنتاج،
                            <br />
                            لأن عائلتك تستحق الأفضل
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-xl text-white font-bold">
                                <Clock className="inline ml-2" size={18} />
                                توصيل خلال 24 ساعة
                            </div>
                            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-xl text-white font-bold">
                                <Shield className="inline ml-2" size={18} />
                                ضمان الجودة
                            </div>
                            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-xl text-white font-bold">
                                <Leaf className="inline ml-2" size={18} />
                                طبيعي 100%
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />
            
            <style>{`
                @keyframes milkdrop {
                    0% { 
                        transform: translateY(-50px) scale(1);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    100% { 
                        transform: translateY(100vh) scale(0.5);
                        opacity: 0;
                    }
                }
                .animate-milkdrop {
                    animation: milkdrop linear infinite;
                }
            `}</style>
        </div>
    );
};

export default JuhaynaBrandPage;
