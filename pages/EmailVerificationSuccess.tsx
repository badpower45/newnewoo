import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

const EmailVerificationSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('جاري التحقق من البريد الإلكتروني...');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (!token) {
            setStatus('error');
            setMessage('رابط التفعيل غير صالح');
            return;
        }

        verifyEmail(token);
    }, [searchParams]);

    useEffect(() => {
        if (status === 'success' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && countdown === 0) {
            navigate('/login');
        }
    }, [status, countdown, navigate]);

    const verifyEmail = async (token: string) => {
        try {
            const response = await api.auth.verifyEmail(token);
            setStatus('success');
            setMessage(response.message || 'تم تفعيل حسابك بنجاح! 🎉');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'فشل التحقق من البريد الإلكتروني');
        }
    };

    const handleContinue = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                    <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-full">
                                        <Loader className="w-12 h-12 text-white animate-spin" />
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                                جاري التحقق...
                            </h1>
                            <p className="text-gray-600">
                                {message}
                            </p>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                    <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-full">
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                                تم التفعيل بنجاح! 🎉
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                {message}
                            </p>

                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                                <p className="text-green-800 font-medium">
                                    ✅ حسابك جاهز الآن للاستخدام
                                </p>
                                <p className="text-sm text-green-700 mt-2">
                                    سيتم توجيهك لتسجيل الدخول خلال {countdown} ثواني...
                                </p>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                تسجيل الدخول الآن
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-30"></div>
                                    <div className="relative bg-gradient-to-br from-red-400 to-red-600 p-6 rounded-full">
                                        <XCircle className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                                فشل التفعيل
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                {message}
                            </p>

                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-800 text-sm">
                                    ❌ رابط التفعيل قد يكون منتهي الصلاحية أو غير صحيح
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/email-verification-pending')}
                                    className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
                                >
                                    طلب رابط جديد
                                </button>

                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                                >
                                    العودة لتسجيل الدخول
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationSuccess;
