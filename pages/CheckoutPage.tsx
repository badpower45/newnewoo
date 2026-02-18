import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { ArrowLeft, MapPin, Loader, CheckCircle, Tag, X, Map, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SubstitutionSelector from '../components/SubstitutionSelector';
import SavedAddressSelector from '../components/SavedAddressSelector';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { API_URL, PAYMENT_METHOD_LABELS } from '../src/config';
import { useToast } from '../components/Toast';
import { extractCoordinatesFromMapsLink, validateCoordinates, formatCoordinates } from '../utils/googleMapsHelper';
import { optimizeProductCardImage } from '../utils/imageOptimization';

// Constants
const MINIMUM_ORDER_AMOUNT = 200;
const FREE_SHIPPING_THRESHOLD = 600;

export default function CheckoutPage() {
    const { items, totalPrice, serviceFee, finalTotal: cartFinalTotal, clearCart, updateQuantity, meetsMinimumOrder, loyaltyPointsEarned } = useCart();
    const { user, loginAsGuest } = useAuth();
    const { selectedBranch } = useBranch();
    const navigate = useNavigate();
    const { showToast, ToastContainer } = useToast();
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const isPickup = paymentMethod === 'branch_pickup';

    // State for Location
    const [locationCoords, setLocationCoords] = useState<{ lat: number, lng: number } | null>(null);
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

    // 🔒 Prevent duplicate order submission
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for Loyalty Barcode
    const [barcodeInput, setBarcodeInput] = useState('');
    const [appliedBarcode, setAppliedBarcode] = useState<any>(null);
    const [barcodeDiscount, setBarcodeDiscount] = useState(0);
    const [barcodeError, setBarcodeError] = useState('');
    const [isValidatingBarcode, setIsValidatingBarcode] = useState(false);
    const [unavailableContactMethod, setUnavailableContactMethod] = useState('phone');

    // Final total with service fee (in cartFinalTotal) + delivery fee - discounts
    const finalTotal = cartFinalTotal + deliveryFee - couponDiscount - barcodeDiscount;
    const needsUnavailableContact = items.some((item) => {
        const pref = item.substitutionPreference || 'none';
        return pref === 'none' || pref === 'contact' || pref === 'call_me';
    });

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        building: '',
        street: '',
        floor: '',
        apartment: '',
        address: '',
        governorate: '', // إضافة المحافظة
        notes: '',
        googleMapsLink: ''
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

    // Fetch active governorates from API
    const [governorateOptions, setGovernorateOptions] = useState<string[]>([]);
    useEffect(() => {
        const fetchGovernorates = async () => {
            try {
                const res = await fetch(`${API_URL}/delivery-fees/governorates/active`);
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setGovernorateOptions(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch governorates:', err);
                // Fallback list
                setGovernorateOptions(['بورسعيد', 'بور فؤاد', 'القاهرة', 'الجيزة', 'الإسكندرية']);
            }
        };
        fetchGovernorates();
    }, []);

    // Calculate delivery fee when branch, total, or governorate changes (skip for branch pickup)
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
                // إذا المستخدم اختار محافظة، نستخدم رسوم المحافظة
                if (formData.governorate && formData.governorate.trim()) {
                    const response = await fetch(`${API_URL}/delivery-fees/calculate-by-governorate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            governorate: formData.governorate.trim(),
                            subtotal: totalPrice
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setDeliveryFee(data.deliveryFee || 0);
                        setFreeDelivery(data.freeDelivery || false);
                        setDeliveryMessage(data.message || '');
                        setCanDeliver(data.canDeliver !== false);
                        return;
                    }
                }

                // القيم الافتراضية إذا لم يتم اختيار محافظة
                const baseFee = totalPrice >= 600 ? 0 : 20;
                setDeliveryFee(baseFee);
                setFreeDelivery(baseFee === 0);
                setDeliveryMessage(baseFee === 0 ? 'الشحن مجاني للطلبات فوق 600 جنيه' : 'رسوم التوصيل 20 جنيه للطلبات أقل من 600');
                setCanDeliver(true);
            } catch (err) {
                console.error('Failed to calculate delivery fee:', err);
                const fallback = totalPrice >= 600 ? 0 : 20;
                setDeliveryFee(fallback);
                setFreeDelivery(fallback === 0);
                setDeliveryMessage(fallback === 0 ? 'الشحن مجاني للطلبات فوق 600 جنيه' : 'رسوم التوصيل 20 جنيه');
                setCanDeliver(true);
            }
        };

        calculateDeliveryFee();
    }, [selectedBranch, totalPrice, locationCoords, isPickup, formData.governorate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-extract coordinates when Google Maps link is entered
        if (name === 'googleMapsLink' && value.trim()) {
            const coords = extractCoordinatesFromMapsLink(value);
            if (coords && validateCoordinates(coords)) {
                setLocationCoords(coords);
                setLocationError('');
            } else if (value.includes('google.com/maps') || value.includes('maps.app.goo.gl')) {
                setLocationError('لم نتمكن من استخراج الإحداثيات من هذا الرابط');
            }
        }
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
            const errorMessage = err?.message || 'فشل التحقق من الكوبون، حاول مرة أخرى';
            setCouponError(errorMessage);
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

    // --- Function: Validate and Apply Barcode ---
    const handleApplyBarcode = async () => {
        if (!barcodeInput.trim()) {
            setBarcodeError('يرجى إدخال رمز الباركود');
            return;
        }

        setIsValidatingBarcode(true);
        setBarcodeError('');

        try {
            console.log('🔍 Validating barcode:', barcodeInput.trim());
            const result = await api.loyaltyBarcode.validate(barcodeInput.trim());
            console.log('📦 Barcode validation result:', result);

            if (!result || !result.valid) {
                const errorMsg = result?.message || result?.error || 'الباركود غير صالح';
                setBarcodeError(errorMsg);
                setAppliedBarcode(null);
                setBarcodeDiscount(0);
                showToast(errorMsg, 'error');
                return;
            }

            // Apply the barcode discount
            const barcodeData = result.barcode;
            const discount = Number(barcodeData?.monetary_value ?? barcodeData?.value ?? 0) || 0;

            setAppliedBarcode(barcodeData);
            setBarcodeDiscount(discount);
            showToast(`✅ تم تطبيق باركود بقيمة ${discount} جنيه`, 'success');

        } catch (error: any) {
            console.error('❌ Barcode validation error:', error);
            const errorMsg = error.message || 'فشل التحقق من الباركود';
            setBarcodeError(errorMsg);
            setAppliedBarcode(null);
            setBarcodeDiscount(0);
            showToast(errorMsg, 'error');
        } finally {
            setIsValidatingBarcode(false);
        }
    };

    // --- Function: Remove Barcode ---
    const handleRemoveBarcode = () => {
        setAppliedBarcode(null);
        setBarcodeDiscount(0);
        setBarcodeInput('');
        setBarcodeError('');
        showToast('تم إزالة الباركود', 'info');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🔒 Prevent duplicate submissions
        if (isSubmitting) {
            console.log('⚠️ Order already being submitted, ignoring duplicate click');
            return;
        }

        // Check minimum order amount
        if (totalPrice < MINIMUM_ORDER_AMOUNT) {
            showToast(`الحد الأدنى للطلب هو ${MINIMUM_ORDER_AMOUNT} جنيه`, 'error');
            return;
        }

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

        // Require full address details if ليس استلام
        if (!isPickup) {
            const requiredFields = [
                { key: 'firstName', label: 'الاسم الأول' },
                { key: 'lastName', label: 'الاسم الأخير' },
                { key: 'phone', label: 'رقم الهاتف' },
                { key: 'building', label: 'اسم العمارة / المبنى' },
                { key: 'street', label: 'اسم الشارع' },
                { key: 'address', label: 'العنوان' },
            ];
            const missing = requiredFields.find(f => !String((formData as any)[f.key] || '').trim());
            if (missing) {
                showToast(`يرجى إدخال ${missing.label}`, 'warning');
                return;
            }
        }

        let currentUserId = user?.id;

        if (!currentUserId) {
            showToast('يرجى تسجيل الدخول لإتمام الطلب', 'warning');
            navigate('/login');
            return;
        }

        try {
            // Verify availability for each cart item at selected branch
            // Stock validation + unavailable items list (single API call)
            const unavailableItems: any[] = [];
            try {
                const res = await api.branchProducts.getByBranch(branchId);
                const list = res.data || res || [];
                for (const item of items) {
                    const bp = list.find((x: any) => String(x.product_id ?? x.productId ?? x.id) === String(item.id));
                    if (!bp || !bp.is_available) {
                        unavailableItems.push({
                            productId: item.id,
                            productName: item.name || (item as any).title || `المنتج #${item.id}`,
                            reason: 'غير متاح في المخزون',
                            substitutionPreference: item.substitutionPreference || 'call_me'
                        });
                        continue;
                    }
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
            } catch (e) {
                console.error('Failed availability check', e);
            }

            const orderData = {
                userId: currentUserId,
                branchId: branchId,
                total: finalTotal, // Includes service fee and coupon discount
                paymentMethod: paymentMethod,
                deliveryAddress: isPickup
                    ? 'استلام من الفرع'
                    : `${formData.firstName} ${formData.lastName}, ${formData.phone}, ${formData.building}, ${formData.street}, ${formData.address}`,
                googleMapsLink: isPickup ? null : (formData.googleMapsLink || null),
                deliveryLatitude: isPickup ? null : (locationCoords?.lat || null),
                deliveryLongitude: isPickup ? null : (locationCoords?.lng || null),
                unavailableItems: unavailableItems, // إضافة قائمة المنتجات غير المتاحة
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
                // إضافة معلومات الباركود
                barcodeCode: appliedBarcode ? appliedBarcode.barcode : null,
                barcodeId: appliedBarcode ? appliedBarcode.id : null,
                barcodeDiscount: barcodeDiscount,
                unavailableContactMethod: needsUnavailableContact ? unavailableContactMethod : null,
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
            setIsSubmitting(true); // 🔒 Lock to prevent duplicate submissions

            // إذا كان الدفع بالبطاقة عبر Paymob - معطل مؤقتًا
            /* if (paymentMethod === 'paymob_card') {
                console.log('💳 Initiating Paymob payment...');
                
                // إنشاء الطلب أولاً
                const created = await api.orders.create(orderData);
                console.log('✅ Order created:', created);
                
                const createdOrder = (created && (created.data || created)) || {};
                const newOrderId = createdOrder.id || createdOrder.orderId;
                
                if (!newOrderId) {
                    throw new Error('فشل إنشاء الطلب');
                }

                // تجهيز بيانات الدفع
                const paymentData = {
                    orderId: newOrderId,
                    orderData: {
                        amount: finalTotal,
                        total: finalTotal,
                        items: items.map(item => ({
                            name: item.name || (item as any).title,
                            amount_cents: Math.round((item.price || 0) * 100),
                            description: `الكمية: ${item.quantity}`,
                            quantity: item.quantity
                        })),
                        delivery_needed: !isPickup
                    },
                    customerData: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: user?.email || `customer${newOrderId}@allosh.com`,
                        phone: formData.phone,
                        building: formData.building,
                        street: formData.street,
                        governorate: formData.governorate || 'Cairo'
                    }
                };

                // إرسال طلب الدفع
                const paymentResult = await api.post('/payment/initialize', paymentData);
                
                if (paymentResult.data.success && paymentResult.data.payment_url) {
                    // مسح السلة والتوجه لصفحة الدفع
                    clearCart();
                    showToast('جاري توجيهك لصفحة الدفع...', 'info');
                    
                    // Redirect to Paymob payment page
                    window.location.href = paymentResult.data.payment_url;
                } else {
                    throw new Error(paymentResult.data.error || 'فشل إنشاء عملية الدفع');
                }
                return; // إيقاف التنفيذ هنا
            } */

            // الطرق الأخرى (COD, Branch Pickup, Visa on Delivery)
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
        } finally {
            setIsSubmitting(false); // 🔓 Release lock even on error
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
        <div className="min-h-screen bg-gray-50">
            <ToastContainer />

            {/* Fixed App Bar */}
            <div className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/cart" className="flex items-center gap-2 text-slate-700 hover:text-brand-orange transition-colors">
                            <ArrowLeft size={20} className="" />
                            <span className="font-medium hidden md:inline">العودة للسلة</span>
                        </Link>

                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">إتمام الطلب</h1>

                        {selectedBranch && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin size={16} className="text-brand-orange" />
                                <span className="hidden md:inline font-medium text-gray-700">{selectedBranch.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form */}
                    <div className="flex-1 space-y-6">
                        {/* Delivery Details */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{isPickup ? 'تفاصيل الاستلام من الفرع' : 'تفاصيل التوصيل'}</h3>
                            {isPickup && (
                                <p className="text-sm text-green-700 mb-4">لا نحتاج عنوان؛ فقط الاسم ورقم الهاتف، وسيتم تجهيز الطلب في الفرع المحدد.</p>
                            )}

                            {/* Saved Addresses - Show only if NOT pickup */}
                            {!isPickup && user && (
                                <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-gray-900">العناوين المحفوظة</h4>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/addresses')}
                                            className="text-sm text-purple-600 hover:underline font-medium"
                                        >
                                            إدارة العناوين
                                        </button>
                                    </div>
                                    <SavedAddressSelector
                                        userId={user.id}
                                        onSelect={(address: any) => {
                                            const fullAddressLine = [
                                                address.city,
                                                address.governorate
                                            ].filter(Boolean).join(', ');

                                            setFormData(prev => ({
                                                ...prev,
                                                phone: address.phone || prev.phone,
                                                building: address.address_line1 || prev.building,
                                                street: address.address_line2 || prev.street,
                                                address: fullAddressLine || address.address_line1 || prev.address,
                                                governorate: address.governorate || prev.governorate,
                                                notes: address.address_line2 ? `${address.address_line2}${address.postal_code ? ` - ${address.postal_code}` : ''}` : prev.notes
                                            }));
                                        }}
                                    />
                                </div>
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

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">المحافظة <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        name="governorate"
                                        value={formData.governorate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all bg-white"
                                    >
                                        <option value="">اختر المحافظة</option>
                                        {governorateOptions.map((gov) => (
                                            <option key={gov} value={gov}>{gov}</option>
                                        ))}
                                    </select>
                                    {formData.governorate && (
                                        <p className="text-xs text-gray-500">
                                            {formData.governorate === 'بورسعيد' && '🚚 رسوم التوصيل: 25 جنيه'}
                                            {formData.governorate === 'بور فؤاد' && '🚚 رسوم التوصيل: 30 جنيه'}
                                            {!['بورسعيد', 'بور فؤاد'].includes(formData.governorate) && '🚚 رسوم التوصيل: 20 جنيه'}
                                            {totalPrice >= 600 && ' (مجاني للطلبات فوق 600 جنيه)'}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">اسم العمارة / المبنى <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            name="building"
                                            value={formData.building}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                            placeholder="مثال: برج النخيل"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">اسم الشارع <span className="text-red-500">*</span></label>
                                        <input
                                            required
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
                                        <label className="text-sm font-bold text-slate-700">الدور <span className="text-gray-400 font-normal">(اختياري)</span></label>
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
                                        <label className="text-sm font-bold text-slate-700">الشقة <span className="text-gray-400 font-normal">(اختياري)</span></label>
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
                                        <span>تفاصيل العنوان الإضافية <span className="text-red-500">*</span></span>
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
                                        required
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

                                {/* Google Maps Link Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Map size={16} className="text-blue-600" />
                                        <span>رابط جوجل مابس (اختياري)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="googleMapsLink"
                                        value={formData.googleMapsLink}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${isPickup ? 'border-dashed border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-200'} focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                                        placeholder={isPickup ? 'غير مطلوب للاستلام من الفرع' : 'https://www.google.com/maps?q=30.0444,31.2357'}
                                        disabled={isPickup}
                                    />
                                    {!isPickup && (
                                        <p className="text-xs text-slate-500">
                                            💡 الصق رابط موقعك من جوجل مابس ليسهل على المندوب الوصول إليك
                                        </p>
                                    )}
                                    {locationCoords && formData.googleMapsLink && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
                                            <p className="text-green-700 font-medium mb-1">✓ تم استخراج الإحداثيات بنجاح</p>
                                            <p className="text-green-600">
                                                📍 {formatCoordinates(locationCoords)}
                                            </p>
                                        </div>
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
                                {/* Cash on Delivery */}
                                <label className={`flex items-center p-4 border-2 rounded-xl transition ${!isPickup ? 'cursor-pointer hover:border-green-600' : 'opacity-50 cursor-not-allowed'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        disabled={isPickup}
                                        className="w-5 h-5 text-green-600"
                                    />
                                    <div className="mr-3">
                                        <div className="font-medium">{PAYMENT_METHOD_LABELS.cod}</div>
                                        <div className="text-sm text-slate-500">ادفع نقداً عند استلام الطلب</div>
                                    </div>
                                </label>

                                {/* Visa on Delivery */}
                                <label className={`flex items-center p-4 border-2 rounded-xl transition ${!isPickup ? 'cursor-pointer hover:border-green-600' : 'opacity-50 cursor-not-allowed'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="visa"
                                        checked={paymentMethod === 'visa'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        disabled={isPickup}
                                        className="w-5 h-5 text-green-600"
                                    />
                                    <div className="mr-3">
                                        <div className="font-medium">{PAYMENT_METHOD_LABELS.visa}</div>
                                        <div className="text-sm text-slate-500">سيحضر مندوب التوصيل بماكينة الفيزا</div>
                                    </div>
                                </label>

                                {/* Branch Pickup */}
                                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${isPickup ? 'border-green-600 bg-green-50' : 'hover:border-green-600'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="branch_pickup"
                                        checked={paymentMethod === 'branch_pickup'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-5 h-5 text-green-600"
                                    />
                                    <div className="mr-3">
                                        <div className="font-medium">{PAYMENT_METHOD_LABELS.branch_pickup}</div>
                                        <div className="text-sm text-slate-500">احضر للفرع وادفع عند الاستلام</div>
                                    </div>
                                </label>

                                {/* Online Card Payment - Paymob (hidden) */}

                                {/* Fawry - Coming Soon */}
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
                                {needsUnavailableContact && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            طريقة التواصل في حالة عدم توفر المنتج
                                        </label>
                                        <select
                                            value={unavailableContactMethod}
                                            onChange={(e) => setUnavailableContactMethod(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="phone">اتصال هاتفي</option>
                                            <option value="whatsapp">واتساب</option>
                                            <option value="sms">رسالة SMS</option>
                                            <option value="any">أي وسيلة متاحة</option>
                                        </select>
                                        <p className="text-xs text-slate-500 mt-2">نستخدمها لو المنتج مش متوفر ونحتاج نرجع لك بسرعة.</p>
                                    </div>
                                )}
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                                        <img src={optimizeProductCardImage(item.image)} alt={item.name} loading="lazy" className="w-16 h-16 object-cover rounded-lg" />
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
                            <div className={`p-4 rounded-xl mb-4 ${freeDelivery ? 'bg-green-50 text-green-700' :
                                    !canDeliver ? 'bg-red-50 text-red-700' :
                                        'bg-blue-50 text-blue-700'
                                }`}>
                                <p className="text-sm font-medium text-center">{deliveryMessage}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={(!isPickup && !canDeliver) || !meetsMinimumOrder || isSubmitting}
                            className={`w-full font-bold py-4 rounded-xl transition-colors shadow-lg ${(!isPickup && !canDeliver) || !meetsMinimumOrder || isSubmitting
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader size={18} className="animate-spin" />
                                    جاري إنشاء الطلب...
                                </span>
                            ) : (!isPickup && !canDeliver) ? 'لا يمكن إتمام الطلب'
                                : !meetsMinimumOrder
                                    ? 'الحد الأدنى 200 جنيه'
                                    : `تأكيد الطلب (${finalTotal.toFixed(2)} جنيه)`}
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

                            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-purple-800 font-semibold">ستربح {loyaltyPointsEarned} نقطة من هذا الطلب</div>
                                    <Gift size={18} className="text-purple-600" />
                                </div>
                                {(!user || user.isGuest) && (
                                    <p className="text-xs text-purple-700 mt-2">سجّل دخولك ليتم حفظ نقاطك تلقائياً واستخدامها كخصومات لاحقاً.</p>
                                )}
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

                            {/* مربع الباركود */}
                            <div className="mb-4 border-t border-slate-200 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-700">باركود الولاء</label>
                                </div>
                                {!appliedBarcode ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={barcodeInput}
                                                onChange={(e) => setBarcodeInput(e.target.value.toUpperCase())}
                                                onKeyPress={(e) => e.key === 'Enter' && handleApplyBarcode()}
                                                placeholder="أدخل رمز الباركود"
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm font-mono"
                                            />
                                            <button
                                                onClick={handleApplyBarcode}
                                                disabled={isValidatingBarcode || !barcodeInput.trim()}
                                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-sm font-medium"
                                            >
                                                {isValidatingBarcode ? (
                                                    <Loader size={16} className="animate-spin" />
                                                ) : (
                                                    <CheckCircle size={16} />
                                                )}
                                                تطبيق
                                            </button>
                                        </div>
                                        {barcodeError && (
                                            <p className="text-xs text-red-600">{barcodeError}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={16} className="text-orange-600" />
                                                <div>
                                                    <p className="text-sm font-bold text-orange-900 font-mono">{appliedBarcode.barcode}</p>
                                                    <p className="text-xs text-orange-700">{appliedBarcode.monetary_value || 0} جنيه</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleRemoveBarcode}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="إزالة الباركود"
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
                                    <span>Service Tax</span>
                                    <span>{serviceFee.toFixed(2)} EGP</span>
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
                                {barcodeDiscount > 0 && (
                                    <div className="flex justify-between items-center text-sm text-orange-600 font-medium">
                                        <span>Barcode Discount</span>
                                        <span>-{(Number(barcodeDiscount) || 0).toFixed(2)} EGP</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="font-bold text-slate-800">Total</span>
                                    <span className="font-bold text-xl text-primary">{(finalTotal).toFixed(2)} EGP</span>
                                </div>
                                {!meetsMinimumOrder && (
                                    <p className="text-xs text-red-600 pt-1">الحد الأدنى للطلب 200 جنيه - أضف منتجات أكثر لإكمال الطلب</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
