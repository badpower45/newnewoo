import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { supabaseAuth } from '../services/supabaseAuth';
import { api } from '../services/api';
import { blockingService } from '../services/blockingService';

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);
    const [verificationInfo, setVerificationInfo] = useState<{ email?: string; message?: string; verificationUrl?: string } | null>(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setVerificationInfo(null);
        setShowVerificationMessage(false);
        setIsSubmitting(true);
        
        try {
            // التحقق من البلوك أولاً
            const blockCheck = await blockingService.checkIfBlocked(email, phone);
            
            if (blockCheck.isBlocked) {
                // تسجيل المحاولة الفاشلة
                const userIP = await blockingService.getUserIP();
                await blockingService.logBlockedAttempt(
                    email,
                    phone,
                    userIP || undefined,
                    'register',
                    blockCheck.reason
                );
                
                // عرض رسالة البلوك
                setError(blockCheck.message || 'تم حظر هذا الحساب من استخدام النظام');
                setIsSubmitting(false);
                return;
            }
            
            // Use Supabase Auth for registration
            const { user, session } = await supabaseAuth.signUp(email, password, {
                firstName,
                lastName,
                phone,
                birthDate
            });

            // Try to sync user with backend (so protected APIs work)
            try {
                const backendRegister = await api.auth.register({
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`.trim(),
                    email,
                    phone,
                    birthDate,
                    password
                });
                if (backendRegister?.auth && backendRegister?.token) {
                    localStorage.setItem('backend_token', backendRegister.token);
                    localStorage.setItem('token', backendRegister.token);
                    localStorage.setItem('user', JSON.stringify({ ...backendRegister.user, isGuest: false }));
                }
            } catch (backendErr) {
                console.warn('⚠️ Backend registration failed (will continue with Supabase only):', backendErr);
            }
            
            if (user && !session) {
                // Email verification required
                setVerificationInfo({
                    email: email,
                    message: 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني. الرجاء التحقق من بريدك لتفعيل حسابك.',
                });
                setShowVerificationMessage(true);
                
                // Navigate to verification pending page
                setTimeout(() => {
                    navigate(`/email-verification-pending?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else if (session) {
                // Auto logged in (email confirmation disabled in Supabase)
                // Store session and navigate
                localStorage.setItem('supabase_token', session.access_token);
                navigate('/');
            }
        } catch (err: any) {
            console.error('❌ Registration error:', err);
            
            // Handle Supabase errors
            if (err.message?.includes('already registered')) {
                setError('هذا البريد الإلكتروني مسجل بالفعل');
            } else if (err.message?.includes('Password')) {
                setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            } else if (err.message?.includes('Email')) {
                setError('البريد الإلكتروني غير صحيح');
            } else {
                setError(err.message || 'حدث خطأ أثناء التسجيل. حاول مرة أخرى');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignup = async () => {
        setSocialLoading('google');
        setError('');
        try {
            await supabaseAuth.signInWithGoogle();
            setSocialLoading(null);
        } catch (err: any) {
            setError(err.message || 'تعذر استخدام جوجل للتسجيل');
            setSocialLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8" dir="rtl">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

                {/* Logo */}
                <div className="text-center mb-6">
                    <img
                        src="/images/allosh-logo.png"
                        alt="علوش"
                        className="h-20 w-auto mx-auto object-contain"
                    />
                </div>

                <h2 className="text-xl font-bold text-gray-900 text-center mb-6">إنشاء حسابك</h2>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-2xl mb-4 text-xs text-center border border-red-100 animate-shake">
                        {error}
                    </div>
                )}

                {/* Verification success */}
                {showVerificationMessage && (
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl mb-4 text-sm border border-blue-200 space-y-2">
                        <div className="flex items-center gap-2 font-bold">
                            <Mail size={16} />
                            <span>تم إنشاء حسابك! ✅</span>
                        </div>
                        <p className="text-xs">تم إرسال رابط التفعيل إلى <strong>{verificationInfo?.email || email}</strong></p>
                        <button onClick={() => navigate('/login')} className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-sm font-bold">
                            الانتقال إلى تسجيل الدخول
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><User size={16} /></div>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                className="w-full pr-9 pl-3 py-3.5 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-gray-700 placeholder-gray-400 text-sm bg-white"
                                placeholder="الاسم الأول" required />
                        </div>
                        <div className="relative">
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><User size={16} /></div>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                                className="w-full pr-9 pl-3 py-3.5 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-gray-700 placeholder-gray-400 text-sm bg-white"
                                placeholder="الاسم الأخير" required />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Mail size={18} /></div>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full pr-11 pl-4 py-4 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-gray-700 placeholder-gray-400 text-sm bg-white"
                            placeholder="البريد الإلكتروني" required />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Phone size={18} /></div>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="w-full pr-11 pl-4 py-4 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-gray-700 placeholder-gray-400 text-sm bg-white"
                            placeholder="رقم الهاتف" required />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Lock size={18} /></div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pr-11 pl-11 py-4 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-gray-700 placeholder-gray-400 text-sm bg-white"
                            placeholder="كلمة المرور"
                            required minLength={8}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-orange-500 text-white font-bold py-4 rounded-full hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-base shadow-lg shadow-orange-200"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 size={20} className="animate-spin" />
                                جاري التسجيل...
                            </span>
                        ) : 'إنشاء الحساب'}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="px-4 text-sm text-gray-400">— أو تسجيل مع —</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Social Buttons */}
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={handleGoogleSignup}
                        disabled={!!socialLoading}
                        className="flex items-center justify-center gap-3 w-full border border-gray-200 bg-white rounded-full py-3.5 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
                    >
                        {socialLoading === 'google' ? (
                            <Loader2 size={20} className="animate-spin text-orange-500" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        )}
                        <span className="text-sm font-semibold text-gray-700">التسجيل بـ Google</span>
                    </button>
                </div>

                {/* Bottom Link */}
                <p className="text-center text-gray-500 text-sm">
                    لديك حساب بالفعل؟{' '}
                    <Link to="/login" className="text-orange-500 font-bold hover:underline">
                        تسجيل الدخول
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
