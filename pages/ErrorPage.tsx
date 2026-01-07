import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowRight, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ErrorPageProps {
    errorCode?: number;
    errorMessage?: string;
    showBackButton?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
    errorCode = 404, 
    errorMessage,
    showBackButton = true 
}) => {
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    
    const errorDetails = getErrorDetails(errorCode, language);
    const finalMessage = errorMessage || errorDetails.message;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                {/* Error Code Animation */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                    </div>
                    <div className="relative">
                        <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 animate-bounce-slow">
                            {errorCode}
                        </h1>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <AlertTriangle className="w-20 h-20 text-orange-500 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Error Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    {errorDetails.title}
                </h2>

                {/* Error Message */}
                <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                    {finalMessage}
                </p>

                {/* Suggestions */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-md mx-auto border border-orange-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                        <RefreshCcw className="w-5 h-5 text-orange-500" />
                        {language === 'ar' ? 'اقتراحات' : 'Suggestions'}
                    </h3>
                    <ul className="text-right space-y-3 text-gray-700">
                        {errorDetails.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-orange-600 text-sm font-bold">{index + 1}</span>
                                </div>
                                <span className="flex-1">{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                        <Home className="w-5 h-5" />
                        <span>{language === 'ar' ? 'العودة للرئيسية' : 'Go to Homepage'}</span>
                    </button>

                    {showBackButton && (
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 px-8 py-3 bg-white text-gray-700 font-semibold rounded-full shadow-md hover:shadow-lg border border-gray-200 transform hover:-translate-y-1 transition-all duration-200"
                        >
                            {language === 'ar' ? (
                                <>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    <span>الصفحة السابقة</span>
                                </>
                            ) : (
                                <>
                                    <span>Go Back</span>
                                    <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="mt-12 flex items-center justify-center gap-2 text-gray-400">
                    <div className="w-8 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
                    <span className="text-sm font-medium">{language === 'ar' ? 'خطأ' : 'Error'} {errorCode}</span>
                    <div className="w-8 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
                </div>
            </div>

            {/* Background Pattern */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

// Helper function to get error details based on code and language
function getErrorDetails(code: number, language: 'ar' | 'en') {
    const errors: Record<number, { title: { ar: string; en: string }; message: { ar: string; en: string }; suggestions: { ar: string[]; en: string[] } }> = {
        400: {
            title: { ar: 'طلب غير صحيح', en: 'Bad Request' },
            message: { ar: 'عذراً، الطلب الذي أرسلته غير صحيح أو يحتوي على معلومات غير مكتملة.', en: 'Sorry, the request you sent is invalid or contains incomplete information.' },
            suggestions: {
                ar: [
                    'تأكد من إدخال جميع البيانات المطلوبة بشكل صحيح',
                    'حاول تحديث الصفحة والمحاولة مرة أخرى',
                    'تواصل مع خدمة العملاء إذا استمرت المشكلة'
                ],
                en: [
                    'Make sure all required data is entered correctly',
                    'Try refreshing the page and trying again',
                    'Contact customer service if the problem persists'
                ]
            }
        },
        401: {
            title: { ar: 'غير مصرح', en: 'Unauthorized' },
            message: { ar: 'يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة.', en: 'You must log in to access this page.' },
            suggestions: {
                ar: [
                    'قم بتسجيل الدخول باستخدام حسابك',
                    'إذا نسيت كلمة المرور، يمكنك إعادة تعيينها',
                    'أنشئ حساب جديد إذا لم يكن لديك حساب'
                ],
                en: [
                    'Log in using your account',
                    'If you forgot your password, you can reset it',
                    'Create a new account if you don\'t have one'
                ]
            }
        },
        403: {
            title: { ar: 'ممنوع', en: 'Forbidden' },
            message: { ar: 'عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.', en: 'Sorry, you don\'t have sufficient permissions to access this page.' },
            suggestions: {
                ar: [
                    'تحقق من أن حسابك لديه الصلاحيات المطلوبة',
                    'تواصل مع الإدارة لمنحك الصلاحيات اللازمة',
                    'ارجع إلى الصفحة الرئيسية'
                ],
                en: [
                    'Check that your account has the required permissions',
                    'Contact admin to grant you the necessary permissions',
                    'Return to the homepage'
                ]
            }
        },
        404: {
            title: { ar: 'الصفحة غير موجودة', en: 'Page Not Found' },
            message: { ar: 'عذراً! الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.', en: 'Sorry! The page you are looking for does not exist or has been moved.' },
            suggestions: {
                ar: [
                    'تحقق من الرابط وتأكد من كتابته بشكل صحيح',
                    'استخدم شريط البحث للعثور على ما تحتاجه',
                    'ارجع إلى الصفحة الرئيسية واستكشف المنتجات'
                ],
                en: [
                    'Check the link and make sure it\'s written correctly',
                    'Use the search bar to find what you need',
                    'Return to the homepage and explore products'
                ]
            }
        },
        500: {
            title: { ar: 'خطأ في الخادم', en: 'Server Error' },
            message: { ar: 'عذراً! حدث خطأ في الخادم. نحن نعمل على إصلاحه في أقرب وقت ممكن.', en: 'Sorry! A server error occurred. We are working to fix it as soon as possible.' },
            suggestions: {
                ar: [
                    'حاول تحديث الصفحة بعد لحظات',
                    'امسح ذاكرة التخزين المؤقت للمتصفح',
                    'تواصل مع خدمة العملاء إذا استمرت المشكلة'
                ],
                en: [
                    'Try refreshing the page after a few moments',
                    'Clear your browser cache',
                    'Contact customer service if the problem persists'
                ]
            }
        },
        502: {
            title: { ar: 'بوابة سيئة', en: 'Bad Gateway' },
            message: { ar: 'عذراً! الخادم غير قادر على الاتصال حالياً. الرجاء المحاولة لاحقاً.', en: 'Sorry! The server is currently unable to connect. Please try again later.' },
            suggestions: {
                ar: [
                    'حاول تحديث الصفحة بعد بضع دقائق',
                    'تحقق من اتصالك بالإنترنت',
                    'تواصل معنا إذا استمرت المشكلة'
                ],
                en: [
                    'Try refreshing the page after a few minutes',
                    'Check your internet connection',
                    'Contact us if the problem persists'
                ]
            }
        },
        503: {
            title: { ar: 'الخدمة غير متوفرة', en: 'Service Unavailable' },
            message: { ar: 'عذراً! الخدمة غير متوفرة حالياً بسبب صيانة أو زيادة الضغط على الخادم.', en: 'Sorry! The service is currently unavailable due to maintenance or server overload.' },
            suggestions: {
                ar: [
                    'حاول مرة أخرى بعد بضع دقائق',
                    'تابعنا على وسائل التواصل الاجتماعي لمعرفة التحديثات',
                    'سنعود قريباً بخدمة أفضل!'
                ],
                en: [
                    'Try again after a few minutes',
                    'Follow us on social media for updates',
                    'We\'ll be back soon with better service!'
                ]
            }
        }
    };

    const errorData = errors[code] || errors[404];
    return {
        title: errorData.title[language],
        message: errorData.message[language],
        suggestions: errorData.suggestions[language]
    };
}

export default ErrorPage;
