import React from 'react';
import { ChevronRight, Shield, Lock, UserCheck, Database, Eye, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-orange to-orange-600 text-white">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
                    >
                        <ChevronRight size={20} />
                        <span>رجوع</span>
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <Shield size={32} />
                        <h1 className="text-3xl font-bold">سياسة الخصوصية</h1>
                    </div>
                    <p className="text-white/90">آخر تحديث: ديسمبر 2024</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 space-y-8">
                    
                    {/* Introduction */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <UserCheck className="text-brand-orange" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">مقدمة</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            نحن في علوش ماركت نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحماية معلوماتك عند استخدام خدماتنا.
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Database className="text-blue-600" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">البيانات التي نجمعها</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-bold text-gray-900 mb-2">المعلومات الشخصية:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>الاسم الكامل</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>رقم الهاتف</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>البريد الإلكتروني</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>العنوان (للتوصيل)</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-bold text-gray-900 mb-2">بيانات الاستخدام:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>سجل الطلبات والمشتريات</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>المنتجات المفضلة</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-brand-orange mt-1">•</span>
                                        <span>نقاط الولاء</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Data Usage */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Eye className="text-green-600" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">كيف نستخدم بياناتك</h2>
                        </div>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="text-brand-orange text-xl mt-1">✓</span>
                                <span>معالجة الطلبات والتوصيل</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-brand-orange text-xl mt-1">✓</span>
                                <span>تحسين تجربتك وتقديم عروض مخصصة</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-brand-orange text-xl mt-1">✓</span>
                                <span>إرسال الإشعارات المهمة حول طلباتك</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-brand-orange text-xl mt-1">✓</span>
                                <span>إدارة برنامج نقاط الولاء</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-brand-orange text-xl mt-1">✓</span>
                                <span>تحسين خدماتنا ومنتجاتنا</span>
                            </li>
                        </ul>
                    </section>

                    {/* Data Protection */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Lock className="text-purple-600" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">حماية البيانات</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            نستخدم أحدث تقنيات الأمان لحماية بياناتك، بما في ذلك:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-purple-50 rounded-xl p-4">
                                <h3 className="font-bold text-purple-900 mb-2">🔒 التشفير</h3>
                                <p className="text-sm text-gray-700">جميع البيانات مشفرة أثناء النقل والتخزين</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <h3 className="font-bold text-purple-900 mb-2">🛡️ الوصول المحدود</h3>
                                <p className="text-sm text-gray-700">فقط الموظفون المصرح لهم يمكنهم الوصول للبيانات</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <h3 className="font-bold text-purple-900 mb-2">💾 النسخ الاحتياطي</h3>
                                <p className="text-sm text-gray-700">نسخ احتياطي منتظم لضمان عدم فقدان البيانات</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <h3 className="font-bold text-purple-900 mb-2">🔍 المراقبة</h3>
                                <p className="text-sm text-gray-700">مراقبة مستمرة للكشف عن أي نشاط مشبوه</p>
                            </div>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <Shield className="text-amber-600" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">حقوقك</h2>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-6 space-y-3">
                            <p className="text-gray-700">لديك الحق في:</p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 mt-1">→</span>
                                    <span>الوصول إلى بياناتك الشخصية</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 mt-1">→</span>
                                    <span>تصحيح البيانات غير الصحيحة</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 mt-1">→</span>
                                    <span>حذف بياناتك (مع بعض الاستثناءات)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 mt-1">→</span>
                                    <span>الاعتراض على معالجة بياناتك</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600 mt-1">→</span>
                                    <span>نقل بياناتك إلى خدمة أخرى</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="border-t pt-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">تواصل معنا</h2>
                        <p className="text-gray-700 mb-4">
                            لأي استفسارات حول سياسة الخصوصية أو لممارسة حقوقك، يرجى التواصل معنا:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                <Mail className="text-brand-orange" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                                    <p className="font-medium text-gray-900">privacy@aloush-market.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                <Phone className="text-brand-orange" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">خدمة العملاء</p>
                                    <p className="font-medium text-gray-900 text-left" dir="ltr">+20 123 456 7890</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Last Update */}
                    <div className="bg-gray-100 rounded-xl p-4 text-center text-sm text-gray-600">
                        <p>آخر تحديث: ديسمبر 2024</p>
                        <p className="mt-1">نحتفظ بالحق في تحديث هذه السياسة، وسنُعلمك بأي تغييرات جوهرية</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
