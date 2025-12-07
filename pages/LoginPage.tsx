import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Facebook, Mail, Loader2, Phone, X, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { supabaseAuth } from '../services/supabaseAuth';

// Declare Google types
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    prompt: () => void;
                };
            };
        };
        FB?: {
            init: (config: any) => void;
            login: (callback: (response: any) => void, options?: any) => void;
            api: (path: string, callback: (response: any) => void) => void;
        };
    }
}

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingSocial, setPendingSocial] = useState<null | { provider: 'google' | 'facebook'; profile: any }>(null);
    const [completionData, setCompletionData] = useState({ name: '', email: '', phone: '' });
    const [showCompletion, setShowCompletion] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [otpStatus, setOtpStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'done'>('idle');
    const [otpError, setOtpError] = useState('');
    const { login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const userData = await login({ email: email.trim(), password });
            
            // توجيه بناءً على الـ role
            if (userData?.role === 'delivery') {
                navigate('/delivery');
            } else if (userData?.role === 'distributor') {
                navigate('/admin/distribution');
            } else if (['admin', 'manager'].includes(userData?.role || '')) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Invalid email or password';
            setError(message);
        }
        setIsSubmitting(false);
    };

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate('/');
    };

    const finalizeSocialLogin = async (provider: 'google' | 'facebook', profile: any) => {
        const response = provider === 'google' 
            ? await api.auth.googleLogin(profile)
            : await api.auth.facebookLogin(profile);
        if (response.token && response.user) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify({ ...response.user, isGuest: false }));
            window.location.href = '/';
        } else {
            throw new Error('فشل تسجيل الدخول الاجتماعي');
        }
    };

    const promptCompletion = (provider: 'google' | 'facebook', profile: any) => {
        setPendingSocial({ provider, profile });
        setCompletionData({
            name: profile?.name || '',
            email: profile?.email || '',
            phone: ''
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

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingSocial) return;

        try {
            setSocialLoading(pendingSocial.provider);
            const mergedProfile = {
                ...pendingSocial.profile,
                ...completionData,
                phone: completionData.phone
            };
            await finalizeSocialLogin(pendingSocial.provider, mergedProfile);
            setShowCompletion(false);
            setPendingSocial(null);
        } catch (err: any) {
            setError(err.message || 'برجاء إعادة المحاولة');
        } finally {
            setSocialLoading(null);
        }
    };

    const handleSendOtp = async () => {
        if (!otpEmail) {
            setOtpError('أدخل البريد الإلكتروني أولاً');
            return;
        }
        setOtpError('');
        setOtpStatus('sending');
        try {
            await supabaseAuth.sendEmailOtp(otpEmail.trim());
            setOtpStatus('sent');
        } catch (err: any) {
            setOtpError(err.message || 'تعذر إرسال الرمز');
            setOtpStatus('idle');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpEmail || !otpToken) {
            setOtpError('أدخل البريد والرمز');
            return;
        }
        setOtpError('');
        setOtpStatus('verifying');
        try {
            const result = await supabaseAuth.verifyEmailOtp(otpEmail.trim(), otpToken.trim());
            const session = result.session || (await supabaseAuth.getSession());
            const supaUser = result.user || session?.user;
            const token = session?.access_token || 'supabase-session';

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                id: supaUser?.id || 'supabase-user',
                email: supaUser?.email || otpEmail.trim(),
                name: supaUser?.email?.split('@')[0] || 'Supabase User',
                role: 'customer',
                isGuest: false
            }));
            setOtpStatus('done');
            window.location.href = '/';
        } catch (err: any) {
            setOtpError(err.message || 'فشل التحقق من الرمز');
            setOtpStatus('sent');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold ml-2">Login</h1>
            </div>

            <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full flex flex-col justify-center">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-500">Sign in to continue to Lumina Fresh Market</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18} /> Signing In...</span>
                        ) : (
                            'Log In'
                        )}
                    </button>
                </form>

                <div className="my-8 flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-sm text-gray-500">Or continue with</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={handleFacebookLogin}
                        disabled={socialLoading !== null}
                        className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 text-gray-900 font-semibold"
                    >
                        {socialLoading === 'facebook' ? (
                            <Loader2 size={20} className="animate-spin text-blue-600" />
                        ) : (
                            <Facebook size={20} className="text-blue-600" />
                        )}
                        <span className="font-medium text-gray-700">Facebook</span>
                    </button>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={socialLoading !== null}
                        className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 text-gray-900 font-semibold"
                    >
                        {socialLoading === 'google' ? (
                            <Loader2 size={20} className="animate-spin text-red-500" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                        <span className="font-medium text-gray-700">Google</span>
                    </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">تسجيل برمز OTP (Supabase)</p>
                            <p className="text-xs text-gray-500">أرسل رمز إلى بريدك ثم أدخله للتسجيل السريع.</p>
                        </div>
                        <KeyRound size={18} className="text-primary" />
                    </div>

                    {otpError && (
                        <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{otpError}</div>
                    )}

                    <div className="space-y-2">
                        <input
                            type="email"
                            value={otpEmail}
                            onChange={(e) => setOtpEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                        />
                        {otpStatus !== 'idle' && (
                            <input
                                type="text"
                                value={otpToken}
                                onChange={(e) => setOtpToken(e.target.value)}
                                placeholder="أدخل رمز التحقق"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                            />
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpStatus === 'sending' || otpStatus === 'sent' || otpStatus === 'verifying'}
                            className="flex-1 px-3 py-2 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/5 disabled:opacity-60"
                        >
                            {otpStatus === 'sending' ? 'جارٍ الإرسال...' : otpStatus === 'sent' ? 'تم الإرسال' : 'إرسال الرمز'}
                        </button>
                        <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otpStatus === 'verifying' || otpStatus === 'idle'}
                            className="flex-1 px-3 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60"
                        >
                            {otpStatus === 'verifying' ? 'جارٍ التحقق...' : 'تأكيد الرمز وتسجيل الدخول'}
                        </button>
                    </div>
                    {otpStatus === 'done' && (
                        <p className="text-xs text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">تم التحقق! سيتم تحويلك الآن.</p>
                    )}
                </div>

                <button
                    onClick={handleGuestLogin}
                    className="w-full py-3.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                    Continue as Guest
                </button>

                <p className="mt-8 text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary font-bold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>

            {showCompletion && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowCompletion(false)}
                            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
                            aria-label="إغلاق"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">أكمل بياناتك</h3>
                        <p className="text-sm text-gray-500 mb-4">بعض البيانات غير موجودة من مزود الدخول. يرجى استكمالها.</p>
                        <form onSubmit={handleCompleteProfile} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                                <input
                                    type="text"
                                    value={completionData.name}
                                    onChange={(e) => setCompletionData({ ...completionData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={completionData.email}
                                    onChange={(e) => setCompletionData({ ...completionData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الموبايل</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        value={completionData.phone}
                                        onChange={(e) => setCompletionData({ ...completionData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                                        placeholder="01XXXXXXXXX"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!!socialLoading}
                                className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-70"
                            >
                                {socialLoading ? 'جارٍ الحفظ...' : 'حفظ وإكمال التسجيل'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
