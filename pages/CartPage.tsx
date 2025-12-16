import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';
import Footer from '../components/Footer';
import { api } from '../services/api';

const CartPage = () => {
    const navigate = useNavigate();
    const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const { selectedBranch } = useBranch();
    const [deliveryFee, setDeliveryFee] = useState(20);
    const [freeDelivery, setFreeDelivery] = useState(false);

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
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-8">
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
                                <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-2">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-2">
                                            <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{item.title}</h3>
                                            <p className="text-sm text-gray-500">{item.weight}</p>
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
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-colors"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary text-lg">{(item.price * item.quantity).toFixed(2)} <span className="text-xs text-gray-500">EGP</span></p>
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
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{totalPrice.toFixed(2)} EGP</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span className={freeDelivery ? 'text-green-600 font-bold' : ''}>
                                        {freeDelivery ? 'FREE! 🎉' : `${deliveryFee.toFixed(2)} EGP`}
                                    </span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                    <span>Total</span>
                                    <span>{(totalPrice + deliveryFee).toFixed(2)} EGP</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-primary text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition-colors"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CartPage;
