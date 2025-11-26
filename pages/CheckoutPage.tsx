import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { user, loginAsGuest } = useAuth();
    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let currentUserId = user?.id;

        if (!currentUserId) {
            // Auto-login as guest if not logged in
            const guestUser = loginAsGuest();
            if (guestUser) {
                currentUserId = guestUser.id;
            } else {
                alert("Please login to place an order.");
                return;
            }
        }

        try {
            await api.orders.create({
                userId: currentUserId,
                total: totalPrice + 20, // Including delivery
                items: items,
                shippingDetails: formData
            });
            setIsSubmitted(true);
            clearCart();
        } catch (err) {
            console.error("Failed to create order", err);
            alert("Failed to place order. Please try again.");
        }
    };

    if (isSubmitted) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-50 p-6 rounded-full">
                        <CheckCircle size={64} className="text-green-500" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-brand-brown mb-4">Order Received Successfully! 🚀</h2>
                <p className="text-slate-500 mb-8 text-lg">Thank you for trusting Lumina Fresh Market. We will contact you shortly to confirm.</p>
                <Link to="/" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-colors">
                    Back to Home
                </Link>
            </div>
        );
    }

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
            <Link to="/cart" className="inline-flex items-center text-slate-500 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Cart
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form */}
                <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Delivery Details</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">First Name</label>
                                <input
                                    required
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                    placeholder="e.g. Ahmed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Last Name</label>
                                <input
                                    required
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                    placeholder="e.g. Mohamed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Phone Number</label>
                            <input
                                required
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                placeholder="01xxxxxxxxx"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Address Details</label>
                            <textarea
                                required
                                rows={3}
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                placeholder="Street name, Building number, Floor, Apartment..."
                            ></textarea>
                        </div>

                        <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-orange-200 mt-4">
                            Confirm Order ({(totalPrice + 20).toFixed(2)} EGP)
                        </button>
                    </form>
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
