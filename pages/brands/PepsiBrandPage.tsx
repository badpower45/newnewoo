import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowLeft, ShoppingBag, Star, Heart, Share2, Play, 
    Sparkles, Zap, Award, TrendingUp, Gift, Percent,
    ChevronLeft, ChevronRight, Volume2, VolumeX
} from 'lucide-react';
import TopBar from '../../components/TopBar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';

// منتجات بيبسي
const PEPSI_PRODUCTS = [
    {
        id: 'pepsi-1',
        name: 'بيبسي كولا 330 مل',
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
        price: 8,
        originalPrice: 10,
        discount: 20,
        rating: 4.9,
        reviews: 1250,
        isHot: true
    },
    {
        id: 'pepsi-2',
        name: 'بيبسي ماكس بدون سكر 500 مل',
        image: 'https://images.unsplash.com/photo-1622766815178-641bef2b4630?w=400',
        price: 12,
        originalPrice: 15,
        discount: 20,
        rating: 4.8,
        reviews: 890,
        isNew: true
    },
    {
        id: 'pepsi-3',
        name: 'ماونتن ديو 330 مل',
        image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
        price: 9,
        originalPrice: 11,
        discount: 18,
        rating: 4.7,
        reviews: 670,
        isHot: false
    },
    {
        id: 'pepsi-4',
        name: 'سفن أب 330 مل',
        image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400',
        price: 8,
        originalPrice: 10,
        discount: 20,
        rating: 4.6,
        reviews: 540,
        isNew: false
    },
    {
        id: 'pepsi-5',
        name: 'ميراندا برتقال 330 مل',
        image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400',
        price: 7,
        originalPrice: 9,
        discount: 22,
        rating: 4.5,
        reviews: 420,
        isHot: true
    },
    {
        id: 'pepsi-6',
        name: 'عبوة بيبسي 6 علب',
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
        price: 42,
        originalPrice: 60,
        discount: 30,
        rating: 4.9,
        reviews: 2100,
        isBestSeller: true
    }
];

const HERO_SLIDES = [
    {
        id: 1,
        title: 'عيش اللحظة',
        subtitle: 'مع بيبسي',
        description: 'انتعاش لا يقاوم في كل رشفة',
        image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1200',
        cta: 'تسوق الآن',
        offer: 'خصم 30%'
    },
    {
        id: 2,
        title: 'بيبسي ماكس',
        subtitle: 'صفر سكر',
        description: 'نفس الطعم الرائع بدون سكر',
        image: 'https://images.unsplash.com/photo-1622766815178-641bef2b4630?w=1200',
        cta: 'اكتشف الآن',
        offer: 'جديد'
    }
];

const PepsiBrandPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const { addItem } = useCart();
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();

    // Auto-slide
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleAddToCart = (product: typeof PEPSI_PRODUCTS[0]) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    };

    return (
        <div className="min-h-screen bg-[#001529]">
            <TopBar />
            
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
                {/* Floating Bubbles */}
                {[...Array(15)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute rounded-full bg-white/5 animate-float"
                        style={{
                            width: `${Math.random() * 30 + 10}px`,
                            height: `${Math.random() * 30 + 10}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 10 + 10}s`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>
            
            <main className="relative">
                {/* Hero Section - Full Screen Slider */}
                <section className="relative h-[80vh] overflow-hidden">
                    {HERO_SLIDES.map((slide, idx) => (
                        <div 
                            key={slide.id}
                            className={`absolute inset-0 transition-all duration-1000 ${
                                idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                            }`}
                        >
                            <img 
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#001529] via-[#001529]/70 to-transparent" />
                            
                            {/* Content */}
                            <div className={`absolute inset-0 flex items-center justify-center text-center transition-all duration-1000 ${
                                idx === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}>
                                <div className="max-w-4xl px-4">
                                    {slide.offer && (
                                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full text-lg font-bold mb-6 animate-bounce">
                                            <Zap size={20} />
                                            {slide.offer}
                                        </span>
                                    )}
                                    <h1 className="text-6xl md:text-8xl font-black text-white mb-4 drop-shadow-2xl">
                                        <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                            {slide.title}
                                        </span>
                                    </h1>
                                    <h2 className="text-4xl md:text-6xl font-bold text-white/90 mb-6">
                                        {slide.subtitle}
                                    </h2>
                                    <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                                        {slide.description}
                                    </p>
                                    <button className="group bg-gradient-to-r from-blue-500 to-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center gap-3 mx-auto">
                                        <ShoppingBag size={24} />
                                        {slide.cta}
                                        <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Slider Controls */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                        <button 
                            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                            className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <ChevronRight size={24} />
                        </button>
                        
                        <div className="flex gap-2">
                            {HERO_SLIDES.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-2 rounded-full transition-all ${
                                        idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'
                                    }`}
                                />
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                            className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                    </div>
                    
                    {/* Scroll Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
                        </div>
                    </div>
                </section>
                
                {/* Brand Stats */}
                <section className="relative py-10 bg-gradient-to-r from-blue-900/50 to-blue-800/50 backdrop-blur-lg border-y border-white/10">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { icon: Star, value: '4.9', label: 'تقييم العملاء', color: 'text-yellow-400' },
                                { icon: TrendingUp, value: '+50K', label: 'طلب شهرياً', color: 'text-green-400' },
                                { icon: Award, value: '#1', label: 'الأكثر مبيعاً', color: 'text-blue-400' },
                                { icon: Gift, value: '30%', label: 'خصم الآن', color: 'text-red-400' }
                            ].map((stat, idx) => (
                                <div key={idx} className="group">
                                    <stat.icon className={`mx-auto mb-2 ${stat.color} group-hover:scale-125 transition-transform`} size={32} />
                                    <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-white/60">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Featured Offer Banner */}
                <section className="py-10 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 rounded-3xl p-8 md:p-12 overflow-hidden">
                            {/* Decorative */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/20 rounded-full blur-3xl" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-center md:text-right">
                                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1 rounded-full text-white text-sm mb-4">
                                        <Sparkles size={16} />
                                        عرض محدود
                                    </span>
                                    <h3 className="text-3xl md:text-4xl font-black text-white mb-2">
                                        اشتري 6 واحصل على 2 مجاناً
                                    </h3>
                                    <p className="text-white/70">العرض ساري حتى نفاذ الكمية</p>
                                </div>
                                <Link 
                                    to="/products?brand=pepsi"
                                    className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                    <ShoppingBag size={20} />
                                    تسوق العرض
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Products Section */}
                <section className="py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black text-white mb-4">منتجاتنا</h2>
                            <p className="text-white/60 max-w-lg mx-auto">
                                اكتشف تشكيلتنا الكاملة من المشروبات المنعشة
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {PEPSI_PRODUCTS.map((product, idx) => (
                                <div 
                                    key={product.id}
                                    className="group relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-4 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Badges */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                        {product.isHot && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                🔥 الأكثر طلباً
                                            </span>
                                        )}
                                        {product.isNew && (
                                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                ✨ جديد
                                            </span>
                                        )}
                                        {product.isBestSeller && (
                                            <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                                                ⭐ الأفضل مبيعاً
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Favorite Button */}
                                    <button 
                                        className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors z-10"
                                    >
                                        <Heart size={18} />
                                    </button>
                                    
                                    {/* Image */}
                                    <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl">
                                        <img 
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        
                                        {/* Discount Badge */}
                                        <div className="absolute bottom-2 left-2 bg-red-500 text-white px-3 py-1 rounded-xl font-bold text-sm flex items-center gap-1">
                                            <Percent size={14} />
                                            {product.discount}% خصم
                                        </div>
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-white line-clamp-2">{product.name}</h3>
                                        
                                        <div className="flex items-center gap-2">
                                            <Star className="text-yellow-400" size={16} fill="#FACC15" />
                                            <span className="text-white font-bold">{product.rating}</span>
                                            <span className="text-white/50 text-sm">({product.reviews})</span>
                                        </div>
                                        
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <span className="text-2xl font-black text-blue-400">{product.price}</span>
                                                <span className="text-white/50 text-sm mr-1">ج.م</span>
                                                <div className="text-sm text-white/40 line-through">{product.originalPrice} ج.م</div>
                                            </div>
                                            <button 
                                                onClick={() => handleAddToCart(product)}
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                                            >
                                                <ShoppingBag size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* View All Button */}
                        <div className="text-center mt-12">
                            <Link 
                                to="/products?brand=pepsi"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
                            >
                                عرض كل المنتجات
                                <ArrowLeft size={20} />
                            </Link>
                        </div>
                    </div>
                </section>
                
                {/* Video Section */}
                <section className="py-16 px-4 bg-gradient-to-b from-transparent to-blue-900/20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-black text-white mb-8">شاهد إعلاننا الجديد</h2>
                        <div className="relative aspect-video rounded-3xl overflow-hidden bg-blue-900/50 group cursor-pointer">
                            <img 
                                src="https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=1200"
                                alt="Pepsi Video"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Play className="text-white mr-[-4px]" size={36} fill="white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />
            
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                .animate-float {
                    animation: float ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default PepsiBrandPage;
