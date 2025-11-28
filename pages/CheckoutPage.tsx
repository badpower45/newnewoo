import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DeliverySlotPicker from '../components/DeliverySlotPicker';
import SubstitutionSelector from '../components/SubstitutionSelector';
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
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBranch) {
            showToast('يرجى اختيار فرع أولاً', 'warning');
            return;
        }

        if (!selectedSlot) {
            showToast('يرجى اختيار موعد توصيل', 'warning');
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
                const res = await api.branchProducts.getByBranch(selectedBranch.id);
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
                branchId: selectedBranch.id,
                deliverySlotId: selectedSlot.id,
                paymentMethod: paymentMethod,
                deliveryAddress: `${formData.firstName} ${formData.lastName}, ${formData.phone}, ${formData.address}`,
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    substitutionPreference: item.substitutionPreference || 'none'
                }))
            };

            const created = await api.orders.create(orderData);
            const createdOrder = (created && (created.data || created)) || {};
            const newOrderId = createdOrder.id || createdOrder.orderId;

            clearCart();
            if (newOrderId) {
                navigate(`/order-confirmation/${newOrderId}`);
            } else {
                // Fallback: go to profile orders if ID missing
                navigate('/profile');
            }
        } catch (err: any) {
            console.error("Failed to create order", err);
            showToast(err.response?.data?.error || 'فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.', 'error');
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
                        <h3 className="text-xl font-bold text-slate-800 mb-6">تفاصيل التوصيل</h3>
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
                            <label className="text-sm font-bold text-slate-700">تفاصيل العنوان</label>
                            <textarea
                                required
                                rows={3}
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                placeholder="اسم الشارع، رقم المبنى، الدور، الشقة..."
                            ></textarea>
                        </div>
                        </form>
                    </div>

                    {/* Delivery Slot */}
                    {selectedBranch && (
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                            <DeliverySlotPicker
                                branchId={selectedBranch.id}
                                onSelect={setSelectedSlot}
                                selectedSlotId={selectedSlot?.id}
                            />
                        </div>
                    )}

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

                    <button 
                        onClick={handleSubmit} 
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
                    >
                        تأكيد الطلب ({(totalPrice + 20).toFixed(2)} جنيه)
                    </button>
                </div>

                {/* Order Summary (Mini) */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h3>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{item.title} <span className="text-xs text-slate-400">x{item.quantity}</span></span>
                                    <span className="font-bold text-slate-800">{(item.price * item.quantity).toFixed(2)} EGP</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-slate-200 pt-4 space-y-2">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{totalPrice.toFixed(2)} EGP</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Delivery</span>
                                <span>20.00 EGP</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="font-bold text-slate-800">Total</span>
                                <span className="font-bold text-xl text-primary">{(totalPrice + 20).toFixed(2)} EGP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
