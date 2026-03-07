import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { ArrowLeft, MapPin, Loader, CheckCircle, Tag, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SubstitutionSelector from '../components/SubstitutionSelector';
import SavedAddressSelector from '../components/SavedAddressSelector';
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

    // Toggle address form
    const [showAddressForm, setShowAddressForm] = useState(false);

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
            <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" dir="rtl">
                <MapPin size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-6 text-lg">لا توجد منتجات في السلة</p>
                <Link to="/products" className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition">
                    تصفح المنتجات
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
            <ToastContainer />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
                <div className="flex items-center px-4 py-4 max-w-lg mx-auto w-full">
                    <Link to="/cart" className="p-2 rounded-full hover:bg-gray-100 transition">
                        <ArrowLeft size={20} className="text-gray-700" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">Checkout</h1>
                    <div className="w-9" />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 pb-40 max-w-lg mx-auto w-full">

                {/* Map Section */}
                <div className="w-full h-44 bg-gray-100 relative overflow-hidden">
                    {locationCoords ? (
                        <iframe
                            className="w-full h-full border-0"
                            src={`https://www.google.com/maps?q=${locationCoords.lat},${locationCoords.lng}&z=15&output=embed`}
                            loading="lazy"
                            title="Delivery Location"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                            <MapPin size={36} className="text-orange-400 mb-2" />
                            <p className="text-sm text-gray-500 font-medium">موقع التوصيل</p>
                            <button
                                onClick={handleGetLocation}
                                disabled={isLoadingLocation}
                                className="mt-2 text-xs text-orange-500 hover:underline font-semibold disabled:opacity-60"
                            >
                                {isLoadingLocation ? (
                                    <span className="flex items-center gap-1"><Loader size={12} className="animate-spin" /> جاري التحديد...</span>
                                ) : '📍 تحديد موقعي الحالي'}
                            </button>
                            {locationError && <p className="text-xs text-red-500 mt-1">{locationError}</p>}
                        </div>
                    )}
                </div>

                <div className="px-4 py-4 space-y-4">

                    {/* Address Card - Dropdown */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <MapPin size={14} className="text-orange-500" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">عنوان التوصيل</span>
                            {user && (
                                <button type="button" onClick={() => navigate('/addresses')} className="mr-auto text-xs text-orange-500 hover:underline">
                                    + إضافة عنوان
                                </button>
                            )}
                        </div>

                        {user ? (
                            <SavedAddressSelector userId={user.id} onSelect={(address: any) => {
                                const fullAddressLine = [address.city, address.governorate].filter(Boolean).join(', ');
                                setFormData(prev => ({
                                    ...prev,
                                    phone: address.phone || prev.phone,
                                    building: address.address_line1 || prev.building,
                                    street: address.address_line2 || prev.street,
                                    address: fullAddressLine || address.address_line1 || prev.address,
                                    governorate: address.governorate || prev.governorate,
                                    notes: address.address_line2 ? `${address.address_line2}${address.postal_code ? ` - ${address.postal_code}` : ''}` : prev.notes
                                }));
                            }} />
                        ) : (
                            <p className="text-xs text-gray-500 text-center py-2">سجّل دخولك لاستخدام العناوين المحفوظة</p>
                        )}

                        {/* Show selected address summary */}
                        {formData.building && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-600 font-medium">
                                    📍 {formData.building}{formData.governorate ? ` - ${formData.governorate}` : ''}
                                </p>
                                {formData.street && <p className="text-xs text-gray-400 mt-0.5">{formData.street}</p>}
                                {formData.phone && <p className="text-xs text-gray-500 mt-0.5">📱 {formData.phone}</p>}
                            </div>
                        )}

                        {/* Manual form toggle for guests or adding new */}
                        <button
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="mt-3 w-full text-center text-xs text-gray-400 hover:text-orange-500 transition"
                        >
                            {showAddressForm ? '▲ إخفاء النموذج' : '✏️ إدخال عنوان يدوياً'}
                        </button>
                    </div>

                    {/* Manual Address Form (collapsible) */}
                    {showAddressForm && (
                        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-4 space-y-4">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">تفاصيل التوصيل</h3>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">الاسم الأول</label>
                                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" placeholder="أحمد" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">الاسم الأخير</label>
                                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" placeholder="محمد" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الهاتف</label>
                                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" placeholder="01xxxxxxxxx" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">المحافظة <span className="text-red-500">*</span></label>
                                    <select required name="governorate" value={formData.governorate} onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm bg-white">
                                        <option value="">اختر المحافظة</option>
                                        {governorateOptions.map((gov) => <option key={gov} value={gov}>{gov}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">العمارة / المبنى <span className="text-red-500">*</span></label>
                                        <input required type="text" name="building" value={formData.building} onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" placeholder="برج النخيل" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">الشارع <span className="text-red-500">*</span></label>
                                        <input required type="text" name="street" value={formData.street} onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" placeholder="شارع التحرير" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">الدور</label>
                                        <input type="text" name="floor" value={formData.floor} onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" placeholder="3" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">الشقة</label>
                                        <input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" placeholder="شقة 5" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1 flex justify-between">
                                        <span>تفاصيل إضافية <span className="text-red-500">*</span></span>
                                        <button type="button" onClick={handleGetLocation} disabled={isLoadingLocation}
                                            className="text-xs text-orange-500 hover:underline font-normal disabled:opacity-60">
                                            {isLoadingLocation ? '...' : locationCoords ? '✓ تم التحديد' : '📍 موقعي'}
                                        </button>
                                    </label>
                                    <textarea required rows={2} name="address" value={formData.address} onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm resize-none"
                                        placeholder="علامة مميزة أو تفاصيل إضافية..." />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات التوصيل</label>
                                    <textarea rows={2} name="notes" value={formData.notes} onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm resize-none"
                                        placeholder="مثال: اتصل قبل الوصول..." />
                                </div>

                                <button type="button" onClick={() => setShowAddressForm(false)}
                                    className="w-full bg-orange-500 text-white font-bold py-3 rounded-full hover:bg-orange-600 transition text-sm">
                                    حفظ العنوان
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">المنتجات ({items.length})</h4>
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0">
                                    <img src={optimizeProductCardImage(item.image)} alt={item.name} loading="lazy" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">x{item.quantity} • {((item.price || 0) * item.quantity).toFixed(2)} ج.م</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery message */}
                    {deliveryMessage && (
                        <div className={`p-3 rounded-xl text-xs font-medium text-center ${freeDelivery ? 'bg-green-50 text-green-700' : !canDeliver ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                            {deliveryMessage}
                        </div>
                    )}

                    {/* Pay with */}
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-3 px-1">Pay with</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                            {/* Cash */}
                            <label className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition">
                                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-5 h-5 accent-orange-500 flex-shrink-0" />
                                <span className="text-lg flex-shrink-0">💵</span>
                                <span className="text-sm font-medium text-gray-700">cash</span>
                            </label>
                            {/* Branch Pickup */}
                            <label className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition">
                                <input type="radio" name="payment" value="branch_pickup" checked={paymentMethod === 'branch_pickup'} onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-5 h-5 accent-orange-500 flex-shrink-0" />
                                <span className="text-lg flex-shrink-0">🏪</span>
                                <span className="text-sm font-medium text-gray-700">استلام من الفرع</span>
                            </label>
                        </div>
                    </div>

                    {/* Coupons & Barcode (compact) */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                        <h4 className="text-sm font-bold text-gray-800">خصومات وكوبونات</h4>
                        {/* Coupon */}
                        {!appliedCoupon ? (
                            <div className="flex gap-2">
                                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                    placeholder="كود الكوبون" className="flex-1 px-3 py-2 rounded-full border border-gray-200 focus:border-orange-400 outline-none text-sm" />
                                <button onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode.trim()}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300 transition text-xs font-bold">
                                    {isValidatingCoupon ? <Loader size={14} className="animate-spin" /> : 'تطبيق'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-green-600" />
                                    <span className="text-sm font-bold text-green-900">{appliedCoupon.code}</span>
                                    <span className="text-xs text-green-600">-{couponDiscount.toFixed(2)} ج.م</span>
                                </div>
                                <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                            </div>
                        )}
                        {couponError && <p className="text-xs text-red-600">{couponError}</p>}

                        {/* Barcode */}
                        {!appliedBarcode ? (
                            <div className="flex gap-2">
                                <input type="text" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => e.key === 'Enter' && handleApplyBarcode()}
                                    placeholder="باركود الولاء" className="flex-1 px-3 py-2 rounded-full border border-gray-200 focus:border-orange-400 outline-none text-sm font-mono" />
                                <button onClick={handleApplyBarcode} disabled={isValidatingBarcode || !barcodeInput.trim()}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300 transition text-xs font-bold">
                                    {isValidatingBarcode ? <Loader size={14} className="animate-spin" /> : 'تطبيق'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-orange-500" />
                                    <span className="text-sm font-bold text-orange-900 font-mono">{appliedBarcode.barcode}</span>
                                    <span className="text-xs text-orange-600">-{(Number(barcodeDiscount) || 0).toFixed(2)} ج.م</span>
                                </div>
                                <button onClick={handleRemoveBarcode} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                            </div>
                        )}
                        {barcodeError && <p className="text-xs text-red-600">{barcodeError}</p>}
                    </div>

                    {/* Payment Summary */}
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-3 px-1">Payment summary</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Order amount</span>
                                <span className="text-sm text-gray-900 font-medium">{totalPrice.toFixed(2)} ج.م</span>
                            </div>
                            {serviceFee > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Service Tax</span>
                                    <span className="text-sm text-gray-900 font-medium">{serviceFee.toFixed(2)} ج.م</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Delivery Fee</span>
                                <span className={`text-sm font-medium ${freeDelivery ? 'text-green-600' : 'text-gray-900'}`}>
                                    {freeDelivery ? 'FREE' : `${deliveryFee.toFixed(2)} ج.م`}
                                </span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-green-600">Coupon Discount</span>
                                    <span className="text-sm text-green-600 font-medium">-{couponDiscount.toFixed(2)} ج.م</span>
                                </div>
                            )}
                            {barcodeDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-orange-600">Barcode Discount</span>
                                    <span className="text-sm text-orange-600 font-medium">-{(Number(barcodeDiscount) || 0).toFixed(2)} ج.م</span>
                                </div>
                            )}
                            {loyaltyPointsEarned > 0 && (
                                <div className="flex justify-between items-center text-purple-600">
                                    <span className="text-xs">نقاط الولاء المكتسبة 🎁</span>
                                    <span className="text-xs font-medium">{loyaltyPointsEarned} نقطة</span>
                                </div>
                            )}
                            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                                <span className="text-sm text-gray-700 font-semibold">Total Payment</span>
                                <span className="text-xl font-black text-gray-900">{finalTotal.toFixed(2)}</span>
                            </div>
                            {!meetsMinimumOrder && (
                                <p className="text-xs text-red-600 text-center">الحد الأدنى للطلب {MINIMUM_ORDER_AMOUNT} ج.م</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Fixed Bottom - Place Order */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 z-[110]">
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={(!isPickup && !canDeliver) || !meetsMinimumOrder || isSubmitting}
                        className="w-full bg-orange-500 text-white font-bold py-4 rounded-full hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base shadow-lg shadow-orange-200"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader size={18} className="animate-spin" />
                                جاري إنشاء الطلب...
                            </span>
                        ) : (!isPickup && !canDeliver) ? 'لا يمكن إتمام الطلب'
                            : !meetsMinimumOrder ? `الحد الأدنى ${MINIMUM_ORDER_AMOUNT} ج.م`
                            : 'Place order'}
                    </button>
                </div>
            </div>
        </div>
    );
}

