import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Phone, MessageCircle, Truck, CreditCard, Package, RefreshCw, User, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';

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
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-brand-brown to-brand-orange py-16 px-4">
                <div className="max-w-4xl mx-auto text-center relative">
                    <button
                        onClick={handleBack}
                        className="absolute left-0 top-4 w-10 h-10 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition"
                        dir="ltr"
                    >
                        <ArrowLeft size={22} className="text-white" />
                    </button>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HelpCircle size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        الأسئلة الشائعة ❓
                    </h1>
                    <p className="text-white/80 max-w-2xl mx-auto mb-8">
                        ابحث عن إجابة سؤالك أو تصفح الأسئلة حسب الفئة
                    </p>

                    {/* Search */}
                    <div className="relative max-w-md mx-auto">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن سؤالك..."
                            className="w-full px-6 py-4 pr-14 rounded-2xl text-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                                selectedCategory === cat
                                    ? 'bg-brand-orange text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFAQs.length === 0 ? (
                        <div className="text-center py-12">
                            <HelpCircle size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-700 mb-2">لم يتم العثور على نتائج</h3>
                            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تواصل معنا</p>
                        </div>
                    ) : (
                        filteredFAQs.map((faq, index) => {
                            const Icon = getCategoryIcon(faq.category);
                            const isOpen = openQuestions.includes(index);
                            
                            return (
                                <div 
                                    key={index}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleQuestion(index)}
                                        className="w-full p-6 flex items-center gap-4 text-right hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Icon size={20} className="text-brand-orange" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs text-brand-orange font-medium">{faq.category}</span>
                                            <h3 className="font-bold text-gray-800">{faq.question}</h3>
                                        </div>
                                        {isOpen ? (
                                            <ChevronUp className="text-gray-400 flex-shrink-0" size={24} />
                                        ) : (
                                            <ChevronDown className="text-gray-400 flex-shrink-0" size={24} />
                                        )}
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="px-6 pb-6 pr-20">
                                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Contact Section */}
                <div className="mt-12 bg-gradient-to-r from-brand-brown to-brand-orange rounded-2xl p-8 text-center text-white">
                    <h3 className="text-xl font-bold mb-4">لم تجد إجابة سؤالك؟</h3>
                    <p className="text-white/80 mb-6">فريق خدمة العملاء متاح على مدار الساعة لمساعدتك</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="tel:19999" className="inline-flex items-center justify-center gap-3 bg-white text-brand-brown px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                            <Phone size={24} />
                            اتصل بنا: 19999
                        </a>
                        <a href="/chat" className="inline-flex items-center justify-center gap-3 bg-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-colors">
                            <MessageCircle size={24} />
                            إرسال اقتراح
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
