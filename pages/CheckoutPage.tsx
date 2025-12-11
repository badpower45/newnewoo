import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { ArrowLeft, MapPin, Loader, CheckCircle, Tag, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SubstitutionSelector from '../components/SubstitutionSelector';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PAYMENT_METHOD_LABELS } from '../src/config';
import { useToast } from '../components/Toast';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart, updateQuantity } = useCart();
    const { user, loginAsGuest } = useAuth();
    const { selectedBranch } = useBranch();
    const navigate = useNavigate();
    const { showToast, ToastContainer } = useToast();
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const isPickup = paymentMethod === 'branch_pickup';

    // State for Location
    const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    // State for Delivery Fee
    const [deliveryFee, setDeliveryFee] = useState(20);
    const [freeDelivery, setFreeDelivery] = useState(false);
    const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
    const [canDeliver, setCanDeliver] = useState(true);

    // State for Coupon
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        building: '',
        street: '',
        floor: '',
        apartment: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        if (user) {
            const names = user.name ? user.name.split(' ') : ['', ''];
            setFormData(prev => ({
                ...prev,
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                // email is not in the form display but used from user object
            }));
        }
    }, [user]);

    // Calculate delivery fee when branch or total changes (skip for branch pickup)
    useEffect(() => {
        const calculateDeliveryFee = async () => {
            if (!selectedBranch) return;
            if (isPickup) {
                setDeliveryFee(0);
                setFreeDelivery(true);
                setDeliveryMessage('سيتم التحضير في الفرع والاستلام بدون توصيل');
                setCanDeliver(true);
                return;
            }

            try {
                const result = await api.deliveryFees.calculate(
                    selectedBranch.id,
                    totalPrice,
                    locationCoords?.lat,
                    locationCoords?.lng
                );

                if (result.deliveryFee !== undefined) {
                    setDeliveryFee(result.deliveryFee);
                    setFreeDelivery(result.freeDelivery || false);
                    setDeliveryMessage(result.message || null);
                    setCanDeliver(result.canDeliver !== false);
                }
            } catch (err) {
                console.error('Failed to calculate delivery fee:', err);
                // Fallback to default
                setDeliveryFee(20);
                setCanDeliver(true);
            }
        };

        calculateDeliveryFee();
    }, [selectedBranch, totalPrice, locationCoords, isPickup]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubstitutionChange = (productId: string | number, value: string) => {
        const item = items.find(i => i.id === productId);
        if (item) {
            updateQuantity(productId, item.quantity, value);
        }
    };

    // --- Function: Get GPS Location ---
    const handleGetLocation = () => {
        setIsLoadingLocation(true);
        setLocationError('');

        if (!navigator.geolocation) {
            setLocationError('المتصفح لا يدعم تحديد الموقع');
            setIsLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocationCoords({ lat: latitude, lng: longitude });

                // Append Google Maps link to address for easy access
                const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                setFormData(prev => ({
                    ...prev,
                    address: prev.address ? `${prev.address}\n\n📍 الموقع: ${mapLink}` : `📍 الموقع: ${mapLink}`
                }));

                setIsLoadingLocation(false);
            },
            (error) => {
                console.error("Location error:", error);
                setLocationError('تعذر تحديد الموقع. يرجى التأكد من تفعيل الـ GPS.');
                setIsLoadingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    // --- Function: Apply Coupon ---
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('الرجاء إدخال كود الكوبون');
            return;
        }

        if (!user) {
            setCouponError('يجب تسجيل الدخول أولاً لاستخدام الكوبونات');
            showToast('يرجى تسجيل الدخول أولاً', 'warning');
            return;
        }

        setIsValidatingCoupon(true);
        setCouponError('');

        try {
            const result = await api.coupons.validate(couponCode.trim(), totalPrice);

            if (result.valid) {
                setAppliedCoupon(result);
                setCouponDiscount(result.discountAmount || 0);
                showToast(result.message || 'تم تطبيق الكوبون بنجاح!', 'success');
                setCouponError('');
            } else {
                setCouponError(result.error || 'كود الكوبون غير صحيح');
                setAppliedCoupon(null);
                setCouponDiscount(0);
            }
        } catch (err: any) {
            setCouponError(err.response?.data?.error || 'فشل التحقق من الكوبون');
            setAppliedCoupon(null);
            setCouponDiscount(0);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    // --- Function: Remove Coupon ---
    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponError('');
        showToast('تم إزالة الكوبون', 'info');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use selected branch or default to branch 1
        const branchId = selectedBranch?.id || 1;
        if (!branchId) {
            showToast('يرجى اختيار فرع أولاً', 'warning');
            return;
        }

        if (!isPickup && !canDeliver) {
            showToast(deliveryMessage || 'لا يمكن التوصيل لهذا الطلب', 'error');
            return;
        }

        let currentUserId = user?.id;

        if (!currentUserId) {
            showToast('يرجى تسجيل الدخول لإتمام الطلب', 'warning');
            navigate('/login');
            return;
        }

        try {
            // Verify availability for each cart item at selected branch
            try {
                const res = await api.branchProducts.getByBranch(branchId);
                const list = res.data || res || [];
                for (const item of items) {
                    const bp = list.find((x: any) => String(x.product_id ?? x.productId ?? x.id) === String(item.id));
                    if (bp) {
                        const stock = bp.available_quantity ?? bp.stock_quantity ?? bp.stockQuantity;
                        const reserved = bp.reserved_quantity ?? bp.reservedQuantity ?? 0;
                        if (typeof stock === 'number') {
                            const availableCount = Math.max(0, stock - reserved);
                            if (item.quantity > availableCount) {
                                showToast(`الكمية غير متاحة للمنتج ${item.name || (item as any).title || '#' + item.id}`, 'error');
                                return;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Failed availability check', e);
            }
            const orderData = {
                userId: currentUserId,
                branchId: branchId,
                total: totalPrice + deliveryFee - couponDiscount, // Subtotal + delivery - coupon discount
                paymentMethod: paymentMethod,
                deliveryAddress: isPickup
                    ? 'استلام من الفرع'
                    : `${formData.firstName} ${formData.lastName}, ${formData.phone}, ${formData.building}, ${formData.street}, ${formData.address}`,
                shippingDetails: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    building: isPickup ? '' : formData.building,
                    street: isPickup ? '' : formData.street,
                    floor: isPickup ? '' : formData.floor,
                    apartment: isPickup ? '' : formData.apartment,
                    address: isPickup ? '' : formData.address,
                    notes: formData.notes,
                    coordinates: isPickup ? null : locationCoords,
                    fulfillmentType: isPickup ? 'pickup' : 'delivery'
                },
                // إضافة معلومات الكوبون
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                couponId: appliedCoupon ? appliedCoupon.couponId : null,
                couponDiscount: couponDiscount,
                items: items.map(item => ({
                    id: item.id,
                    productId: item.id,
                    name: item.name || (item as any).title,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                    substitutionPreference: item.substitutionPreference || 'none'
                }))
            };

            console.log('📦 Creating order with data:', orderData);
            
            const created = await api.orders.create(orderData);
            console.log('✅ Order API Response:', created);
            
            const createdOrder = (created && (created.data || created)) || {};
            const newOrderId = createdOrder.id || createdOrder.orderId;
            
            console.log('📋 Extracted Order ID:', newOrderId);

            if (newOrderId) {
                clearCart();
                showToast('تم إنشاء الطلب بنجاح! 🎉', 'success');
                navigate(`/order-confirmation/${newOrderId}`);
            } else {
                console.error('❌ No order ID returned:', created);
                showToast('تم إنشاء الطلب لكن لم نتمكن من الحصول على رقم الطلب', 'warning');
                clearCart();
                navigate('/profile');
            }
        } catch (err: any) {
            console.error("❌ Failed to create order:", err);
            console.error("Error details:", err.response?.data);
            const errorMessage = err.response?.data?.error || err.message || 'فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.';
            showToast(errorMessage, 'error');
        }
    };

    // Success UI is handled by OrderConfirmationPage via navigation

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-slate-500 mb-4">No items in cart to checkout.</p>
                <Link to="/products" className="text-primary font-bold hover:underline">Browse Products</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <ToastContainer />
            <Link to="/cart" className="inline-flex items-center text-slate-500 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Cart
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form */}
                <div className="flex-1 space-y-6">
                    {/* Delivery Details */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{isPickup ? 'تفاصيل الاستلام من الفرع' : 'تفاصيل التوصيل'}</h3>
                        {isPickup && (
                            <p className="text-sm text-green-700 mb-4">لا نحتاج عنوان؛ فقط الاسم ورقم الهاتف، وسيتم تجهيز الطلب في الفرع المحدد.</p>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">الاسم الأول</label>
                                <input
                                    required
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    placeholder="أحمد"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">الاسم الأخير</label>
                                <input
                                    required
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    placeholder="محمد"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                            <input
                                required
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                placeholder="01xxxxxxxxx"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">اسم العمارة / المبنى</label>
                                <input
                                    type="text"
                                    name="building"
                                    value={formData.building}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    placeholder="مثال: برج النخيل"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">اسم الشارع</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    placeholder="شارع التحرير"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">الدور</label>
                                <input
                                    type="text"
                                    name="floor"
                                    value={formData.floor}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    placeholder="3"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">الشقة</label>
                                <input
                                    type="text"
                                    name="apartment"
                                    value={formData.apartment}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    placeholder="شقة 5"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                                <span>تفاصيل العنوان الإضافية</span>
                                {/* Location Button */}
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full flex items-center hover:bg-blue-100 transition-colors"
                                        disabled={isLoadingLocation || isPickup}
                                >
                                    {isLoadingLocation ? <Loader size={12} className="animate-spin ml-1" /> : <MapPin size={12} className="ml-1" />}
                                    {locationCoords ? 'تم تحديد الموقع ✓' : 'تحديد موقعي الحالي'}
                                </button>
                            </label>
                            
                            {locationError && <p className="text-xs text-red-500">{locationError}</p>}
                            
                            <textarea
                                rows={2}
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-xl border ${isPickup ? 'border-dashed border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-200'} focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all`}
                                placeholder={isPickup ? 'العنوان غير مطلوب للاستلام من الفرع' : 'علامة مميزة أو تفاصيل إضافية للعنوان...'}
                                disabled={isPickup}
                            ></textarea>
                            
                            {locationCoords && (
                                <p className="text-xs text-green-600 flex items-center">
                                    <CheckCircle size={12} className="ml-1" /> تم حفظ الإحداثيات: {locationCoords.lat.toFixed(5)}, {locationCoords.lng.toFixed(5)}
                                </p>
                            )}
                        </div>

                        {/* ملاحظات التوصيل */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">ملاحظات للتوصيل (اختياري)</label>
                            <textarea
                                rows={2}
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                placeholder={isPickup ? 'مثال: موعد تقريبي لوصولك للفرع' : 'مثال: من فضلك اتصل قبل الوصول...'}
                            ></textarea>
                        </div>
                        </form>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">طريقة الدفع</h3>
                        <div className="space-y-3">
                            <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-green-600 transition">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-5 h-5 text-green-600"
                                />
                                <span className="mr-3 font-medium">{PAYMENT_METHOD_LABELS.cod}</span>
                            </label>
                            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${isPickup ? 'border-green-600 bg-green-50' : 'hover:border-green-600'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="branch_pickup"
                                    checked={paymentMethod === 'branch_pickup'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-5 h-5 text-green-600"
                                />
                                <span className="mr-3 font-medium">{PAYMENT_METHOD_LABELS.branch_pickup}</span>
                            </label>
                            <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-green-600 transition opacity-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="fawry"
                                    disabled
                                    className="w-5 h-5 text-green-600"
                                />
                                <span className="mr-3 font-medium">{PAYMENT_METHOD_LABELS.fawry} (قريباً)</span>
                            </label>
                        </div>
                    </div>

                    {/* Substitution Preferences */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">تفضيلات الاستبدال</h3>
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                        <SubstitutionSelector
                                            value={item.substitutionPreference || 'none'}
                                            onChange={(value) => handleSubstitutionChange(item.id, value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {deliveryMessage && (
                        <div className={`p-4 rounded-xl mb-4 ${
                            freeDelivery ? 'bg-green-50 text-green-700' :
                            !canDeliver ? 'bg-red-50 text-red-700' :
                            'bg-blue-50 text-blue-700'
                        }`}>
                            <p className="text-sm font-medium text-center">{deliveryMessage}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!isPickup && !canDeliver}
                        className={`w-full font-bold py-4 rounded-xl transition-colors shadow-lg ${
                            isPickup || canDeliver
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isPickup || canDeliver
                            ? `تأكيد الطلب (${(totalPrice + deliveryFee - couponDiscount).toFixed(2)} جنيه)`
                            : 'لا يمكن إتمام الطلب'}
                    </button>
                </div>

                {/* Order Summary (Mini) */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h3>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{item.name || (item as any).title} <span className="text-xs text-slate-400">x{item.quantity}</span></span>
                                    <span className="font-bold text-slate-800">{((item.price || 0) * item.quantity).toFixed(2)} EGP</span>
                                </div>
                            ))}
                        </div>

                        {/* مربع الكوبون */}
                        <div className="mb-4 border-t border-slate-200 pt-4">
                            <label className="text-sm font-bold text-slate-700 mb-2 block">كوبون الخصم</label>
                            {!appliedCoupon ? (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                            placeholder="أدخل كود الكوبون"
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={isValidatingCoupon || !couponCode.trim()}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-sm font-medium"
                                        >
                                            {isValidatingCoupon ? (
                                                <Loader size={16} className="animate-spin" />
                                            ) : (
                                                <Tag size={16} />
                                            )}
                                            تطبيق
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className="text-xs text-red-600">{couponError}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-green-600" />
                                            <div>
                                                <p className="text-sm font-bold text-green-900">{appliedCoupon.code}</p>
                                                {appliedCoupon.description && (
                                                    <p className="text-xs text-green-700">{appliedCoupon.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="إزالة الكوبون"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-200 pt-4 space-y-2">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{totalPrice.toFixed(2)} EGP</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>{isPickup ? 'Pickup' : 'Delivery'}</span>
                                <span className={freeDelivery ? 'text-green-600 font-bold' : ''}>
                                    {freeDelivery ? 'FREE!' : `${deliveryFee.toFixed(2)} EGP`}
                                </span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                                    <span>Coupon Discount</span>
                                    <span>-{couponDiscount.toFixed(2)} EGP</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="font-bold text-slate-800">Total</span>
                                <span className="font-bold text-xl text-primary">{(totalPrice + deliveryFee - couponDiscount).toFixed(2)} EGP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
