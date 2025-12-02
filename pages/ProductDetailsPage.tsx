import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart, Share2, Star, Minus, Plus, ShoppingCart, CheckCircle2, Clock, Truck, Shield } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { useFavorites } from '../context/FavoritesContext';
import { ProductDetailsSkeleton } from '../components/Skeleton';
import Footer from '../components/Footer';

const ProductDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const { addToCart } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [quantity, setQuantity] = useState(1);
    const { selectedBranch } = useBranch();
    const [available, setAvailable] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);
    const [branchPrice, setBranchPrice] = useState<number | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');

    // Mock reviews - في المستقبل هنجيبهم من API
    const reviews = [
        { id: 1, name: 'أحمد محمد', rating: 5, comment: 'منتج ممتاز وطعمه رائع', date: 'منذ يومين' },
        { id: 2, name: 'فاطمة علي', rating: 4, comment: 'جودة عالية لكن السعر مرتفع قليلاً', date: 'منذ أسبوع' },
        { id: 3, name: 'محمود حسن', rating: 5, comment: 'المنتج المفضل لعائلتي', date: 'منذ أسبوعين' }
    ];

    // Load product and branch price together
    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;
            setLoading(true);
            
            try {
                const branchId = selectedBranch?.id;
                const data = await api.products.getOne(id, branchId);
                let loadedProduct = data.data || data;
                
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
                
                // Load similar products
                if (loadedProduct.category) {
                    try {
                        const similarRes = await api.products.getByCategory(loadedProduct.category, branchId);
                        const similarList = similarRes.data || similarRes || [];
                        const filtered = similarList
                            .filter((p: Product) => String(p.id) !== String(id))
                            .slice(0, 4);
                        setSimilarProducts(filtered);
                    } catch (e) {
                        console.error('Failed to load similar products', e);
                    }
                }
                
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
        return <ProductDetailsSkeleton />;
    }
    
    if (!product) return <div className="min-h-screen flex items-center justify-center">المنتج غير موجود</div>;

    const displayPrice = Number(branchPrice) || Number(product.price) || 0;
    const oldPrice = Number(product.discount_price) || Number(product.originalPrice) || (displayPrice * 1.15); // 15% higher as old price if not set
    const discountPercentage = oldPrice > displayPrice ? Math.round(((oldPrice - displayPrice) / oldPrice) * 100) : 0;
    const savings = oldPrice - displayPrice;
    const productRating = Number(product.rating) || 4.5;
    const productReviews = Number(product.reviews) || 120;

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const handleAddToCart = () => {
        if (!available) return;
        const productWithPrice = { ...product, price: displayPrice };
        addToCart(productWithPrice, quantity);
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
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
            {/* Top Navigation - Floating */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white transition-all"
                >
                    <ArrowRight className="w-5 h-5 text-[#23110C]" />
                </button>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => toggleFavorite(product)}
                        className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white transition-all"
                    >
                        <Heart
                            className={`w-5 h-5 transition-all ${isFavorite(product.id) ? 'fill-[#F97316] text-[#F97316] scale-110' : 'text-[#23110C]'}`}
                        />
                    </button>
                    <button 
                        onClick={handleShare}
                        className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white transition-all"
                    >
                        <Share2 className="w-5 h-5 text-[#23110C]" />
                    </button>
                </div>
            </div>

            {/* Image Area with Gradient */}
            <div className="h-[42vh] bg-gradient-to-br from-[#FFF7ED] to-[#F3F4F6] flex items-center justify-center relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-[#F97316]/5 rounded-full blur-2xl" />
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#F97316]/5 rounded-full blur-3xl" />
                
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-72 h-72 object-contain relative z-10 drop-shadow-2xl"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Product';
                    }}
                />

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                    <div className="absolute top-20 left-4 bg-gradient-to-br from-[#EF4444] to-[#dc2626] text-white px-4 py-2 rounded-full shadow-xl transform -rotate-12">
                        <span className="font-bold">وفر {discountPercentage}%</span>
                    </div>
                )}
            </div>

            {/* Main Content Container */}
            <div className="flex-1 bg-white rounded-t-[32px] -mt-8 relative shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
                <div className="px-6 pt-6 pb-40 overflow-y-auto max-h-[calc(100vh-42vh+32px)]">
                    {/* Product Title & Stock Status */}
                    <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                            <h1 className="flex-1 text-xl font-bold text-[#23110C] leading-tight">{product.name}</h1>
                            {available && (
                                <div className="flex items-center gap-1 bg-[#10B981]/10 px-3 py-1 rounded-full">
                                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                                    <span className="text-[#10B981] text-sm font-semibold">متوفر</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[#9CA3AF] text-sm">{product.name_en || product.category}</p>
                    </div>

                    {/* Price Section */}
                    <div className="bg-gradient-to-br from-[#FFF7ED] to-[#FEE2E2] rounded-2xl p-4 mb-6">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[#6B7280] text-sm mb-1">السعر</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[40px] text-[#F97316] leading-none font-bold">
                                        {displayPrice.toFixed(0)}
                                    </span>
                                    <div className="flex flex-col">
                                        {oldPrice > displayPrice && (
                                            <span className="text-[#9CA3AF] line-through text-lg">
                                                {oldPrice.toFixed(0)}
                                            </span>
                                        )}
                                        <span className="text-[#23110C]">جنيه</span>
                                    </div>
                                </div>
                            </div>
                            {savings > 0 && (
                                <div className="text-left">
                                    <div className="bg-white rounded-xl px-3 py-2 shadow-sm">
                                        <p className="text-[#10B981] text-sm font-semibold">توفر</p>
                                        <p className="text-[#10B981] text-xl font-bold">
                                            {savings.toFixed(0)} جنيه
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Size Selection (if weight exists) */}
                    {product.weight && (
                        <div className="mb-6">
                            <h4 className="font-bold text-[#23110C] mb-3">الحجم</h4>
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 py-3 px-4 rounded-xl border-2 transition-all border-[#F97316] bg-[#FFF7ED] text-[#F97316] font-semibold"
                                >
                                    {product.weight}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] text-[#F97316] rounded-full text-sm border border-[#F97316]/20 font-semibold"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Rating & Reviews */}
                    <div className="bg-[#F9FAFB] rounded-2xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${
                                                star <= Math.floor(productRating)
                                                    ? 'fill-[#FFC107] text-[#FFC107]'
                                                    : 'fill-[#E5E7EB] text-[#E5E7EB]'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-[#23110C] text-xl font-bold">
                                    {productRating.toFixed(1)}
                                </span>
                            </div>
                            <span className="text-[#6B7280]">
                                ({productReviews} تقييم)
                            </span>
                        </div>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const percentage = stars === 5 ? 75 : stars === 4 ? 20 : stars === 3 ? 3 : stars === 2 ? 1 : 1;
                                return (
                                    <div key={stars} className="flex items-center gap-2">
                                        <span className="text-[#6B7280] text-sm w-3">{stars}</span>
                                        <Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" />
                                        <div className="flex-1 bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-[#FFC107] h-full rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-[#6B7280] text-sm w-8 text-left">{percentage}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 rounded-xl p-3 text-center">
                            <Truck className="w-6 h-6 text-[#10B981] mx-auto mb-2" />
                            <p className="text-[#23110C] text-xs font-semibold">توصيل سريع</p>
                            <p className="text-[#6B7280] text-xs">خلال ساعة</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#3B82F6]/10 to-[#3B82F6]/5 rounded-xl p-3 text-center">
                            <Shield className="w-6 h-6 text-[#3B82F6] mx-auto mb-2" />
                            <p className="text-[#23110C] text-xs font-semibold">ضمان الجودة</p>
                            <p className="text-[#6B7280] text-xs">منتج أصلي</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#F97316]/10 to-[#F97316]/5 rounded-xl p-3 text-center">
                            <Clock className="w-6 h-6 text-[#F97316] mx-auto mb-2" />
                            <p className="text-[#23110C] text-xs font-semibold">طازج دائماً</p>
                            <p className="text-[#6B7280] text-xs">يومياً</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h4 className="font-bold text-[#23110C] mb-3">وصف المنتج</h4>
                        <p className="text-[#6B7280] leading-relaxed">
                            {product.description || `${product.name} - منتج عالي الجودة من أفضل الموردين. طازج ومضمون الجودة. مناسب للاستخدام اليومي ويوفر لك القيمة الأفضل مقابل المال.`}
                        </p>
                    </div>

                    {/* Customer Reviews */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-[#23110C]">آراء العملاء</h4>
                            <button className="text-[#F97316] text-sm font-semibold">
                                عرض الكل
                            </button>
                        </div>
                        <div className="space-y-3">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#ea580c] flex items-center justify-center text-white font-bold">
                                                {review.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[#23110C] font-semibold">
                                                    {review.name}
                                                </p>
                                                <p className="text-[#9CA3AF] text-xs">{review.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[#6B7280] text-sm">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Related Products */}
                    {similarProducts.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-bold text-[#23110C] mb-4">منتجات مشابهة</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {similarProducts.map((item) => {
                                    const itemOldPrice = item.discount_price || item.originalPrice || (item.price * 1.15);
                                    const itemDiscount = itemOldPrice > item.price ? Math.round(((itemOldPrice - item.price) / itemOldPrice) * 100) : 0;
                                    
                                    return (
                                        <Link
                                            key={item.id}
                                            to={`/product/${item.id}`}
                                            className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer relative"
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
                                                    className="w-full h-28 object-contain"
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
                                                            {(item.price || 0).toFixed(0)}
                                                        </p>
                                                        {itemOldPrice > item.price && (
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
                </div>
            </div>

            {/* Bottom Sticky Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-[0_-4px_16px_rgba(0,0,0,0.1)] z-50">
                <div className="p-4 max-w-md mx-auto">
                    {/* Quantity & Price Row */}
                    <div className="flex items-center gap-3 mb-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-full px-3 py-2 border border-[#E5E7EB]">
                            <button
                                onClick={handleDecrement}
                                className="w-8 h-8 flex items-center justify-center text-[#23110C] hover:bg-white rounded-full transition-all"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-bold">
                                {quantity}
                            </span>
                            <button
                                onClick={handleIncrement}
                                className="w-8 h-8 flex items-center justify-center text-[#23110C] hover:bg-white rounded-full transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Total Price Display */}
                        <div className="flex-1 bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] rounded-2xl px-4 py-2 border border-[#F97316]/20">
                            <p className="text-[#6B7280] text-xs">الإجمالي</p>
                            <p className="text-[#F97316] text-xl font-bold">
                                {(displayPrice * quantity).toFixed(0)} جنيه
                            </p>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                        onClick={handleAddToCart}
                        disabled={!available}
                        className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all ${
                            available 
                                ? 'bg-gradient-to-r from-[#F97316] to-[#ea580c] text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span className="text-lg font-bold">{available ? 'أضف للسلة' : 'غير متوفر'}</span>
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProductDetailsPage;
