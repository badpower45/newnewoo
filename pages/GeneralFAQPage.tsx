import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, HelpCircle, Package, CreditCard, Truck, Gift, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
    icon: React.ReactNode;
}

const GeneralFAQPage = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FAQItem[] = [
        {
            category: 'الطلبات والشراء',
            icon: <Package size={20} />,
            question: 'ما هو الحد الأدنى للطلب؟',
            answer: 'الحد الأدنى للطلب في علوش ماركت هو 200 جنيه مصري. هذا يساعدنا في تقديم أفضل خدمة توصيل لك.'
        },
        {
            category: 'الطلبات والشراء',
            icon: <Package size={20} />,
            question: 'كيف يمكنني تتبع طلبي؟',
            answer: 'يمكنك تتبع طلبك من خلال الذهاب إلى صفحة "طلباتي" من قائمة المزيد، أو من خلال الرابط المرسل على الواتساب بعد تأكيد الطلب.'
        },
        {
            category: 'التوصيل',
            icon: <Truck size={20} />,
            question: 'هل التوصيل مجاني؟',
            answer: 'نعم! التوصيل مجاني تمامًا للطلبات التي تزيد قيمتها عن 600 جنيه. للطلبات الأقل من 600 جنيه، تطبق رسوم خدمة قدرها 7 جنيه فقط.'
        },
        {
            category: 'التوصيل',
            icon: <Clock size={20} />,
            question: 'كم يستغرق التوصيل؟',
            answer: 'نوصل طلبك خلال 24-48 ساعة من وقت تأكيد الطلب. يمكنك اختيار الوقت المناسب لك عند إتمام الطلب.'
        },
        {
            category: 'التوصيل',
            icon: <MapPin size={20} />,
            question: 'ما هي مناطق التوصيل المتاحة؟',
            answer: 'نوفر خدمة التوصيل في جميع أنحاء القاهرة الكبرى والجيزة. يمكنك التحقق من توافر الخدمة في منطقتك عند إدخال العنوان.'
        },
        {
            category: 'الدفع',
            icon: <CreditCard size={20} />,
            question: 'ما هي طرق الدفع المتاحة؟',
            answer: 'نوفر الدفع عند الاستلام (كاش) وقريبًا ستتوفر خدمات الدفع الإلكتروني (فيزا، فوري، وغيرها).'
        },
        {
            category: 'الدفع',
            icon: <CreditCard size={20} />,
            question: 'هل السعر يشمل الضريبة؟',
            answer: 'نعم، جميع الأسعار المعروضة شاملة ضريبة القيمة المضافة، لذلك لن تكون هناك أي رسوم إضافية مفاجئة.'
        },
        {
            category: 'نقاط الولاء',
            icon: <Gift size={20} />,
            question: 'كيف يعمل نظام نقاط الولاء؟',
            answer: 'مع كل عملية شراء، تحصل على نقاط ولاء (1000 جنيه = 1000 نقطة). يمكنك استبدال كل 1000 نقطة بكوبون خصم بقيمة 35 جنيه للاستخدام في طلباتك القادمة.'
        },
        {
            category: 'نقاط الولاء',
            icon: <Gift size={20} />,
            question: 'كيف يمكنني استخدام نقاطي؟',
            answer: 'من صفحة "نقاطي" يمكنك رؤية رصيدك واستبدال النقاط بكوبونات خصم. يتم تطبيق الكوبون تلقائيًا عند الدفع.'
        },
        {
            category: 'الحساب',
            icon: <HelpCircle size={20} />,
            question: 'هل أحتاج إلى إنشاء حساب للطلب؟',
            answer: 'نعم، إنشاء حساب سريع وسهل ويتيح لك تتبع طلباتك والاستفادة من نقاط الولاء والعروض الخاصة.'
        },
        {
            category: 'الحساب',
            icon: <HelpCircle size={20} />,
            question: 'هل بياناتي آمنة؟',
            answer: 'نعم بالتأكيد! نحن ملتزمون بحماية خصوصيتك. جميع بياناتك مشفرة ومحمية وفقًا لأعلى معايير الأمان. راجع سياسة الخصوصية لمزيد من التفاصيل.'
        },
        {
            category: 'المرتجعات',
            icon: <Package size={20} />,
            question: 'ما هي سياسة الإرجاع؟',
            answer: 'يمكنك إرجاع أي منتج خلال 24 ساعة من استلامه في حالة وجود عيب أو خطأ في الطلب. سيتم استرداد المبلغ أو استبدال المنتج حسب رغبتك.'
        },
        {
            category: 'المرتجعات',
            icon: <Package size={20} />,
            question: 'كيف يتم استرداد الأموال؟',
            answer: 'في حالة الإرجاع، يتم إضافة المبلغ إلى رصيد نقاط الولاء الخاصة بك أو استرداده نقدًا حسب رغبتك.'
        }
    ];

    const categories = [...new Set(faqs.map(faq => faq.category))];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/more');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-orange to-orange-600 text-white">
                <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between flex-row-reverse">
                    <div className="flex-1" />
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        dir="ltr"
                    >
                        <ArrowLeft size={20} />
                        <span>رجوع</span>
                    </button>
                    <div className="flex items-center gap-3 mb-2 flex-1 justify-end">
                        <HelpCircle size={32} />
                        <h1 className="text-3xl font-bold">الأسئلة الشائعة</h1>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-4 pb-2 -mt-4">
                    <p className="text-white/90">إجابات على أكثر الأسئلة شيوعًا</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <div className="text-3xl mb-2">🚚</div>
                        <p className="text-sm text-gray-600">توصيل سريع</p>
                        <p className="font-bold text-brand-orange">24-48 ساعة</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <div className="text-3xl mb-2">💰</div>
                        <p className="text-sm text-gray-600">شحن مجاني</p>
                        <p className="font-bold text-brand-orange">من 600 ج</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <div className="text-3xl mb-2">🎁</div>
                        <p className="text-sm text-gray-600">نقاط ولاء</p>
                        <p className="font-bold text-brand-orange">1000=35ج</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="text-sm text-gray-600">حد أدنى</p>
                        <p className="font-bold text-brand-orange">200 جنيه</p>
                    </div>
                </div>

                {/* FAQ Sections by Category */}
                {categories.map((category, catIndex) => (
                    <div key={catIndex} className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-brand-orange rounded"></span>
                            {category}
                        </h2>
                        <div className="space-y-3">
                            {faqs
                                .filter(faq => faq.category === category)
                                .map((faq, index) => {
                                    const globalIndex = faqs.findIndex(f => f === faq);
                                    const isOpen = openIndex === globalIndex;
                                    return (
                                        <div
                                            key={index}
                                            className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all"
                                        >
                                            <button
                                                onClick={() => toggleFAQ(globalIndex)}
                                                className="w-full px-6 py-4 flex items-center justify-between text-right hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-brand-orange">{faq.icon}</span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{faq.question}</span>
                                                </div>
                                                <ChevronDown
                                                    size={20}
                                                    className={`text-gray-400 transition-transform flex-shrink-0 ${
                                                        isOpen ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-4 pt-2">
                                                    <div className="pr-12 text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                                                        {faq.answer}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}

                {/* Contact Support */}
                <div className="bg-gradient-to-r from-brand-orange to-orange-600 rounded-2xl p-8 text-white text-center mt-8">
                    <h2 className="text-2xl font-bold mb-2">لم تجد إجابة لسؤالك؟</h2>
                    <p className="mb-6 text-white/90">تواصل مع فريق الدعم وسنكون سعداء بمساعدتك</p>
                    <button
                        onClick={() => navigate('/chat')}
                        className="bg-white text-brand-orange px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                    >
                        <HelpCircle size={20} />
                        <span>تواصل معنا</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GeneralFAQPage;
