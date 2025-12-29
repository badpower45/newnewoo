import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader, CheckCircle, AlertCircle, KeyRound, ChevronLeft } from 'lucide-react';
import { api } from '../services/api';
import { supabaseAuth } from '../services/supabaseAuth';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.auth.forgotPassword(email.trim());
            setSuccess(true);
        } catch (err: any) {
            // Fallback to Supabase password reset
            try {
                await supabaseAuth.sendResetEmail(email.trim());
                setSuccess(true);
            } catch (supabaseError: any) {
                setError(supabaseError.message || err?.message || 'حدث خطأ. حاول مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-50 to-purple-50"></div>
            
            {/* Animated circles */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Header */}
            <div className="relative p-4 flex items-center z-10">
                <button onClick={() => navigate('/login')} className="p-2 hover:bg-white/50 backdrop-blur-sm rounded-full transition">
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold ml-2 text-gray-800">استعادة كلمة المرور</h1>
            </div>

            <div className="relative flex items-center justify-center p-6 min-h-[calc(100vh-80px)] z-10">
                <div className="w-full max-w-md">
                    {/* Glass Card */}
                    <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-8 border border-white/20">
                        {/* Icon Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-6 hover:rotate-0 transition-transform">
                                <KeyRound size={32} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                                نسيت كلمة المرور؟
                            </h2>
                            <p className="text-gray-600">سنرسل لك رابط لإعادة تعيين كلمة المرور</p>
                        </div>
                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">تم إرسال الرابط!</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                إذا كان هذا البريد مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-primary font-bold hover:underline hover:gap-3 transition-all"
                            >
                                <ArrowRight className="w-5 h-5" />
                                العودة لتسجيل الدخول
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-shake">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Mail size={16} className="text-primary" />
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white/50 backdrop-blur-sm"
                                    dir="ltr"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        جارٍ الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound size={20} />
                                        إرسال رابط إعادة التعيين
                                    </>
                                )}
                            </button>

                            {/* Back to Login */}
                            <div className="text-center pt-2">
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-primary text-sm font-medium flex items-center justify-center gap-2 hover:gap-3 transition-all"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    العودة لتسجيل الدخول
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
        </div>
    );
};

export default ForgotPasswordPage;
