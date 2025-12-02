import React from 'react';
import { Truck, Clock, MapPin, Package, CreditCard, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

export default function DeliveryPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-brown to-brand-orange py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Truck size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        سياسة التوصيل 🚚
                    </h1>
                    <p className="text-white/80 max-w-2xl mx-auto">
                        نحرص على توصيل طلبك بأسرع وقت وبأفضل جودة. تعرف على تفاصيل خدمة التوصيل لدينا
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={28} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">توصيل سريع</h3>
                        <p className="text-gray-500 text-sm">خلال 30-60 دقيقة</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin size={28} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">نطاق التغطية</h3>
                        <p className="text-gray-500 text-sm">جميع أنحاء القاهرة والجيزة</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard size={28} className="text-brand-orange" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">توصيل مجاني</h3>
                        <p className="text-gray-500 text-sm">للطلبات أكثر من 200 جنيه</p>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {/* مواعيد التوصيل */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center">
                                <Clock size={20} className="text-brand-orange" />
                            </div>
                            <h2 className="text-xl font-bold text-brand-brown">مواعيد التوصيل</h2>
                        </div>
                        <div className="space-y-4 text-gray-600">
                            <p>• نعمل على مدار الساعة، 7 أيام في الأسبوع</p>
                            <p>• يمكنك اختيار الوقت المناسب لك عند إتمام الطلب</p>
                            <p>• فترات التوصيل المتاحة:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="font-bold text-brand-brown">الصباح</p>
                                    <p className="text-sm text-gray-500">8 ص - 12 م</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="font-bold text-brand-brown">الظهر</p>
                                    <p className="text-sm text-gray-500">12 م - 4 م</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="font-bold text-brand-brown">المساء</p>
                                    <p className="text-sm text-gray-500">4 م - 8 م</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="font-bold text-brand-brown">الليل</p>
                                    <p className="text-sm text-gray-500">8 م - 12 ص</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* رسوم التوصيل */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CreditCard size={20} className="text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-brand-brown">رسوم التوصيل</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-green-600" size={24} />
                                    <span className="font-medium text-green-700">طلبات أكثر من 200 جنيه</span>
                                </div>
                                <span className="font-bold text-green-600">توصيل مجاني</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Package className="text-gray-600" size={24} />
                                    <span className="font-medium text-gray-700">طلبات من 100 إلى 200 جنيه</span>
                                </div>
                                <span className="font-bold text-brand-orange">15 جنيه</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Package className="text-gray-600" size={24} />
                                    <span className="font-medium text-gray-700">طلبات أقل من 100 جنيه</span>
                                </div>
                                <span className="font-bold text-brand-orange">25 جنيه</span>
                            </div>
                        </div>
                    </section>

                    {/* مناطق التغطية */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <MapPin size={20} className="text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-brand-brown">مناطق التغطية</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['مدينة نصر', 'الزمالك', 'المعادي', 'التجمع الخامس', 'الشيخ زايد', '6 أكتوبر', 
                              'المهندسين', 'الدقي', 'مصر الجديدة', 'العبور', 'الرحاب', 'المقطم'].map((area, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span className="text-gray-700">{area}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm mt-4">
                            * نعمل على توسيع نطاق التغطية باستمرار. تواصل معنا للاستفسار عن منطقتك
                        </p>
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
                                يرجى التأكد من صحة العنوان ورقم الهاتف لتجنب أي تأخير
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange font-bold">•</span>
                                سيتم التواصل معك قبل وصول الطلب بـ 10-15 دقيقة
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange font-bold">•</span>
                                في حالة عدم الرد، سيحاول المندوب التواصل 3 مرات قبل إلغاء التوصيل
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-brand-orange font-bold">•</span>
                                يمكنك تتبع طلبك مباشرة من خلال صفحة تتبع الطلب
                            </li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <div className="bg-gradient-to-r from-brand-brown to-brand-orange rounded-2xl p-8 text-center text-white">
                        <h3 className="text-xl font-bold mb-4">هل لديك استفسار؟</h3>
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
