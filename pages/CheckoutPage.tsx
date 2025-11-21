import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        clearCart();
    };

    if (isSubmitted) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-50 p-6 rounded-full">
                        <CheckCircle size={64} className="text-green-500" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-brand-brown mb-4">تم استلام طلبك بنجاح! 🚀</h2>
                <p className="text-slate-500 mb-8 text-lg">شكراً لثقتك في لومينا فريش ماركت. هنتواصل معاك قريب جداً لتأكيد الطلب.</p>
                <Link to="/" className="inline-block bg-brand-brown text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-orange transition-colors">
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-slate-500 mb-4">لا توجد منتجات لإتمام الشراء.</p>
                <Link to="/products" className="text-brand-orange font-bold hover:underline">تصفح المنتجات</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <Link to="/cart" className="inline-flex items-center text-slate-500 hover:text-brand-orange mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> العودة للسلة
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold text-brand-brown mb-8">إتمام الشراء</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form */}
                <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">بيانات التوصيل</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">الاسم الأول</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all" placeholder="مثال: أحمد" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">الاسم الأخير</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all" placeholder="مثال: محمد" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">رقم الموبايل</label>
                            <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all" placeholder="01xxxxxxxxx" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">العنوان بالتفصيل</label>
                            <textarea required rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all" placeholder="اسم الشارع، رقم العمارة، الدور، الشقة..."></textarea>
                        </div>

                        <button type="submit" className="w-full bg-brand-brown text-white font-bold py-4 rounded-xl hover:bg-brand-orange transition-colors shadow-lg shadow-orange-200 mt-4">
                            تأكيد الطلب ({totalPrice} ج.م)
                        </button>
                    </form>
                </div>

                {/* Order Summary (Mini) */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">ملخص الطلب</h3>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{item.name} <span className="text-xs text-slate-400">x{item.quantity}</span></span>
                                    <span className="font-bold text-slate-800">{item.price * item.quantity} ج.م</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                            <span className="font-bold text-slate-800">الإجمالي</span>
                            <span className="font-bold text-xl text-brand-orange">{totalPrice} ج.م</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
