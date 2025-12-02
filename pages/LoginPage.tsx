import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Facebook, Mail, Loader2 } from 'lucide-react';
import api from '../services/api';

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
    const { login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await login({ email, password });
            
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
            setError('Invalid email or password');
        }
    };

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate('/');
    };

    const handleGoogleLogin = async () => {
        setSocialLoading('google');
        setError('');
        
        try {
            // For demo purposes, simulate Google login
            // In production, you would use Google Sign-In SDK
            const mockGoogleData = {
                googleId: 'demo_google_' + Date.now(),
                email: 'demo.google@example.com',
                name: 'Google User',
                picture: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff'
            };
            
            const response = await api.auth.googleLogin(mockGoogleData);
            
            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                window.location.href = '/';
            }
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
            
            const response = await api.auth.facebookLogin(mockFacebookData);
            
            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                window.location.href = '/';
            }
        } catch (err: any) {
            setError(err.message || 'فشل تسجيل الدخول بفيسبوك');
        } finally {
            setSocialLoading(null);
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
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                    >
                        Log In
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
                        className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
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
                        className="flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
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
        </div>
    );
};

export default LoginPage;
