import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Phone, MessageCircle, Truck, CreditCard, Package, RefreshCw, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const FAQ_DATA: FAQItem[] = [
    // الطلبات
    { 
        category: 'الطلبات',
        question: 'كيف أقوم بعمل طلب؟',
        answer: 'يمكنك تصفح المنتجات وإضافتها للسلة، ثم الذهاب لصفحة السلة واختيار عنوان التوصيل وطريقة الدفع وإتمام الطلب. ستصلك رسالة تأكيد بكود الطلب.'
    },
    { 
        category: 'الطلبات',
        question: 'كيف أتتبع طلبي؟',
        answer: 'يمكنك تتبع طلبك من خلال صفحة "تتبع طلبك" بإدخال كود الطلب المرسل إليك، أو من خلال صفحة "طلباتي" إذا كان لديك حساب.'
    },
    { 
        category: 'الطلبات',
        question: 'هل يمكنني تعديل طلبي بعد إرساله؟',
        answer: 'يمكنك تعديل الطلب خلال 5 دقائق فقط من إرساله عن طريق التواصل مع خدمة العملاء. بعد ذلك، قد يكون الطلب قد بدأ في التحضير.'
    },
    { 
        category: 'الطلبات',
        question: 'هل يمكنني إلغاء طلبي؟',
        answer: 'نعم، يمكنك إلغاء الطلب إذا لم يبدأ التحضير بعد. تواصل معنا فوراً على 19999 لإلغاء الطلب.'
    },
    { 
        category: 'الطلبات',
        question: 'ما هو الحد الأدنى للطلب؟',
        answer: 'الحد الأدنى للطلب هو 50 جنيه. للحصول على توصيل مجاني، يجب أن يكون الطلب أكثر من 200 جنيه.'
    },

    // التوصيل
    { 
        category: 'التوصيل',
        question: 'ما هي مواعيد التوصيل؟',
        answer: 'نعمل على مدار الساعة، 7 أيام في الأسبوع. يمكنك اختيار الوقت المناسب لك عند إتمام الطلب من الفترات المتاحة.'
    },
    { 
        category: 'التوصيل',
        question: 'ما هي رسوم التوصيل؟',
        answer: 'التوصيل مجاني للطلبات أكثر من 200 جنيه. للطلبات من 100-200 جنيه: 15 جنيه. للطلبات أقل من 100 جنيه: 25 جنيه.'
    },
    { 
        category: 'التوصيل',
        question: 'ما هي المناطق التي تغطونها؟',
        answer: 'نغطي معظم مناطق القاهرة والجيزة: مدينة نصر، الزمالك، المعادي، التجمع، الشيخ زايد، 6 أكتوبر، المهندسين، الدقي، مصر الجديدة وغيرها. تواصل معنا للتأكد من منطقتك.'
    },
    { 
        category: 'التوصيل',
        question: 'ماذا لو لم أكن موجوداً وقت التوصيل؟',
        answer: 'سيتواصل معك المندوب قبل الوصول بـ 10-15 دقيقة. إذا لم ترد، سيحاول 3 مرات. يمكنك تحديد شخص آخر لاستلام الطلب عند إتمام الطلب.'
    },

    // الدفع
    { 
        category: 'الدفع',
        question: 'ما هي طرق الدفع المتاحة؟',
        answer: 'نقبل: الدفع عند الاستلام (كاش)، البطاقات البنكية (فيزا، ماستركارد)، المحافظ الإلكترونية (فودافون كاش، أورانج كاش، إتصالات كاش).'
    },
    { 
        category: 'الدفع',
        question: 'هل الدفع الإلكتروني آمن؟',
        answer: 'نعم، نستخدم أحدث تقنيات التشفير والأمان لحماية بياناتك. جميع المعاملات مؤمنة بالكامل.'
    },
    { 
        category: 'الدفع',
        question: 'هل يمكنني استخدام كوبون خصم؟',
        answer: 'نعم، يمكنك إدخال كود الكوبون في صفحة الدفع قبل إتمام الطلب. تأكد من صلاحية الكوبون وشروط استخدامه.'
    },

    // الاسترجاع
    { 
        category: 'الاستبدال والاسترجاع',
        question: 'كيف أقوم بإرجاع منتج؟',
        answer: 'تواصل مع خدمة العملاء على 19999 خلال 24 ساعة من استلام الطلب. اشرح المشكلة وأرسل صورة للمنتج. سنقوم باستبداله أو إرجاع المبلغ.'
    },
    { 
        category: 'الاستبدال والاسترجاع',
        question: 'متى أستطيع طلب الاسترجاع؟',
        answer: 'يجب تقديم طلب الاسترجاع خلال 24 ساعة من استلام الطلب. بعد ذلك لا يمكن قبول الاسترجاع.'
    },
    { 
        category: 'الاستبدال والاسترجاع',
        question: 'كم يستغرق استرداد المبلغ؟',
        answer: 'للدفع عند الاستلام: يتم إضافة رصيد لحسابك فوراً. للدفع الإلكتروني: 3-7 أيام عمل لاسترداد المبلغ على نفس طريقة الدفع.'
    },

    // الحساب
    { 
        category: 'الحساب',
        question: 'هل يجب أن يكون لدي حساب للطلب؟',
        answer: 'يمكنك الطلب كضيف بدون حساب. لكن إنشاء حساب يتيح لك تتبع طلباتك، حفظ عناوينك، وتجميع نقاط الولاء.'
    },
    { 
        category: 'الحساب',
        question: 'نسيت كلمة المرور، ماذا أفعل؟',
        answer: 'اضغط على "نسيت كلمة المرور" في صفحة تسجيل الدخول، أدخل بريدك الإلكتروني أو رقم هاتفك، وستصلك رسالة لإعادة تعيين كلمة المرور.'
    },
    { 
        category: 'الحساب',
        question: 'كيف أحصل على نقاط الولاء؟',
        answer: 'تحصل على نقطة واحدة لكل 10 جنيه تنفقها. يمكنك استبدال النقاط بخصومات على طلباتك القادمة. 100 نقطة = 10 جنيه خصم.'
    },

    // المنتجات
    { 
        category: 'المنتجات',
        question: 'هل المنتجات طازجة؟',
        answer: 'نعم، نحرص على توفير أفضل المنتجات الطازجة يومياً. الخضروات والفواكه واللحوم تأتي من أفضل الموردين ويتم فحصها بدقة.'
    },
    { 
        category: 'المنتجات',
        question: 'ماذا لو كان المنتج غير متوفر؟',
        answer: 'عند إتمام الطلب، يمكنك اختيار ما تفضله: استبدال المنتج ببديل مشابه، أو إلغاء المنتج من الطلب، أو الاتصال بك للاستشارة.'
    },
];

const CATEGORIES = ['الكل', 'الطلبات', 'التوصيل', 'الدفع', 'الاستبدال والاسترجاع', 'الحساب', 'المنتجات'];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [openQuestions, setOpenQuestions] = useState<number[]>([]);
    const navigate = useNavigate();
    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/more');
        }
    };

    const toggleQuestion = (index: number) => {
        setOpenQuestions(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const filteredFAQs = FAQ_DATA.filter(faq => {
        const matchesCategory = selectedCategory === 'الكل' || faq.category === selectedCategory;
        const matchesSearch = searchQuery === '' || 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'الطلبات': return Package;
            case 'التوصيل': return Truck;
            case 'الدفع': return CreditCard;
            case 'الاستبدال والاسترجاع': return RefreshCw;
            case 'الحساب': return User;
            case 'المنتجات': return Package;
            default: return HelpCircle;
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
                                <p className="text-sm font-semibold text-gray-900">ابحث عن إجابة</p>
                                <p className="text-xs text-gray-400">ردود مختصرة وسريعة</p>
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
                                {CATEGORIES.map((cat) => (
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
                                    <h3 className="text-base font-bold text-gray-700 mb-1">لم يتم العثور على نتائج</h3>
                                    <p className="text-sm text-gray-500">جرّب كلمات مختلفة أو تواصل معنا</p>
                                </div>
                            ) : (
                                filteredFAQs.map((faq, index) => {
                                    const Icon = getCategoryIcon(faq.category);
                                    const isOpen = openQuestions.includes(index);

                                    return (
                                        <div
                                            key={index}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(index)}
                                                className="w-full p-4 flex items-center gap-3 text-right hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Icon size={18} className="text-orange-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-[11px] text-orange-500 font-medium">{faq.category}</span>
                                                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{faq.question}</h3>
                                                </div>
                                                {isOpen ? (
                                                    <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                                                ) : (
                                                    <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                                                )}
                                            </button>

                                            {isOpen && (
                                                <div className="px-4 pb-4 pr-12">
                                                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
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
                                <h3 className="text-base font-semibold text-gray-900">لم تجد إجابة سؤالك؟</h3>
                                <p className="text-xs text-gray-500">فريق خدمة العملاء متاح دائماً</p>
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
                            <a
                                href="/chat"
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors text-sm"
                            >
                                <MessageCircle size={18} />
                                إرسال مقترح
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
