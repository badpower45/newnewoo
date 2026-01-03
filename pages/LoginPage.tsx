import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Loader2, Eye, EyeOff, Mail, Lock, LogIn, Ban } from 'lucide-react';
import { api } from '../services/api';
import { supabaseAuth } from '../services/supabaseAuth';
import { blockingService } from '../services/blockingService';
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
            // التحقق من البلوك أولاً بالإيميل
            const blockCheck = await blockingService.checkIfBlocked(email);
            
            if (blockCheck.isBlocked) {
                // تسجيل المحاولة الفاشلة
                const userIP = await blockingService.getUserIP();
                await blockingService.logBlockedAttempt(
                    email,
                    undefined,
                    userIP || undefined,
                    'login',
                    blockCheck.reason
                );
                
                // عرض رسالة البلوك
                setError(blockCheck.message || 'تم حظر هذا الحساب من استخدام النظام');
                setIsSubmitting(false);
                return;
            }
            
            // Use Supabase Auth for login
            const { session, user } = await supabaseAuth.signIn(email.trim(), password);
            
            if (!session) {
                throw new Error('فشل تسجيل الدخول');
            }
            
            // Store session
            localStorage.setItem('supabase.auth.token', session.access_token);

            // Normalize user object with role
            const userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'customer';
            const appUser = {
                id: user?.id || 'supabase-user',
                email: user?.email || email.trim(),
                name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Supabase User',
                phone: user?.user_metadata?.phone || user?.phone,
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

    const finalizeSocialLogin = async (provider: 'google' | 'facebook', profile: any) => {
        const response = provider === 'google' 
            ? await api.auth.googleLogin(profile)
            : await api.auth.facebookLogin(profile);
        
        if (response.token && response.user) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify({ ...response.user, isGuest: false }));
            
            // Check if profile needs completion
            if (response.needsCompletion) {
                promptCompletion(provider, response.user);
            } else {
                window.location.href = '/';
            }
        } else {
            throw new Error('فشل تسجيل الدخول الاجتماعي');
        }
    };

    const promptCompletion = (provider: 'google' | 'facebook', userData: any) => {
        setProfileData({
            firstName: userData.firstName || userData.name?.split(' ')[0] || '',
            lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
            email: userData.email || '',
            phone: userData.phone || '',
            birthDate: userData.birthDate || ''
        });
        setShowCompletion(true);
    };

    const handleGoogleLogin = async () => {
        setSocialLoading('google');
        setError('');
        
        try {
            // حاليًا نستعمل OAuth من Supabase (يعيد التوجيه للكولباك)
            await supabaseAuth.signInWithGoogle();
            // سيحدث إعادة توجيه؛ في حال لم يتم التحويل لأي سبب
            setSocialLoading(null);
        } catch (err: any) {
            setError(err.message || 'فشل تسجيل الدخول بجوجل');
        } finally {
            setSocialLoading(null);
        }
    };

    const handleFacebookLogin = async () => {
        setSocialLoading('facebook');
        setError('');
        
        try {
            // For demo purposes, simulate Facebook login
            // In production, you would use Facebook SDK
            const mockFacebookData = {
                facebookId: 'demo_fb_' + Date.now(),
                email: 'demo.facebook@example.com',
                name: 'Facebook User',
                picture: 'https://ui-avatars.com/api/?name=Facebook+User&background=1877F2&color=fff'
            };
            
            if (!mockFacebookData.email || !mockFacebookData.name) {
                promptCompletion('facebook', mockFacebookData);
            } else {
                await finalizeSocialLogin('facebook', mockFacebookData);
            }
        } catch (err: any) {
            setError(err.message || 'فشل تسجيل الدخول بفيسبوك');
        } finally {
            setSocialLoading(null);
        }
    };

    const handleCompleteProfile = (userData: any) => {
        // Update user in AuthContext
        updateUser(userData);
        setShowCompletion(false);
        navigate('/');
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
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-white">
            {/* Background accents */}
            <div className="absolute top-16 left-6 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-16 right-6 w-80 h-80 bg-amber-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Header */}
            <div className="relative p-4 flex items-center z-10">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-white/50 backdrop-blur-sm rounded-full transition">
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold ml-2 text-gray-900">تسجيل الدخول</h1>
            </div>

            {/* Main Content */}
            <div className="relative flex-1 px-6 py-8 max-w-md mx-auto w-full flex flex-col justify-center z-10">
                {/* Glass Card */}
                <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-orange-100">
                    <div className="mb-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 hover:rotate-0 transition-transform">
                            <LogIn size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                            أهلاً بعودتك
                        </h2>
                        <p className="text-gray-600">سجل دخولك للمتابعة إلى علوش سوبر ماركت</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-3 text-sm text-center border border-red-100 animate-shake space-y-2">
                            <div>{error}</div>
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                className="text-xs font-bold text-purple-700 underline flex items-center justify-center gap-1 mx-auto disabled:opacity-60"
                                disabled={verifyStatus === 'sending'}
                            >
                                {verifyStatus === 'sent' ? 'تم إرسال رابط التفعيل ✉️' : verifyStatus === 'sending' ? 'جاري الإرسال...' : 'إعادة إرسال رابط التفعيل'}
                            </button>
                            {verifyMessage && (
                                <p className={`text-xs ${verifyStatus === 'error' ? 'text-red-600' : 'text-green-700'}`}>
                                    {verifyMessage}
                                </p>
                            )}
                        </div>
                    )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Mail size={16} className="text-primary" />
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white/50 backdrop-blur-sm"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Lock size={16} className="text-primary" />
                            كلمة المرور
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white/50 backdrop-blur-sm pr-12"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-3">
                        <Link to="/forgot-password" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                            نسيت كلمة المرور؟
                        </Link>
                        <button
                            type="button"
                            onClick={handleSendResetLink}
                            disabled={resetStatus === 'sending'}
                            className="text-sm font-semibold text-purple-700 hover:underline disabled:opacity-60"
                        >
                            {resetStatus === 'sent' ? 'تم إرسال رابط التغيير ✉️' : resetStatus === 'sending' ? 'جارٍ الإرسال...' : 'أرسل رابط إعادة التعيين'}
                        </button>
                    </div>
                    {resetError && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                            {resetError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={20} /> 
                                جاري تسجيل الدخول...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <LogIn size={20} />
                                تسجيل الدخول
                            </span>
                        )}
                    </button>
                </form>

                <div className="my-8 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-600 font-medium">أو تابع مع</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <div className="mb-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={socialLoading !== null}
                        className="group relative overflow-hidden flex items-center justify-center gap-2 py-4 border-2 border-gray-200 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50 bg-white/50 backdrop-blur-sm w-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/0 group-hover:from-red-600/10 group-hover:to-red-400/10 transition-all"></div>
                        {socialLoading === 'google' ? (
                            <Loader2 size={22} className="animate-spin text-red-500" />
                        ) : (
                            <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        <span className="font-semibold text-gray-700 relative z-10">Google</span>
                    </button>
                </div>

                <p className="mt-8 text-center text-gray-600">
                    ليس لديك حساب؟{' '}
                    <Link to="/register" className="text-primary font-bold hover:underline bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        إنشاء حساب جديد
                    </Link>
                </p>
            </div>
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
