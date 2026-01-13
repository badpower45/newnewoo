import React from 'react';
import { ArrowLeft, Shield, Lock, UserCheck, Database, Eye, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
    const navigate = useNavigate();
    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/more');
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F7FB] flex flex-col pb-4" dir="rtl">
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-3 py-2.5 flex items-center justify-between" dir="ltr">
                    <button
                        onClick={handleBack}
                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        aria-label="رجوع"
                    >
                        <ArrowLeft size={16} className="text-gray-700" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-sm">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500">مركز الثقة</p>
                            <div className="text-sm font-semibold text-gray-900">سياسة الخصوصية</div>
                        </div>
                    </div>
                    <a
                        href="tel:+201234567890"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Phone size={14} />
                        <span className="hidden sm:inline">اتصل بنا</span>
                    </a>
                </div>
            </header>

            <main className="flex-1 w-full px-3 sm:px-4 py-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">سياسة الخصوصية</h1>
                                <p className="text-xs text-gray-500 mt-1">آخر تحديث: ديسمبر 2024</p>
                            </div>
                        </div>

                        <section>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center">
                                    <UserCheck className="text-orange-500" size={18} />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900">مقدمة</h2>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                نحن في علوش ماركت نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحماية معلوماتك عند استخدام خدماتنا.
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Database className="text-blue-600" size={18} />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900">البيانات التي نجمعها</h2>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">المعلومات الشخصية</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>الاسم الكامل</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>رقم الهاتف</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>البريد الإلكتروني</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>العنوان (للتوصيل)</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">بيانات الاستخدام</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>سجل الطلبات والمشتريات</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>المنتجات المفضلة</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>نقاط الولاء</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center">
                                    <Eye className="text-green-600" size={18} />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900">كيف نستخدم بياناتك</h2>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">✓</span>
                                    <span>معالجة الطلبات والتوصيل</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">✓</span>
                                    <span>تحسين تجربتك وتقديم عروض مخصصة</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">✓</span>
                                    <span>إرسال الإشعارات المهمة حول طلباتك</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">✓</span>
                                    <span>إدارة برنامج نقاط الولاء</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">✓</span>
                                    <span>تحسين خدماتنا ومنتجاتنا</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center">
                                    <Lock className="text-purple-600" size={18} />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900">حماية البيانات</h2>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                نستخدم أحدث تقنيات الأمان لحماية بياناتك، بما في ذلك:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-purple-900 mb-2 text-sm">🔒 التشفير</h3>
                                    <p className="text-xs text-gray-700">جميع البيانات مشفرة أثناء النقل والتخزين</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-purple-900 mb-2 text-sm">🛡️ الوصول المحدود</h3>
                                    <p className="text-xs text-gray-700">فقط الموظفون المصرح لهم يمكنهم الوصول للبيانات</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-purple-900 mb-2 text-sm">💾 النسخ الاحتياطي</h3>
                                    <p className="text-xs text-gray-700">نسخ احتياطي منتظم لضمان عدم فقدان البيانات</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-purple-900 mb-2 text-sm">🔍 المراقبة</h3>
                                    <p className="text-xs text-gray-700">مراقبة مستمرة للكشف عن أي نشاط مشبوه</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center">
                                    <Shield className="text-amber-600" size={18} />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900">حقوقك</h2>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                                <p className="text-sm text-gray-700">لديك الحق في:</p>
                                <ul className="space-y-2 text-sm text-gray-700">
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

                        <section className="border-t border-gray-100 pt-5">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">تواصل معنا</h2>
                            <p className="text-sm text-gray-700 mb-4">
                                لأي استفسارات حول سياسة الخصوصية أو لممارسة حقوقك، يرجى التواصل معنا:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                    <Mail className="text-orange-500" size={18} />
                                    <div>
                                        <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                                        <p className="font-medium text-gray-900 text-sm">privacy@aloush-market.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                    <Phone className="text-orange-500" size={18} />
                                    <div>
                                        <p className="text-xs text-gray-500">خدمة العملاء</p>
                                        <p className="font-medium text-gray-900 text-sm text-left" dir="ltr">+20 123 456 7890</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="bg-gray-50 rounded-xl p-4 text-center text-xs text-gray-600">
                            <p>آخر تحديث: ديسمبر 2024</p>
                            <p className="mt-1">نحتفظ بالحق في تحديث هذه السياسة، وسنُعلمك بأي تغييرات جوهرية</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicyPage;
