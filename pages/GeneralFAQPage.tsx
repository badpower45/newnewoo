import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, HelpCircle, Package, CreditCard, Truck, Gift, Clock, MapPin, Search, Phone, MessageCircle } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('الكل');

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

    const categories = ['الكل', ...new Set(faqs.map(faq => faq.category))];

    const filteredFAQs = faqs
        .map((faq, index) => ({ ...faq, index }))
        .filter((faq) => {
            const matchesCategory = selectedCategory === 'الكل' || faq.category === selectedCategory;
            const matchesSearch = searchQuery === '' ||
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

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
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500">مركز المساعدة</p>
                            <div className="text-sm font-semibold text-gray-900">الأسئلة الشائعة</div>
                        </div>
                    </div>
                    <a
                        href="tel:19999"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Phone size={14} />
                        <span className="hidden sm:inline">اتصل بنا</span>
                    </a>
                </div>
            </header>

            <main className="flex-1 w-full px-3 sm:px-4 py-4">
                <div className="max-w-3xl mx-auto flex flex-col gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 pt-3 pb-3 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-gray-900">إجابات واضحة</p>
                                <p className="text-xs text-gray-400">اختصر الطريق لردك</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن سؤالك..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 mt-3 scrollbar-hide -mx-1 px-1">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`min-w-fit px-3 py-1.5 rounded-full whitespace-nowrap border text-xs transition-all ${
                                            selectedCategory === cat
                                                ? 'bg-orange-500 text-white border-orange-500'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-4 py-3 space-y-3 bg-gradient-to-b from-white to-gray-50">
                            {filteredFAQs.length === 0 ? (
                                <div className="text-center py-10">
                                    <HelpCircle size={40} className="text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-gray-700 mb-1">لا توجد نتائج</h3>
                                    <p className="text-sm text-gray-500">جرّب كلمات مختلفة أو تصفح الأقسام</p>
                                </div>
                            ) : (
                                filteredFAQs.map((faq) => {
                                    const isOpen = openIndex === faq.index;
                                    return (
                                        <div
                                            key={faq.index}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all"
                                        >
                                            <button
                                                onClick={() => toggleFAQ(faq.index)}
                                                className="w-full px-4 py-4 flex items-center justify-between text-right hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-orange-500">
                                                        {faq.icon}
                                                    </div>
                                                    <span className="font-medium text-gray-900 text-sm sm:text-base">{faq.question}</span>
                                                </div>
                                                <ChevronDown
                                                    size={18}
                                                    className={`text-gray-400 transition-transform flex-shrink-0 ${
                                                        isOpen ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </button>
                                            {isOpen && (
                                                <div className="px-4 pb-4 pt-1">
                                                    <div className="pr-12 text-gray-700 leading-relaxed text-sm bg-gray-50 rounded-xl p-4">
                                                        {faq.answer}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-sm">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">لا زلت تحتاج مساعدة؟</h3>
                                <p className="text-xs text-gray-500">تواصل مباشرة مع خدمة العملاء</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href="tel:19999"
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-sm"
                            >
                                <Phone size={18} />
                                اتصل بنا
                            </a>
                            <button
                                onClick={() => navigate('/chat')}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors text-sm"
                            >
                                <MessageCircle size={18} />
                                إرسال مقترح
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GeneralFAQPage;
