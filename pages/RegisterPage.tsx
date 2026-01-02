import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Loader2, User, Mail, Phone, Lock, Calendar, Eye, EyeOff, UserPlus } from 'lucide-react';
import { supabaseAuth } from '../services/supabaseAuth';

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
            // Use Supabase Auth for registration
            const { user, session } = await supabaseAuth.signUp(email, password, {
                firstName,
                lastName,
                phone,
                birthDate
            });
            
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
                localStorage.setItem('supabase.auth.token', session.access_token);
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
        <div className="min-h-screen relative overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-primary/10"></div>
            
            {/* Animated circles */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Header */}
            <div className="relative p-4 flex items-center z-10">
                <button onClick={() => navigate('/login')} className="p-2 hover:bg-white/50 backdrop-blur-sm rounded-full transition">
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold ml-2 text-gray-800">إنشاء حساب جديد</h1>
            </div>

            <div className="relative flex-1 px-6 py-8 max-w-lg mx-auto w-full flex flex-col justify-center z-10">
                {/* Glass Card */}
                <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl p-8 border border-white/20">
                    <div className="mb-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg -rotate-6 hover:rotate-0 transition-transform">
                            <UserPlus size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-primary bg-clip-text text-transparent mb-2">
                            مرحباً بك
                        </h2>
                        <p className="text-gray-600">انضم إلى علوش سوبر ماركت</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center border border-red-100 animate-shake">
                            {error}
                        </div>
                    )}
                    
                    {showVerificationMessage && (
                        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl mb-4 text-sm border border-blue-200 space-y-3">
                            <div className="flex items-center gap-2 font-bold">
                                <Mail size={18} />
                                <span>{verificationInfo?.message || 'تم إنشاء حسابك بنجاح! ✅'}</span>
                            </div>
                            <p>تم إرسال رابط تفعيل إلى بريدك الإلكتروني <strong>{verificationInfo?.email || email}</strong></p>
                            <p className="text-xs">يرجى التحقق من صندوق الوارد الخاص بك وتفعيل بريدك للمتابعة.</p>
                            {verificationInfo?.verificationUrl && (
                                <a 
                                    href={verificationInfo.verificationUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-xs text-blue-700 underline font-semibold"
                                >
                                    فتح رابط التفعيل (للاختبار)
                                </a>
                            )}
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                الانتقال إلى تسجيل الدخول
                            </button>
                        </div>
                    )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <User size={16} className="text-purple-600" />
                                الاسم الأول *
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all bg-white/50 backdrop-blur-sm"
                                placeholder="أحمد"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <User size={16} className="text-purple-600" />
                                الاسم الأخير *
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all bg-white/50 backdrop-blur-sm"
                                placeholder="محمد"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Mail size={16} className="text-purple-600" />
                            البريد الإلكتروني *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all bg-white/50 backdrop-blur-sm"
                            placeholder="example@email.com"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Phone size={16} className="text-purple-600" />
                            رقم الهاتف *
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all bg-white/50 backdrop-blur-sm"
                            placeholder="01xxxxxxxxx"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar size={16} className="text-purple-600" />
                            تاريخ الميلاد (اختياري)
                        </label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all bg-white/50 backdrop-blur-sm"
                        />
                    </div>
                    
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Lock size={16} className="text-purple-600" />
                                كلمة المرور *
                            </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all bg-white/50 backdrop-blur-sm pr-12"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">* يجب أن تكون 8 أحرف على الأقل وتتضمن حرفاً كبيراً وصغيراً ورقماً ورمزاً خاصاً</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-600 to-primary text-white font-bold py-4 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all transform hover:-translate-y-1 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                جاري التسجيل...
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                إنشاء الحساب
                            </>
                        )}
                    </button>
                </form>

                <div className="my-8 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-600 font-medium">أو تابع مع</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <button
                    onClick={handleGoogleSignup}
                    disabled={!!socialLoading}
                    className="group relative overflow-hidden w-full flex items-center justify-center gap-2 py-4 border-2 border-gray-200 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-60 text-gray-900 font-semibold bg-white/50 backdrop-blur-sm"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 to-red-600/0 group-hover:from-red-600/10 group-hover:to-red-400/10 transition-all"></div>
                    {socialLoading ? <Loader2 className="animate-spin" size={22} /> : (
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
                    <span className="relative z-10">Google</span>
                </button>

                <p className="mt-8 text-center text-gray-600">
                    لديك حساب بالفعل؟{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline bg-gradient-to-r from-purple-600 to-primary bg-clip-text text-transparent">
                        تسجيل الدخول
                    </Link>
                </p>
            </div>
        </div>
        </div>
    );
};

export default RegisterPage;
