import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff, Mail, Lock, Ban } from 'lucide-react';
import { api } from '../services/api';
import { supabaseAuth } from '../services/supabaseAuth';
import { blockingService } from '../services/blockingService';
import { supabaseBlockingService } from '../services/supabaseBlockingService';
import CompleteProfileModal from '../components/CompleteProfileModal';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const [profileData, setProfileData] = useState<any>({});
    const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [resetError, setResetError] = useState('');
    const [verifyStatus, setVerifyStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [verifyMessage, setVerifyMessage] = useState('');
    const { login, updateUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setVerifyStatus('idle');
        setVerifyMessage('');
        setIsSubmitting(true);
        
        try {
            // 🚫 Check blocking in Supabase FIRST
            const supabaseBlockCheck = await supabaseBlockingService.checkIfBlocked(email);
            
            if (supabaseBlockCheck.isBlocked) {
                // Log blocked attempt in Supabase
                const userIP = await supabaseBlockingService.getUserIP();
                await supabaseBlockingService.logBlockedAttempt({
                    userEmail: email,
                    ipAddress: userIP || undefined,
                    attemptType: 'login',
                    blockReason: supabaseBlockCheck.blockReason
                });
                
                // Show block message with details
                let blockMessage = 'تم حظر هذا الحساب من استخدام النظام';
                if (supabaseBlockCheck.blockReason) {
                    blockMessage += `\nالسبب: ${supabaseBlockCheck.blockReason}`;
                }
                if (supabaseBlockCheck.banType === 'temporary' && supabaseBlockCheck.daysRemaining) {
                    blockMessage += `\nالحظر مؤقت: متبقي ${supabaseBlockCheck.daysRemaining} يوم`;
                }
                
                setError(blockMessage);
                setIsSubmitting(false);
                return;
            }
            
            // التحقق من البلوك في الباكند أيضاً (fallback)
            const backendBlockCheck = await blockingService.checkIfBlocked(email);
            
            if (backendBlockCheck.isBlocked) {
                // تسجيل المحاولة الفاشلة
                const userIP = await blockingService.getUserIP();
                await blockingService.logBlockedAttempt(
                    email,
                    undefined,
                    userIP || undefined,
                    'login',
                    backendBlockCheck.reason
                );
                
                // عرض رسالة البلوك
                setError(backendBlockCheck.message || 'تم حظر هذا الحساب من استخدام النظام');
                setIsSubmitting(false);
                return;
            }
            
            let session: any = null;
            let user: any = null;
            let supabaseError: any = null;

            try {
                const supabaseLogin = await supabaseAuth.signIn(email.trim(), password);
                session = supabaseLogin.session;
                user = supabaseLogin.user;
                if (session?.access_token) {
                    localStorage.setItem('supabase_token', session.access_token);
                }
            } catch (e) {
                supabaseError = e;
                console.warn('⚠️ Supabase login failed, will try backend login', e);
            }

            // محاولة الحصول على توكن الباكند لضبط الطلبات المحمية
            let backendToken = null;
            let backendUser = null;
            let backendError: any = null;
            
            try {
                const backendLogin = await api.auth.login({ email: email.trim(), password });
                if (backendLogin?.auth && backendLogin?.token) {
                    backendToken = backendLogin.token;
                    backendUser = backendLogin.user;
                    localStorage.setItem('backend_token', backendToken);
                    localStorage.setItem('token', backendToken);
                    console.log('✅ Backend login successful, token stored');
                } else {
                    backendError = new Error('Invalid login');
                    console.warn('⚠️ Backend login returned no token:', backendLogin);
                }
            } catch (e: any) {
                backendError = e;
                console.error('❌ Backend login failed:', e);
                
                // تحسين رسالة الخطأ
                if (e.message === 'Failed to fetch' || e.message?.includes('fetch')) {
                    console.error('🚫 Backend server is not reachable');
                    setError('لا يمكن الاتصال بالخادم. تأكد من تشغيل Backend أو جرب لاحقاً');
                    setIsSubmitting(false);
                    return;
                }
                
                // Check if user is blocked from backend response
                if (e?.response?.data?.blocked || e?.response?.status === 403) {
                    const blockMessage = e?.response?.data?.error || e?.response?.data?.reason || 'تم حظر هذا الحساب من استخدام النظام';
                    setError(blockMessage);
                    setIsSubmitting(false);
                    return;
                }
            }

            if (!backendToken && session?.access_token) {
                const noUser = backendError?.status === 404 || String(backendError?.message || '').includes('No user');
                if (noUser) {
                    try {
                        const nameFromEmail = email.trim().split('@')[0] || 'User';
                        const registerPayload = {
                            name: user?.user_metadata?.full_name || user?.user_metadata?.name || nameFromEmail,
                            email: email.trim(),
                            password
                        };
                        const backendRegister = await api.auth.register(registerPayload);
                        if (backendRegister?.auth && backendRegister?.token) {
                            backendToken = backendRegister.token;
                            backendUser = backendRegister.user;
                            localStorage.setItem('backend_token', backendToken);
                            localStorage.setItem('token', backendToken);
                            console.log('✅ Backend user created & token stored');
                        }
                    } catch (regErr) {
                        console.error('❌ Backend auto-register failed:', regErr);
                    }
                }
            }

            if (!backendToken) {
                if (backendError?.status === 429) {
                    setError('الخادم عليه ضغط حالياً (Too Many Requests). جرب بعد دقيقة.');
                } else if (backendError?.status === 403) {
                    setError(backendError.message || 'غير مصرح. تأكد من تفعيل البريد أولاً.');
                } else if (backendError?.status === 401) {
                    setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                } else {
                    setError('تعذر تسجيل الدخول في الخادم. تأكد من أن الباك‑إند شغال ثم جرّب مرة أخرى.');
                }
                setIsSubmitting(false);
                return;
            }

            // Normalize user object - prefer backend user data
            const userRole = backendUser?.role || user?.user_metadata?.role || user?.app_metadata?.role || 'customer';
            const appUser = {
                id: backendUser?.id || user?.id || 'supabase-user',
                email: backendUser?.email || user?.email || email.trim(),
                name: backendUser?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
                phone: backendUser?.phone || user?.user_metadata?.phone || user?.phone,
                role: userRole,
                isGuest: false
            };

            // Persist user for AuthContext hydration
            localStorage.setItem('user', JSON.stringify(appUser));
            updateUser(appUser);
            
            // Navigate based on role
            if (userRole === 'delivery') {
                navigate('/delivery');
            } else if (userRole === 'distributor') {
                navigate('/admin/distribution');
            } else if (['admin', 'manager'].includes(userRole)) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            console.error('❌ Login error:', err);
            
            if (err.message?.includes('Invalid login')) {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            } else if (err.message?.includes('Email not confirmed')) {
                setError('الرجاء تأكيد بريدك الإلكتروني أولاً');
                setVerifyStatus('idle');
            } else {
                setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteProfile = (userData: any) => {
        updateUser(userData);
        setShowCompletion(false);
        navigate('/');
    };

    const handleGoogleLogin = async () => {
        setSocialLoading('google');
        setError('');
        try {
            await supabaseAuth.signInWithGoogle();
            // سيحدث redirect لـ Google ثم رجوع لـ /auth/callback تلقائياً
        } catch (err: any) {
            setError(err.message || 'فشل تسجيل الدخول بجوجل');
            setSocialLoading(null);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            setVerifyStatus('error');
            setVerifyMessage('اكتب بريدك الإلكتروني أولاً ثم أعد الإرسال');
            return;
        }
        setVerifyStatus('sending');
        setVerifyMessage('');
        try {
            const res = await api.auth.resendVerification(email.trim());
            setVerifyStatus('sent');
            setVerifyMessage(res?.message || 'تم إرسال رابط التفعيل إلى بريدك');
        } catch (err: any) {
            setVerifyStatus('error');
            setVerifyMessage(err?.message || 'تعذر إرسال رابط التفعيل');
        }
    };

    const handleSendResetLink = async () => {
        if (!email) {
            setResetError('اكتب بريدك الإلكتروني أولاً');
            return;
        }
        setResetError('');
        setResetStatus('sending');
        try {
            await api.auth.forgotPassword(email.trim());
            setResetStatus('sent');
        } catch (err: any) {
            setResetError(err.message || 'تعذر إرسال الرابط');
            setResetStatus('error');
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

                <h2 className="text-xl font-bold text-gray-900 text-center mb-6">تسجيل الدخول</h2>

                {/* Error Message */}
                {error && (
                    <div className={`p-3 rounded-2xl mb-4 text-sm border animate-shake space-y-2 ${
                        error.includes('حظر')
                            ? 'bg-gray-900 text-white border-gray-800'
                            : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                        <div className="flex items-start gap-2">
                            {error.includes('حظر') && <Ban className="text-red-500 mt-0.5 flex-shrink-0" size={18} />}
                            <div className="flex-1">
                                <p className="font-bold mb-1">{error.includes('حظر') ? '🚫 تم حظر هذا الحساب' : 'خطأ في تسجيل الدخول'}</p>
                                <p className={error.includes('حظر') ? 'text-gray-300 text-xs' : 'text-xs'}>{error}</p>
                            </div>
                        </div>
                        {!error.includes('حظر') && (
                            <button type="button" onClick={handleResendVerification} className="text-xs font-bold text-purple-700 underline flex items-center justify-center gap-1 mx-auto disabled:opacity-60" disabled={verifyStatus === 'sending'}>
                                {verifyStatus === 'sent' ? 'تم إرسال رابط التفعيل ✉️' : verifyStatus === 'sending' ? 'جاري الإرسال...' : 'إعادة إرسال رابط التفعيل'}
                            </button>
                        )}
                        {verifyMessage && <p className={`text-xs ${verifyStatus === 'error' ? 'text-red-600' : 'text-green-700'}`}>{verifyMessage}</p>}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pr-11 pl-4 py-4 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-gray-700 placeholder-gray-400 text-sm bg-white"
                            placeholder="البريد الإلكتروني"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Lock size={18} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pr-11 pl-11 py-4 rounded-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-gray-700 placeholder-gray-400 text-sm bg-white"
                            placeholder="كلمة المرور"
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-between items-center">
                        <Link to="/forgot-password" className="text-sm text-orange-500 font-medium hover:underline">نسيت كلمة المرور؟</Link>
                        <button type="button" onClick={handleSendResetLink} disabled={resetStatus === 'sending'} className="text-xs text-gray-500 hover:underline disabled:opacity-60">
                            {resetStatus === 'sent' ? '✉️ تم الإرسال' : resetStatus === 'sending' ? 'جارٍ...' : 'إرسال رابط الإعادة'}
                        </button>
                    </div>
                    {resetError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{resetError}</p>}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-orange-500 text-white font-bold py-4 rounded-full hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-base shadow-lg shadow-orange-200"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                جاري تسجيل الدخول...
                            </span>
                        ) : 'تسجيل الدخول'}
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
                    {/* Google */}
                    <button
                        onClick={() => { setSocialLoading('google'); handleGoogleLogin(); }}
                        disabled={socialLoading !== null}
                        className="flex items-center justify-center gap-3 w-full border border-gray-200 bg-white rounded-full py-3.5 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
                        title="Google"
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
                        <span className="text-sm font-semibold text-gray-700">تسجيل الدخول بـ Google</span>
                    </button>
                </div>

                {/* Bottom Link */}
                <p className="text-center text-gray-500 text-sm">
                    ليس لديك حساب؟{' '}
                    <Link to="/register" className="text-orange-500 font-bold hover:underline">
                        إنشاء حساب
                    </Link>
                </p>
            </div>

            {/* Complete Profile Modal */}
            <CompleteProfileModal
                isOpen={showCompletion}
                onClose={() => setShowCompletion(false)}
                onComplete={handleCompleteProfile}
                initialData={profileData}
            />
        </div>
    );
};

export default LoginPage;
