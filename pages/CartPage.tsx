import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-orange-50 p-6 rounded-full">
                        <ShoppingBag size={64} className="text-brand-orange opacity-50" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">سلتك فاضية!</h2>
                <p className="text-slate-500 mb-8">يلا نملاها بحاجات فريش ولذيذة.</p>
                <Link to="/products" className="inline-block bg-brand-brown text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-orange transition-colors">
                    تصفح المنتجات
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-brown mb-8">سلة المشتريات ({totalItems} منتج)</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500 mb-3">{item.weight}</p>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 px-2 h-8">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-1 text-slate-500 hover:text-brand-orange transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 text-slate-500 hover:text-brand-orange transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <span className="font-bold text-brand-orange">{item.price * item.quantity} ج.م</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96 flex-shrink-0">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">ملخص الطلب</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-slate-600">
                                <span>المجموع الفرعي</span>
                                <span>{totalPrice} ج.م</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>التوصيل</span>
                                <span className="text-green-600 font-bold">مجاني</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-slate-800">الإجمالي</span>
                                <span className="font-bold text-xl text-brand-orange">{totalPrice} ج.م</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">شامل الضريبة</p>
                        </div>

                        <Link to="/checkout" className="block w-full bg-brand-brown text-white text-center font-bold py-4 rounded-xl hover:bg-brand-orange transition-colors shadow-lg shadow-orange-200">
                            إتمام الشراء
                        </Link>

                        <Link to="/products" className="block w-full text-center text-slate-500 font-bold py-4 mt-2 hover:text-brand-brown transition-colors text-sm">
                            العودة للتسوق
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
