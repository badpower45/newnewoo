import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart, Share2, Star, Minus, Plus, ShoppingCart, CheckCircle2, Clock, Truck, Shield, Package, Award, ThumbsUp, Zap, Info } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { ProductDetailsSkeleton } from '../components/Skeleton';
import Footer from '../components/Footer';
import Seo, { getSiteUrl } from '../components/Seo';
import { optimizeProductDetailImage, optimizeFrameImage } from '../utils/imageOptimization';

const ProductDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const { addToCart } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const { selectedBranch } = useBranch();
    const [available, setAvailable] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);
    const [branchPrice, setBranchPrice] = useState<number | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'info'>('description');
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewStats, setReviewStats] = useState<any>(null);
    const [userReview, setUserReview] = useState({ rating: 5, comment: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const siteUrl = getSiteUrl();
    const productUrl = `${siteUrl}/product/${encodeURIComponent(id ?? '')}`;
    const [reviewsLoaded, setReviewsLoaded] = useState(false);

    useEffect(() => {
        setReviewsLoaded(false);
        setReviews([]);
        setReviewStats(null);
    }, [id]);

    // Fetch reviews only when the user opens the reviews tab
    useEffect(() => {
        if (!id) return;
        if (activeTab !== 'reviews') return;
        if (reviewsLoaded) return;
        fetchReviews().finally(() => setReviewsLoaded(true));
    }, [id, activeTab, reviewsLoaded]);

    const fetchReviews = async () => {
        try {
            if (!id) return;
            const response = await api.reviews.getByProduct(id);
            setReviews(response.data || []);
            setReviewStats(response.stats || null);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
            setReviewStats(null);
        }
    };

    const handleSubmitReview = async () => {
        if (!userReview.comment.trim()) {
            alert('الرجاء كتابة تعليق');
            return;
        }

        try {
            await api.reviews.create({
                product_id: id!,
                rating: userReview.rating,
                comment: userReview.comment,
                user_avatar: user?.avatar
            });

            setUserReview({ rating: 5, comment: '' });
            setShowReviewForm(false);
            fetchReviews(); // Refresh reviews
            alert('تم إضافة تقييمك بنجاح!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('حدث خطأ أثناء إضافة التقييم');
        }
    };

    // Load product and branch price together
    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;
            setLoading(true);

            try {
                const branchId = selectedBranch?.id || 1; // Default to branch 1 if no branch selected
                const data = await api.products.getOne(id, branchId);
                // API returns the product directly, not wrapped in {data: ...}
                let loadedProduct = data;

                console.log('Loaded product:', loadedProduct); // Debug log

                if (!loadedProduct || !loadedProduct.id) {
                    loadedProduct = {
                        id: id,
                        name: 'المنتج غير متاح',
                        category: 'غير معروف',
                        price: 0,
                        rating: 0,
                        reviews: 0,
                        image: 'https://placehold.co/600x600?text=Product',
                        weight: 'N/A'
                    };
                }

                if (loadedProduct.price && loadedProduct.price > 0) {
                    setBranchPrice(loadedProduct.price);
                }

                if (selectedBranch && loadedProduct.stock_quantity !== undefined) {
                    const stock = loadedProduct.stock_quantity || 0;
                    const reserved = loadedProduct.reserved_quantity || 0;
                    setAvailable((stock - reserved) > 0);
                }

                setProduct(loadedProduct);
                if (loadedProduct.weight) {
                    setSelectedSize(loadedProduct.weight);
                }

                // Load similar products (reduced to 3 max - EXTREME)
                if (loadedProduct.category) {
                    try {
                        const similarList = await api.products.getByCategory(loadedProduct.category, branchId || 1, 3); // 🔥 Only 3!
                        const data = Array.isArray(similarList)
                            ? similarList
                            : (similarList.data || similarList.products || []);
                        const filtered = data
                            .filter((p: Product) => String(p.id) !== String(id))
                            .slice(0, 3);
                        setSimilarProducts(filtered);
                        console.log('Similar products:', filtered.length, 'products');
                    } catch (e) {
                        console.error('Failed to load similar products', e);
                        setSimilarProducts([]);
                    }
                }

                // 🔥 REMOVED: Recommended products entirely to save bandwidth!
                setRecommendedProducts([]);

            } catch (e) {
                console.error('Failed to load product', e);
                setProduct({
                    id: id,
                    name: 'المنتج غير متاح',
                    category: 'غير معروف',
                    price: 0,
                    rating: 0,
                    reviews: 0,
                    image: 'https://placehold.co/600x600?text=Product',
                    weight: 'N/A'
                });
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id, selectedBranch?.id]);

    if (loading) {
        return (
            <>
                <Seo
                    title="جاري تحميل المنتج"
                    description="نجهز لك تفاصيل المنتج الآن"
                    url={productUrl}
                    type="product"
                />
                <ProductDetailsSkeleton />
            </>
        );
    }

    if (!product) return (
        <>
            <Seo
                title="المنتج غير متوفر"
                description="لم نتمكن من العثور على هذا المنتج حالياً"
                url={productUrl}
                type="product"
                noIndex
            />
            <div className="min-h-screen flex items-center justify-center">المنتج غير موجود</div>
        </>
    );

    const displayPrice = Number(branchPrice) || Number(product.price) || 0;
    const realOldPrice = Number(product.discount_price) || Number(product.originalPrice) || 0;
    const oldPrice = realOldPrice > displayPrice ? realOldPrice : 0;
    const discountPercentage = oldPrice > 0 ? Math.round(((oldPrice - displayPrice) / oldPrice) * 100) : 0;
    const savings = oldPrice > 0 ? oldPrice - displayPrice : 0;
    const frameOverlayUrl = (product as any).fo || (product as any).frame_overlay_url; // API returns 'fo' (shortened)
    const frameEnabledValue = (product as any).frame_enabled;
    const isFrameEnabled = Boolean(frameOverlayUrl) && (
        frameEnabledValue === true ||
        frameEnabledValue === 'true' ||
        frameEnabledValue === 't' ||
        frameEnabledValue === 1 ||
        frameEnabledValue === '1'
    );

    // Use real ratings from reviews, fallback to product rating if available
    const productRating = reviewStats?.average_rating
        ? Number(reviewStats.average_rating)
        : (Number(product.rating) || 0);
    const productReviews = reviewStats?.total_reviews
        ? Number(reviewStats.total_reviews)
        : (Number(product.reviews) || 0);
    const productBrand = (product as any)?.brand || (product as any)?.brand_name;
    const metaDescription = product.description
        ? String(product.description)
        : `${product.name} متاح الآن بسعر ${(displayPrice || 0).toFixed(0)} جنيه مع توصيل سريع من علوش ماركت.`;
    const seoKeywords = [
        product.name,
        product.category,
        product.weight,
        product.barcode,
        available ? 'متوفر' : 'غير متوفر'
    ].filter(Boolean) as string[];
    const productStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image ? [product.image] : undefined,
        description: metaDescription,
        sku: product.barcode,
        brand: productBrand ? { '@type': 'Brand', name: productBrand } : undefined,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'EGP',
            price: Number(displayPrice) || 0,
            availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: productUrl
        },
        aggregateRating: productReviews ? {
            '@type': 'AggregateRating',
            ratingValue: productRating.toFixed(1),
            reviewCount: productReviews
        } : undefined
    };

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const handleAddToCart = () => {
        if (!available) return;
        const productWithPrice = { ...product, price: displayPrice };
        addToCart(productWithPrice, quantity);

        // Show success animation
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `تفقد هذا المنتج: ${product.name}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        }
    };

    const tags = [product.weight, product.category, available ? 'متوفر' : 'غير متوفر'].filter(Boolean);

    return (
        <>
            <Seo
                title={product.name}
                description={metaDescription}
                image={product.image}
                url={productUrl}
                type="product"
                keywords={seoKeywords}
                structuredData={productStructuredData}
            />
            <div className="min-h-screen bg-white flex flex-col">
                {/* Success Animation Overlay */}
                {showSuccessAnimation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl animate-scale-up">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                            <p className="text-[#23110C] font-bold text-center">تمت الإضافة للسلة!</p>
                        </div>
                    </div>
                )}

                {/* Top Navigation - Floating with Glassmorphism */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-xl shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-all active:scale-95 border border-white/50"
                    >
                        <ArrowRight className="w-5 h-5 text-[#23110C]" />
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => toggleFavorite(product)}
                            className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-xl shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-all active:scale-95 border border-white/50"
                        >
                            <Heart
                                className={`w-5 h-5 transition-all ${isFavorite(product.id)
                                    ? 'fill-[#F97316] text-[#F97316] animate-pulse'
                                    : 'text-[#23110C]'
                                    }`}
                            />
                        </button>
                        <button
                            onClick={handleShare}
                            className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-xl shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-all active:scale-95 border border-white/50"
                        >
                            <Share2 className="w-5 h-5 text-[#23110C]" />
                        </button>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="bg-white px-5 pt-16 pb-10">
                    <div className="relative flex flex-col items-center gap-4">
                        <div className="relative flex items-center justify-center">
                            {/* Discount Badge */}
                            {discountPercentage > 0 && (
                                <div className="absolute -top-3 -left-3 z-20">
                                    <div className="bg-[#EF4444] text-white px-3 py-1 rounded-full shadow-md font-bold">
                                        -{discountPercentage}%
                                    </div>
                                </div>
                            )}

                            {/* New Badge */}
                            {product.is_new && (
                                <div className="absolute -top-3 -right-3 z-20">
                                    <div className="bg-[#10B981] text-white px-3 py-1 rounded-full shadow-md font-bold flex items-center gap-1">
                                        <Zap className="w-4 h-4" />
                                        <span className="text-xs">جديد</span>
                                    </div>
                                </div>
                            )}

                            <img
                                src={optimizeProductDetailImage(product.image)}
                                alt={product.name}
                                className="w-80 h-80 sm:w-96 sm:h-96 object-contain drop-shadow-2xl bg-white"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Product';
                                }}
                            />
                            {isFrameEnabled && (
                                <img
                                    src={optimizeFrameImage(frameOverlayUrl)}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/80 px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                            <span>شامل الضريبة</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Container with Enhanced Shadow */}
                <div className="flex-1 bg-white rounded-t-[32px] -mt-6 relative shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                    {/* Decorative Top Bar */}
                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4"></div>

                    <div className="px-5 pt-2 pb-48 md:pb-40 overflow-y-auto">
                        {/* Product Title & Stock Status with Animation */}
                        <div className="mb-4 animate-slide-up">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h1 className="flex-1 text-xl font-black text-[#23110C] leading-tight">{product.name}</h1>
                                {available ? (
                                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20 animate-pulse-subtle">
                                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                                        <span className="text-[#10B981] text-sm font-bold">متوفر</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                                        <Clock className="w-4 h-4 text-red-500" />
                                        <span className="text-red-500 text-sm font-bold">غير متوفر</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-[#9CA3AF] text-sm">{product.category}</p>
                                {product.barcode && (
                                    <>
                                        <span className="text-[#E5E7EB]">•</span>
                                        <p className="text-[#9CA3AF] text-xs">#{product.barcode}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Price Section with Gradient */}
                        <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-orange-100 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[#6B7280] text-xs mb-1 font-semibold uppercase tracking-wide">السعر الحالي</p>
                                    <div className="flex items-end flex-wrap gap-x-2 gap-y-1">
                                        <span className="text-4xl text-[#F97316] leading-none font-black">
                                            {(displayPrice || 0).toFixed(0)}
                                        </span>
                                        <span className="text-[#23110C] text-base font-semibold">جنيه</span>
                                        {oldPrice > displayPrice && (
                                            <>
                                                <span className="text-[#9CA3AF] line-through text-base font-semibold">
                                                    {(oldPrice || 0).toFixed(0)} جنيه
                                                </span>
                                                <span className="bg-[#EF4444] text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                                                    -{discountPercentage}%
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">شامل الضريبة</p>
                                </div>
                                {savings > 0 && (
                                    <div className="text-center">
                                        <div className="bg-white rounded-xl px-4 py-2 shadow-md border border-[#10B981]/20">
                                            <ThumbsUp className="w-5 h-5 text-[#10B981] mx-auto mb-1" />
                                            <p className="text-[#10B981] text-xs font-semibold whitespace-nowrap">توفير</p>
                                            <p className="text-[#10B981] text-lg font-black">
                                                {(savings || 0).toFixed(0)}
                                            </p>
                                            <p className="text-[#10B981] text-xs">جنيه</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Size Selection (if weight exists) */}
                        {product.weight && (
                            <div className="mb-4">
                                <h4 className="font-bold text-[#23110C] text-sm mb-2">الحجم</h4>
                                <div className="flex gap-2">
                                    <button
                                        className="py-2 px-4 rounded-lg border-2 transition-all border-[#F97316] bg-[#FFF7ED] text-[#F97316] font-semibold text-sm"
                                    >
                                        {product.weight}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] text-[#F97316] rounded-full text-sm border border-[#F97316]/20 font-semibold"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Enhanced Rating Card */}
                        <div className="bg-gradient-to-br from-white to-[#F9FAFB] rounded-2xl p-5 mb-5 border border-[#E5E7EB] shadow-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gradient-to-br from-[#FFC107] to-[#FF9800] w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
                                        <span className="text-white text-2xl font-black">{(productRating || 0).toFixed(1)}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= Math.floor(productRating)
                                                        ? 'fill-[#FFC107] text-[#FFC107]'
                                                        : 'fill-[#E5E7EB] text-[#E5E7EB]'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[#6B7280] text-sm font-semibold">
                                            {productReviews} تقييم من العملاء
                                        </p>
                                    </div>
                                </div>
                                <Award className="w-8 h-8 text-[#FFC107]" />
                            </div>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    // Get actual count from reviewStats if available
                                    const starCount = reviewStats
                                        ? (reviewStats[`${['one', 'two', 'three', 'four', 'five'][stars - 1]}_star`] || 0)
                                        : 0;
                                    const totalReviews = reviewStats?.total_reviews || 0;
                                    const percentage = totalReviews > 0 ? Math.round((starCount / totalReviews) * 100) : 0;

                                    return (
                                        <div key={stars} className="flex items-center gap-3">
                                            <span className="text-[#6B7280] text-sm font-semibold w-3">{stars}</span>
                                            <Star className="w-3.5 h-3.5 fill-[#FFC107] text-[#FFC107]" />
                                            <div className="flex-1 bg-[#E5E7EB] rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-[#FFC107] to-[#FF9800] h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-[#6B7280] text-sm font-bold w-12 text-left">{percentage}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Enhanced Features Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <div className="bg-gradient-to-br from-[#10B981]/10 via-[#10B981]/5 to-transparent rounded-2xl p-4 text-center border border-[#10B981]/20 hover:shadow-lg transition-all group">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-lg">
                                    <Truck className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-[#23110C] text-xs font-bold mb-0.5">توصيل سريع</p>
                                <p className="text-[#6B7280] text-xs">خلال ساعة</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#3B82F6]/10 via-[#3B82F6]/5 to-transparent rounded-2xl p-4 text-center border border-[#3B82F6]/20 hover:shadow-lg transition-all group">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-lg">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-[#23110C] text-xs font-bold mb-0.5">ضمان الجودة</p>
                                <p className="text-[#6B7280] text-xs">منتج أصلي 100%</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#F97316]/10 via-[#F97316]/5 to-transparent rounded-2xl p-4 text-center border border-[#F97316]/20 hover:shadow-lg transition-all group">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-lg">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-[#23110C] text-xs font-bold mb-0.5">طازج دائماً</p>
                                <p className="text-[#6B7280] text-xs">يومياً</p>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'description'
                                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg scale-105'
                                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    <span>وصف المنتج</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'reviews'
                                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg scale-105'
                                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4" />
                                    <span>التقييمات ({reviews.length})</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'info'
                                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg scale-105'
                                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    <span>معلومات إضافية</span>
                                </div>
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="mb-6 animate-fade-in">
                            {/* Description Tab */}
                            {activeTab === 'description' && (
                                <div className="bg-gradient-to-br from-[#F9FAFB] to-white rounded-2xl p-5 border border-[#E5E7EB]">
                                    <h4 className="font-black text-[#23110C] mb-3 text-lg">عن المنتج</h4>
                                    <p className="text-[#6B7280] leading-relaxed text-sm">
                                        {product.description || `${product.name} - منتج عالي الجودة من أفضل الموردين المعتمدين. نضمن لك الطزاجة والجودة العالية. مناسب للاستخدام اليومي ويوفر لك القيمة الأفضل مقابل المال. تم فحص المنتج والتأكد من مطابقته لأعلى معايير الجودة.`}
                                    </p>
                                    {product.weight && (
                                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Package className="w-4 h-4 text-[#F97316]" />
                                                <span className="text-[#6B7280]">الوزن/الحجم:</span>
                                                <span className="text-[#23110C] font-bold">{product.weight}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div className="space-y-3">
                                    {/* Add Review Button */}
                                    {!showReviewForm && (
                                        <button
                                            onClick={() => setShowReviewForm(true)}
                                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Star className="w-5 h-5" />
                                            أضف تقييمك
                                        </button>
                                    )}

                                    {/* Review Form */}
                                    {showReviewForm && (
                                        <div className="bg-white border border-orange-200 rounded-2xl p-4 mb-4">
                                            <h4 className="font-bold text-gray-900 mb-3">أضف تقييمك</h4>

                                            {/* Rating Stars */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-sm font-medium text-gray-700">التقييم:</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setUserReview({ ...userReview, rating: star })}
                                                            className="focus:outline-none"
                                                        >
                                                            <Star
                                                                className={`w-6 h-6 transition-colors ${star <= userReview.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'fill-gray-300 text-gray-300'
                                                                    }`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Comment */}
                                            <textarea
                                                value={userReview.comment}
                                                onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                                                placeholder="شاركنا رأيك في المنتج..."
                                                rows={4}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                            />

                                            {/* Buttons */}
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={handleSubmitReview}
                                                    className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                                >
                                                    إرسال التقييم
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowReviewForm(false);
                                                        setUserReview({ rating: 5, comment: '' });
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-2xl">
                                            <Star size={40} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-600 font-medium">لا توجد تقييمات حتى الآن</p>
                                            <p className="text-gray-400 text-sm">كن أول من يقيّم هذا المنتج!</p>
                                        </div>
                                    ) : (
                                        <>
                                            {reviews.map((review, index) => (
                                                <div
                                                    key={review.id}
                                                    className="bg-white border border-[#E5E7EB] rounded-2xl p-4 hover:shadow-lg transition-all animate-slide-up"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            {review.user_avatar ? (
                                                                <img
                                                                    src={review.user_avatar}
                                                                    alt={review.user_name || review.name || 'مستخدم'}
                                                                    className="w-12 h-12 rounded-2xl object-cover border border-orange-100 shadow-lg"
                                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center text-white font-black text-lg shadow-lg">
                                                                    {(review.user_name || review.name || 'U').charAt(0)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-[#23110C] font-bold">
                                                                        {review.user_name || review.name || 'مستخدم'}
                                                                    </p>
                                                                    {review.verified && (
                                                                        <div className="bg-[#10B981]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                                                            <span className="text-[#10B981] text-xs font-bold">موثق</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p className="text-[#9CA3AF] text-xs">
                                                                    {review.created_at
                                                                        ? new Date(review.created_at).toLocaleDateString('ar-EG')
                                                                        : review.date
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-[#FFF7ED] px-2 py-1 rounded-lg">
                                                            <Star className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                                                            <span className="text-[#23110C] font-bold text-sm">{review.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[#6B7280] leading-relaxed text-sm">{review.comment}</p>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Info Tab */}
                            {activeTab === 'info' && (
                                <div className="bg-gradient-to-br from-[#F9FAFB] to-white rounded-2xl p-5 border border-[#E5E7EB] space-y-3">
                                    <div className="flex items-center justify-between py-3 border-b border-[#E5E7EB]">
                                        <span className="text-[#6B7280] font-semibold">الفئة</span>
                                        <span className="text-[#23110C] font-bold">{product.category}</span>
                                    </div>
                                    {product.weight && (
                                        <div className="flex items-center justify-between py-3 border-b border-[#E5E7EB]">
                                            <span className="text-[#6B7280] font-semibold">الوزن/الحجم</span>
                                            <span className="text-[#23110C] font-bold">{product.weight}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between py-3 border-b border-[#E5E7EB]">
                                        <span className="text-[#6B7280] font-semibold">الحالة</span>
                                        <span className={`font-bold ${available ? 'text-[#10B981]' : 'text-red-500'}`}>
                                            {available ? 'متوفر' : 'غير متوفر'}
                                        </span>
                                    </div>
                                    {product.barcode && (
                                        <div className="flex items-center justify-between py-3 border-b border-[#E5E7EB]">
                                            <span className="text-[#6B7280] font-semibold">الباركود</span>
                                            <span className="text-[#23110C] font-mono text-sm">{product.barcode}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-[#6B7280] font-semibold">التقييم</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= Math.floor(productRating)
                                                            ? 'fill-[#FFC107] text-[#FFC107]'
                                                            : 'fill-[#E5E7EB] text-[#E5E7EB]'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[#23110C] font-bold">{productRating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Related Products */}
                        {similarProducts.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-[#23110C]">منتجات مشابهة</h4>
                                    <button
                                        onClick={() => navigate(`/products?category=${product?.category}`)}
                                        className="text-[#F97316] text-sm font-medium hover:text-[#ea580c] flex items-center gap-1"
                                    >
                                        عرض الكل
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                                    {similarProducts.map((item) => {
                                        const itemPrice = Number(item.price) || 0;
                                        const itemOldPrice = Number(item.discount_price) || Number(item.originalPrice) || (itemPrice * 1.15);
                                        const itemDiscount = itemOldPrice > itemPrice ? Math.round(((itemOldPrice - itemPrice) / itemOldPrice) * 100) : 0;

                                        return (
                                            <Link
                                                key={item.id}
                                                to={`/product/${item.id}`}
                                                className="min-w-[180px] max-w-[200px] snap-start bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer relative"
                                            >
                                                {/* Discount Badge */}
                                                {itemDiscount > 0 && (
                                                    <div className="absolute top-2 right-2 z-10">
                                                        <div className="bg-[#EF4444] text-white px-2 py-1 rounded-full text-xs shadow-lg font-bold">
                                                            -{itemDiscount}%
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="bg-[#F9FAFB] p-4">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-36 object-contain"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Product';
                                                        }}
                                                    />
                                                </div>

                                                <div className="p-3">
                                                    <p className="text-[#23110C] text-sm mb-2 line-clamp-2 min-h-[2.5rem] font-semibold">
                                                        {item.name}
                                                    </p>

                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <p className="text-[#F97316] text-lg font-bold">
                                                                {itemPrice.toFixed(0)} جنيه
                                                            </p>
                                                            {itemOldPrice > itemPrice && (
                                                                <p className="text-[#9CA3AF] line-through text-xs">
                                                                    {itemOldPrice.toFixed(0)} جنيه
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                addToCart(item, 1);
                                                            }}
                                                            className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center shadow-md hover:bg-[#ea580c] transition-all"
                                                        >
                                                            <Plus className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* You May Also Like - Recommended Products */}
                        {recommendedProducts.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-[#23110C]">قد يعجبك أيضاً</h4>
                                    <button
                                        onClick={() => navigate('/products')}
                                        className="text-[#F97316] text-sm font-medium hover:text-[#ea580c] flex items-center gap-1"
                                    >
                                        عرض المزيد
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                                    {recommendedProducts.map((item) => {
                                        const itemPrice = Number(item.price) || 0;
                                        const itemOldPrice = Number(item.discount_price) || Number(item.originalPrice) || (itemPrice * 1.15);
                                        const itemDiscount = itemOldPrice > itemPrice ? Math.round(((itemOldPrice - itemPrice) / itemOldPrice) * 100) : 0;

                                        return (
                                            <Link
                                                key={item.id}
                                                to={`/product/${item.id}`}
                                                className="min-w-[180px] max-w-[200px] snap-start bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer relative group"
                                            >
                                                {/* Discount Badge */}
                                                {itemDiscount > 0 && (
                                                    <div className="absolute top-2 right-2 z-10">
                                                        <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white px-2 py-1 rounded-full text-xs shadow-lg font-bold">
                                                            -{itemDiscount}%
                                                        </div>
                                                    </div>
                                                )}

                                                {/* New Badge if available */}
                                                {item.is_new && (
                                                    <div className="absolute top-2 left-2 z-10">
                                                        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-2 py-1 rounded-full text-xs shadow-lg font-bold">
                                                            جديد
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] p-4">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-28 object-contain group-hover:scale-110 transition-transform duration-300"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Product';
                                                        }}
                                                    />
                                                </div>

                                                <div className="p-3">
                                                    <p className="text-[#23110C] text-sm mb-2 line-clamp-2 min-h-[2.5rem] font-semibold">
                                                        {item.name}
                                                    </p>

                                                    {/* Rating if available */}
                                                    {item.rating && (
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <Star size={12} className="fill-[#FCD34D] text-[#FCD34D]" />
                                                            <span className="text-xs text-[#6B7280]">{Number(item.rating).toFixed(1)}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[#F97316] text-lg font-bold">
                                                                {itemPrice.toFixed(0)} جنيه
                                                            </p>
                                                            {itemOldPrice > itemPrice && (
                                                                <p className="text-[#9CA3AF] line-through text-xs">
                                                                    {itemOldPrice.toFixed(0)} جنيه
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                addToCart(item, 1);
                                                            }}
                                                            className="w-8 h-8 bg-gradient-to-r from-[#F97316] to-[#ea580c] rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all group-hover:scale-110"
                                                        >
                                                            <Plus className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Sticky Bar */}
                <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-[0_-2px_10px_rgba(0,0,0,0.08)] z-40">
                    <div className="px-4 py-3 max-w-md mx-auto">
                        {/* Quantity & Price Row */}
                        <div className="flex items-center gap-2 mb-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center bg-[#F3F4F6] rounded-full px-2 py-1.5 border border-[#E5E7EB]">
                                <button
                                    onClick={handleDecrement}
                                    className="w-7 h-7 flex items-center justify-center text-[#23110C] hover:bg-white rounded-full transition-all"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-bold text-sm">
                                    {quantity}
                                </span>
                                <button
                                    onClick={handleIncrement}
                                    className="w-7 h-7 flex items-center justify-center text-[#23110C] hover:bg-white rounded-full transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Total Price Display */}
                            <div className="flex-1 bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] rounded-xl px-3 py-1.5 border border-[#F97316]/20">
                                <p className="text-[#6B7280] text-[10px]">الإجمالي</p>
                                <p className="text-[#F97316] text-lg font-bold">
                                    {((displayPrice || 0) * quantity).toFixed(0)} جنيه
                                </p>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!available}
                            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${available
                                ? 'bg-gradient-to-r from-[#F97316] to-[#ea580c] text-white hover:shadow-xl active:scale-[0.98]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="text-base font-bold">{available ? 'أضف للسلة' : 'غير متوفر'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetailsPage;
