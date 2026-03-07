import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Trash2, Plus, Minus, AlertCircle, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { optimizeProductCardImage } from '../utils/imageOptimization';

const CartPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, removeFromCart, updateQuantity, clearCart, totalPrice, serviceFee, finalTotal, loyaltyPointsEarned, meetsMinimumOrder, redeemPointsForCoupon, syncCart } = useCart();
    const { selectedBranch } = useBranch();
    const [deliveryFee, setDeliveryFee] = useState(20);
    const [freeDelivery, setFreeDelivery] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    // Constants
    const MINIMUM_ORDER_AMOUNT = 200;
    const FREE_SHIPPING_THRESHOLD = 600;

    // Sync cart on mount (fix for task bar refresh issue)
    useEffect(() => {
        syncCart();
    }, []);

    // Calculate delivery fee (consistent with CheckoutPage: 20 EGP, free above 600)
    useEffect(() => {
        const baseFee = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 20;
        setDeliveryFee(baseFee);
        setFreeDelivery(baseFee === 0);
    }, [totalPrice]);

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
            <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center px-4 py-10 overflow-hidden" style={{ position: 'fixed', inset: 0, overscrollBehavior: 'none', touchAction: 'none' }}>
                <div className="relative w-full max-w-3xl">
                    <div className="absolute -top-10 -right-8 w-40 h-40 bg-orange-200/40 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-12 -left-8 w-44 h-44 bg-amber-200/40 rounded-full blur-3xl"></div>
                    <div className="relative bg-white border border-gray-200 rounded-3xl shadow-lg p-6 sm:p-10 text-center overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
                        <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-md">
                            <ShoppingCart size={42} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-5">سلتك فاضية حالياً</h1>
                        <p className="text-sm text-gray-500 mt-2">
                            اختَر منتجاتك المفضلة وابدأ طلبك في ثواني.
                        </p>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => navigate('/products')}
                                className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                            >
                                <ShoppingCart size={18} />
                                تصفح المنتجات
                            </button>
                            <button
                                onClick={() => navigate('/deals')}
                                className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                            >
                                <Gift size={18} />
                                شوف العروض
                            </button>
                        </div>

                        <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs text-gray-600">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="font-semibold text-gray-900 mb-1">توصيل سريع</p>
                                <p>نوصل خلال 24-48 ساعة</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="font-semibold text-gray-900 mb-1">أمان وموثوقية</p>
                                <p>دفع مرن وخيارات متعددة</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="font-semibold text-gray-900 mb-1">نقاط الولاء</p>
                                <p>اكسب نقاط مع كل طلب</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-48 md:pb-8 overflow-x-hidden" style={{ touchAction: 'pan-y', overscrollBehaviorX: 'none' }}>
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center relative md:hidden">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 text-primary absolute left-4">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 w-full text-center">عربتي</h1>
            </div>

            <div className="max-w-7xl mx-auto md:p-6">
                <div className="hidden md:flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">عربتي</h1>
                    <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 font-medium flex items-center space-x-1"
                    >
                        <Trash2 size={18} />
                        <span>مسح الكل</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4 p-4 md:p-0">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4">
                                <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                                    <img src={optimizeProductCardImage(item.image)} alt={item.name || item.title} loading="lazy" className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 line-clamp-2">
                                                {item.name || item.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">{item.weight}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {(Number(item.price) || 0).toFixed(2)} جنيه للوحدة • شامل الضريبة
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
                                                {((Number(item.price) || 0) * item.quantity).toFixed(2)}
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
                                    <p className="text-xs text-purple-700 mb-2">
                                        ستحصل على {loyaltyPointsEarned} نقطة من هذا الطلب!
                                    </p>
                                    <div className="text-xs text-purple-600 bg-white/50 rounded-lg p-2">
                                        لديك {user.loyalty_points || 0} نقطة حالياً. يمكنك تحويلها لكوبونات من صفحة "نقاطي"
                                    </div>
                                </div>
                            )}
                            {(!user || user.isGuest) && (
                                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Gift className="text-purple-600" size={20} />
                                        <span className="font-bold text-purple-900">برنامج النقاط</span>
                                    </div>
                                    <p className="text-xs text-purple-700">
                                        سجّل دخولك لتكسب نقاط على كل طلب (1 نقطة لكل جنيه) وتستبدلها بكوبونات خصم.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>المجموع الفرعي</span>
                                    <span>{totalPrice.toFixed(2)} جنيه</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>ضريبة الخدمة</span>
                                    <span>{serviceFee.toFixed(2)} جنيه</span>
                                </div>
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
            <div
                className="lg:hidden fixed bottom-20 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-50 rounded-t-2xl"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', touchAction: 'pan-y', overscrollBehaviorX: 'none', overflowX: 'hidden' }}
            >
                {/* Loyalty Points Banner - Mobile */}
                {user && !user.isGuest && loyaltyPointsEarned > 0 && (
                    <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Gift className="text-purple-600" size={16} />
                            <span className="text-xs font-bold text-purple-900">ستربح {loyaltyPointsEarned} نقطة!</span>
                        </div>
                        <span className="text-xs text-purple-600">لديك {user.loyalty_points || 0}</span>
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
                    <span>ضريبة الخدمة: {serviceFee.toFixed(2)} جنيه</span>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CartPage;
