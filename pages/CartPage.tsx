import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Trash2, Plus, Minus, AlertCircle, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { api } from '../services/api';

const CartPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, removeFromCart, updateQuantity, clearCart, totalPrice, serviceFee, finalTotal, loyaltyPointsEarned, meetsMinimumOrder, redeemPointsForCoupon } = useCart();
    const { selectedBranch } = useBranch();
    const [deliveryFee, setDeliveryFee] = useState(20);
    const [freeDelivery, setFreeDelivery] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);
    
    // Constants
    const MINIMUM_ORDER_AMOUNT = 200;
    const FREE_SHIPPING_THRESHOLD = 600;

    // Calculate delivery fee
    useEffect(() => {
        const calculateDeliveryFee = async () => {
            if (!selectedBranch) return;

            try {
                const result = await api.deliveryFees.calculate(selectedBranch.id, totalPrice);
                if (result.deliveryFee !== undefined) {
                    setDeliveryFee(result.deliveryFee);
                    setFreeDelivery(result.freeDelivery || false);
                }
            } catch (err) {
                console.error('Failed to calculate delivery fee:', err);
                setDeliveryFee(20);
            }
        };

        calculateDeliveryFee();
    }, [selectedBranch, totalPrice]);

    // Handle rewards redemption
    const handleRedeemRewards = async () => {
        setIsRedeeming(true);
        try {
            const result = await redeemPointsForCoupon();
            if (result.success) {
                alert(`🎉 ${result.message}\n\nالكود: ${result.couponCode}\n\nاستخدمه في صفحة الدفع!`);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('حدث خطأ أثناء استرداد النقاط');
        } finally {
            setIsRedeeming(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-white min-h-screen pb-24 md:pb-8 flex flex-col">
                {/* Header */}
                <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center relative md:hidden">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary absolute left-4">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 w-full text-center">My Cart</h1>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:block bg-white p-6 shadow-sm mb-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
                    </div>
                </div>

                {/* Empty State */}
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto w-full relative">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty!</h2>
                    <p className="text-gray-500 mb-8">Ready to shop? Your cart is waiting.</p>

                    <div className="w-64 h-64 bg-gray-50 rounded-full flex items-center justify-center mb-8 relative">
                        <ShoppingCart size={80} className="text-gray-300" />
                    </div>
                </div>

                {/* Fixed Bottom Button - Full Width, Above Taskbar */}
                <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-20 md:relative md:bottom-0 md:max-w-lg md:mx-auto md:mb-8">
                    <button
                        onClick={() => navigate('/categories')}
                        className="w-full bg-primary text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition-colors"
                    >
                        Explore Categories
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-48 md:pb-8">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center relative md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary absolute left-4">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 w-full text-center">My Cart</h1>
            </div>

            <div className="max-w-7xl mx-auto md:p-6">
                <div className="hidden md:flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
                    <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 font-medium flex items-center space-x-1"
                    >
                        <Trash2 size={18} />
                        <span>Clear Cart</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4 p-4 md:p-0">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4">
                                <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                                    <img src={item.image} alt={item.name || item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 line-clamp-2">
                                                {item.name || item.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">{item.weight}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {item.price.toFixed(2)} جنيه للوحدة • شامل الضريبة
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 p-1 hover:bg-red-50 rounded-lg flex-shrink-0"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-all active:scale-95 active:bg-gray-200"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-all active:scale-95 active:bg-brand-orange active:text-white"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-brand-orange text-lg">
                                                {(item.price * item.quantity).toFixed(2)} 
                                                <span className="text-xs text-gray-500 mr-1">جنيه</span>
                                            </p>
                                            <p className="text-xs text-gray-400">شامل الضريبة</p>
                                        </div>
                                    </div>

                                    {/* Substitution Preference */}
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <label className="block text-xs text-gray-600 mb-1">إذا لم يتوفر:</label>
                                        <select
                                            value={item.substitutionPreference || 'call_me'}
                                            onChange={(e) => updateQuantity(item.id, item.quantity, e.target.value)}
                                            className="w-full text-sm px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        >
                                            <option value="call_me">اتصل بي أولاً</option>
                                            <option value="similar_product">استبدل بمنتج مشابه</option>
                                            <option value="cancel_item">الغِ هذا المنتج</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96 p-4 md:p-0">
                        {/* Desktop: Sticky sidebar */}
                        <div className="hidden lg:block bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">ملخص الطلب</h3>

                            {/* Free Shipping Progress */}
                            {totalPrice < FREE_SHIPPING_THRESHOLD && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                                    <p className="text-sm text-blue-800 font-medium mb-2">
                                        أضف {(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} جنيه للحصول على شحن مجاني! 🎉
                                    </p>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Loyalty Points Card */}
                            {user && !user.isGuest && (
                                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Gift className="text-purple-600" size={20} />
                                            <span className="font-bold text-purple-900">نقاط الولاء</span>
                                        </div>
                                        <span className="text-2xl font-bold text-purple-600">+{loyaltyPointsEarned}</span>
                                    </div>
                                    <p className="text-xs text-purple-700 mb-3">
                                        ستحصل على {loyaltyPointsEarned} نقطة من هذا الطلب!
                                    </p>
                                    {user.loyalty_points >= 1000 && (
                                        <button
                                            onClick={handleRedeemRewards}
                                            disabled={isRedeeming}
                                            className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                                        >
                                            {isRedeeming ? 'جاري الاسترداد...' : 'استبدل 1000 نقطة بـ 35 جنيه! 🎁'}
                                        </button>
                                    )}
                                    {user.loyalty_points < 1000 && (
                                        <div className="text-xs text-purple-600 bg-white/50 rounded-lg p-2">
                                            لديك {user.loyalty_points || 0} نقطة. تحتاج {1000 - (user.loyalty_points || 0)} نقطة للحصول على كوبون 35 جنيه
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>المجموع الفرعي</span>
                                    <span>{totalPrice.toFixed(2)} جنيه</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>رسوم الخدمة</span>
                                    <span className={serviceFee === 0 ? 'text-green-600 font-bold' : ''}>
                                        {serviceFee === 0 ? 'مجاني! 🎉' : `${serviceFee.toFixed(2)} جنيه`}
                                    </span>
                                </div>
                                {serviceFee === 0 && (
                                    <p className="text-xs text-green-600 -mt-2">الشحن مجاني للطلبات فوق {FREE_SHIPPING_THRESHOLD} جنيه</p>
                                )}
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                    <span>الإجمالي</span>
                                    <span>{finalTotal.toFixed(2)} جنيه</span>
                                </div>
                            </div>

                            {/* Minimum Order Warning */}
                            {!meetsMinimumOrder && (
                                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                                    <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm text-amber-800">
                                        الحد الأدنى للطلب هو {MINIMUM_ORDER_AMOUNT} جنيه. يرجى إضافة {(MINIMUM_ORDER_AMOUNT - totalPrice).toFixed(2)} جنيه أخرى.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => navigate('/checkout')}
                                disabled={!meetsMinimumOrder}
                                className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {!meetsMinimumOrder 
                                    ? `احتاج ${(MINIMUM_ORDER_AMOUNT - totalPrice).toFixed(2)} جنيه أخرى`
                                    : 'إتمام الطلب'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Fixed Bottom Summary - Above Taskbar */}
            <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-50 rounded-t-2xl">
                {/* Loyalty Points Banner - Mobile */}
                {user && !user.isGuest && loyaltyPointsEarned > 0 && (
                    <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Gift className="text-purple-600" size={16} />
                            <span className="text-xs font-bold text-purple-900">ستربح {loyaltyPointsEarned} نقطة!</span>
                        </div>
                        {user.loyalty_points >= 1000 && (
                            <button
                                onClick={handleRedeemRewards}
                                disabled={isRedeeming}
                                className="bg-purple-600 text-white text-xs font-bold py-1 px-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                استبدل نقاطك 🎁
                            </button>
                        )}
                    </div>
                )}

                {/* Price Summary */}
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <p className="text-xs text-gray-500">الإجمالي (شامل رسوم الخدمة)</p>
                        <p className="text-2xl font-bold text-gray-900">{finalTotal.toFixed(2)} <span className="text-sm">جنيه</span></p>
                        {!meetsMinimumOrder && (
                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                <AlertCircle size={12} />
                                احتاج {(MINIMUM_ORDER_AMOUNT - totalPrice).toFixed(2)} جنيه
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/checkout')}
                        disabled={!meetsMinimumOrder}
                        className="bg-brand-orange text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {!meetsMinimumOrder ? 'أضف المزيد' : 'إتمام الطلب'}
                    </button>
                </div>

                {/* Service Fee Info */}
                <div className="flex justify-between text-xs text-gray-500">
                    <span>المجموع الفرعي: {totalPrice.toFixed(2)} جنيه</span>
                    <span className={serviceFee === 0 ? 'text-green-600 font-bold' : ''}>
                        {serviceFee === 0 ? 'رسوم مجانية! 🎉' : `رسوم خدمة: ${serviceFee.toFixed(2)} جنيه`}
                    </span>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CartPage;
