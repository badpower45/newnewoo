import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

const EmailVerificationPending: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (countdown > 0 && !canResend) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    const handleResendEmail = async () => {
        if (!email) {
            alert('الرجاء إدخال البريد الإلكتروني');
            return;
        }

        setResendLoading(true);
        setResendSuccess(false);

        try {
            await api.auth.resendVerification(email);
            setResendSuccess(true);
            setCountdown(60);
            setCanResend(false);
            
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (error: any) {
            alert(error.message || 'فشل إرسال البريد. حاول مرة أخرى');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        // يمكن إضافة API call للتحقق من حالة التفعيل
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-full">
                                <Mail className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                        تحقق من بريدك الإلكتروني
                    </h1>
                    
                    <p className="text-center text-gray-600 mb-6">
                        لقد أرسلنا رسالة تأكيد إلى
                    </p>

                    {/* Email Display */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6 text-center">
                        <p className="text-orange-800 font-semibold text-lg" dir="ltr">
                            {email || 'your-email@example.com'}
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600">
                                افتح بريدك الإلكتروني وابحث عن رسالة من علوش
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600">
                                اضغط على رابط التفعيل الموجود في الرسالة
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600">
                                سيتم تفعيل حسابك فوراً وتوجيهك للصفحة الرئيسية
                            </p>
                        </div>
                    </div>

                    {/* Resend Success Message */}
                    {resendSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-sm text-green-800">
                                ✅ تم إرسال رابط التفعيل بنجاح
                            </p>
                        </div>
                    )}

                    {/* Resend Button */}
                    <div className="space-y-3">
                        <button
                            onClick={handleResendEmail}
                            disabled={!canResend || resendLoading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                                canResend && !resendLoading
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {resendLoading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    جاري الإرسال...
                                </>
                            ) : canResend ? (
                                <>
                                    <RefreshCw className="w-5 h-5" />
                                    إعادة إرسال رابط التفعيل
                                </>
                            ) : (
                                <>
                                    <Clock className="w-5 h-5" />
                                    إعادة الإرسال بعد {countdown} ثانية
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleCheckStatus}
                            className="w-full py-3 px-4 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            لقد فعلت حسابي
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 text-center">
                            💡 لم تستلم الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
                        </p>
                    </div>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-orange-600 hover:text-orange-700 font-medium text-sm underline"
                        >
                            العودة لتسجيل الدخول
                        </button>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    رابط التفعيل صالح لمدة 24 ساعة فقط
                </p>
            </div>
        </div>
    );
};

export default EmailVerificationPending;
