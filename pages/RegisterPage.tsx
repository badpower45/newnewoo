import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { supabaseAuth } from '../services/supabaseAuth';

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            await register({ 
                firstName, 
                lastName, 
                email, 
                password, 
                phone,
                birthDate: birthDate || undefined
            });
            navigate('/');
        } catch (err: any) {
            setError(err?.message || 'فشل التسجيل. برجاء المحاولة مرة أخرى');
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
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center">
                <button onClick={() => navigate('/login')} className="p-2 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold ml-2">إنشاء حساب</h1>
            </div>

            <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full flex flex-col justify-center">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بك</h2>
                    <p className="text-gray-500">سجل معنا في علوش سوبر ماركت</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأول *</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                placeholder="أحمد"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأخير *</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                placeholder="محمد"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            placeholder="example@email.com"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            placeholder="01xxxxxxxxx"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد (اختياري)</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                جاري التسجيل...
                            </>
                        ) : (
                            'إنشاء الحساب'
                        )}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-sm text-gray-500">أو تابع باستخدام</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <button
                    onClick={handleGoogleSignup}
                    disabled={!!socialLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-60 text-gray-900 font-semibold"
                >
                    {socialLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                    <span>Google</span>
                </button>

                <p className="mt-8 text-center text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
