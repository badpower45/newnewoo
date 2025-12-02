import React from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, Package, Phone, AlertCircle, ArrowLeftRight } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

export default function ReturnPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-brown to-brand-orange py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <RefreshCw size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        الاستبدال والاسترجاع 🔄
                    </h1>
                    <p className="text-white/80 max-w-2xl mx-auto">
                        رضاك هو أولويتنا. تعرف على سياسة الاستبدال والاسترجاع الخاصة بنا
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={28} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">24 ساعة</h3>
                        <p className="text-gray-500 text-sm">مدة تقديم طلب الاسترجاع</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowLeftRight size={28} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">استبدال فوري</h3>
                        <p className="text-gray-500 text-sm">للمنتجات التالفة</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RefreshCw size={28} className="text-brand-orange" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">استرداد كامل</h3>
                        <p className="text-gray-500 text-sm">في حالة عدم توفر البديل</p>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {/* سياسة الاسترجاع */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center">
                                <RefreshCw size={20} className="text-brand-orange" />
                            </div>
                            <h2 className="text-xl font-bold text-brand-brown">سياسة الاسترجاع</h2>
                        </div>
                        <div className="space-y-4 text-gray-600">
                            <p>يمكنك طلب استرجاع المنتج في الحالات التالية:</p>
                            <ul className="space-y-3 mr-4">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                    <span>وصول منتج تالف أو منتهي الصلاحية</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                    <span>وصول منتج مختلف عن المطلوب</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                    <span>نقص في كمية المنتجات المطلوبة</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                    <span>مشكلة في جودة المنتج الطازج (خضار، فواكه، لحوم)</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* خطوات الاسترجاع */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Package size={20} className="text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-brand-brown">خطوات طلب الاسترجاع</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">التواصل معنا</h3>
                                    <p className="text-gray-600">اتصل بخدمة العملاء على 19999 أو من خلال الشات خلال 24 ساعة من استلام الطلب</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">شرح المشكلة</h3>
                                    <p className="text-gray-600">اشرح المشكلة وأرسل صورة للمنتج إن أمكن</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">مراجعة الطلب</h3>
                                    <p className="text-gray-600">سيتم مراجعة طلبك خلال ساعة واحدة</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-1">الاستبدال أو الاسترداد</h3>
                                    <p className="text-gray-600">سنقوم باستبدال المنتج أو إرجاع المبلغ حسب اختيارك</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* المنتجات غير القابلة للاسترجاع */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle size={20} className="text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-brand-brown">المنتجات غير القابلة للاسترجاع</h2>
                        </div>
                        <div className="space-y-3 text-gray-600">
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                                <XCircle size={18} className="text-red-500" />
                                <span>المنتجات التي تم فتحها أو استخدامها</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                                <XCircle size={18} className="text-red-500" />
                                <span>المنتجات المجمدة بعد استلامها (لأسباب صحية)</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                                <XCircle size={18} className="text-red-500" />
                                <span>منتجات العناية الشخصية بعد فتحها</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                                <XCircle size={18} className="text-red-500" />
                                <span>المنتجات بعد مرور 24 ساعة من الاستلام</span>
                            </div>
                        </div>
                    </section>

                    {/* استرداد المبلغ */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-brand-brown">طرق استرداد المبلغ</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-bold text-gray-800 mb-2">الدفع عند الاستلام</h3>
                                <p className="text-gray-600 text-sm">سيتم إضافة المبلغ كرصيد في حسابك لاستخدامه في طلبك القادم، أو تحويله على محفظتك الإلكترونية</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-bold text-gray-800 mb-2">الدفع الإلكتروني</h3>
                                <p className="text-gray-600 text-sm">سيتم استرداد المبلغ على نفس طريقة الدفع خلال 3-7 أيام عمل</p>
                            </div>
                        </div>
                    </section>

                    {/* ملاحظات مهمة */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <AlertCircle size={20} className="text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-bold text-brand-brown">ملاحظات مهمة</h2>
                        </div>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange font-bold">•</span>
                                يجب الاحتفاظ بالمنتج في حالته الأصلية حتى يتم استلامه من المندوب
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange font-bold">•</span>
                                في حالة المنتجات الطازجة، يُفضل التقاط صور للمشكلة فور الاستلام
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange font-bold">•</span>
                                نحتفظ بحق رفض الاسترجاع في حالة عدم استيفاء الشروط
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange font-bold">•</span>
                                يتم خصم رسوم التوصيل في حالة استرجاع الطلب بالكامل بسبب تغيير رأي العميل
                            </li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <div className="bg-gradient-to-r from-brand-brown to-brand-orange rounded-2xl p-8 text-center text-white">
                        <h3 className="text-xl font-bold mb-4">هل تحتاج مساعدة في الاسترجاع؟</h3>
                        <p className="text-white/80 mb-6">فريق خدمة العملاء متاح على مدار الساعة لمساعدتك</p>
                        <a href="tel:19999" className="inline-flex items-center gap-3 bg-white text-brand-brown px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                            <Phone size={24} />
                            اتصل بنا: 19999
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
