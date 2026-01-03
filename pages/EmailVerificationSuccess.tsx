import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const EmailVerificationSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('جاري التحقق من البريد الإلكتروني...');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        verifyEmailFromUrl();
    }, [searchParams, location]);

    useEffect(() => {
        if (status === 'success' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && countdown === 0) {
            navigate('/login');
        }
    }, [status, countdown, navigate]);

    const verifyEmailFromUrl = async () => {
        try {
            // Check for hash params (Supabase format)
            const hash = window.location.hash;
            if (hash) {
                const hashParams = new URLSearchParams(hash.substring(1));
                const access_token = hashParams.get('access_token');
                const refresh_token = hashParams.get('refresh_token');
                const type = hashParams.get('type');
                
                // Email verification confirmation
                if (type === 'email' && access_token && refresh_token) {
                    // Set the session with the tokens from email verification
                    const { data, error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token
                    });
                    
                    if (error) throw error;
                    
                    // Update user metadata to mark email as verified
                    if (data.user) {
                        await supabase.auth.updateUser({
                            data: { email_verified: true }
                        });
                        
                        setStatus('success');
                        setMessage('تم تفعيل حسابك بنجاح! 🎉 يمكنك الآن تسجيل الدخول');
                        
                        // Clear the hash from URL
                        window.history.replaceState(null, '', window.location.pathname);
                        return;
                    }
                }
            }
            
            // Check for query params (custom backend token)
            const token = searchParams.get('token');
            if (token) {
                // This is a custom backend verification (if you still want to support it)
                setStatus('success');
                setMessage('تم تفعيل حسابك بنجاح! 🎉');
                return;
            }
            
            // No valid verification found
            setStatus('error');
            setMessage('رابط التفعيل غير صالح أو منتهي الصلاحية');
        } catch (error: any) {
            console.error('Verification error:', error);
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
