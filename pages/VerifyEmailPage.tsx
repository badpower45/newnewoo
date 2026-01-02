import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [message, setMessage] = useState('جاري تفعيل بريدك الإلكتروني...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('رابط التفعيل غير صالح');
            return;
        }

        const verify = async () => {
            try {
                await api.auth.verifyEmail(token);
                setStatus('success');
                setMessage('تم تفعيل بريدك بنجاح! سيتم تحويلك لتسجيل الدخول.');
                setTimeout(() => navigate('/login', { replace: true }), 1200);
            } catch (err: any) {
                setStatus('error');
                setMessage(err?.message || 'فشل تفعيل البريد');
            }
        };

        verify();
    }, [searchParams, navigate]);

    const icon = {
        pending: <Loader2 className="w-12 h-12 text-primary animate-spin" />,
        success: <CheckCircle2 className="w-12 h-12 text-green-600" />,
        error: <AlertTriangle className="w-12 h-12 text-red-500" />
    }[status];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="bg-white shadow-xl border border-orange-100 rounded-3xl px-8 py-10 max-w-md w-full text-center">
                <div className="flex justify-center mb-4">{icon}</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">تفعيل البريد الإلكتروني</h1>
                <p className="text-gray-600">{message}</p>
                {status === 'error' && (
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-6 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition"
                    >
                        العودة لتسجيل الدخول
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
