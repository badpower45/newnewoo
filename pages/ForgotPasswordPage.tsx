import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.auth.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#F97316] to-[#ea580c] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <span className="text-3xl">🍊</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#1F2937]">نسيت كلمة المرور؟</h1>
                    <p className="text-[#6B7280] mt-2">أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1F2937] mb-2">تم إرسال الرابط!</h3>
                            <p className="text-[#6B7280] mb-6">
                                إذا كان هذا البريد مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-[#F97316] font-medium hover:underline"
                            >
                                <ArrowRight className="w-4 h-4" />
                                العودة لتسجيل الدخول
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                                    البريد الإلكتروني
                                </label>
                                <div className="relative">
                                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        className="w-full pr-10 pl-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] text-right"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-[#F97316] to-[#ea580c] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    'إرسال رابط إعادة التعيين'
                                )}
                            </button>

                            {/* Back to Login */}
                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-[#6B7280] hover:text-[#F97316] text-sm flex items-center justify-center gap-1"
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
    );
};

export default ForgotPasswordPage;
