import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabaseAuth } from '../services/supabaseAuth';
import { api } from '../services/api';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('جارٍ استكمال تسجيل الدخول...');

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error') || params.get('error_description');
      const code = params.get('code');

      if (error) {
        setStatus('error');
        setMessage(error);
        return;
      }

      try {
        const session = await supabaseAuth.getOrExchangeSessionFromCallback(code);
        if (!session) {
          throw new Error('تعذر استلام الجلسة من Supabase');
        }

        const user = session.user;
        const identity = user?.identities?.find((i: any) => i.provider === 'google') || user?.identities?.[0];
        const googleId = identity?.provider_id 
          || identity?.identity_data?.sub 
          || user?.user_metadata?.sub 
          || user?.id;

        // Prepare payload for backend Google OAuth endpoint
        const backendPayload = {
          googleId,
          email: user?.email || '',
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Supabase User',
          picture: user?.user_metadata?.avatar_url,
          phone: user?.user_metadata?.phone || user?.phone,
          givenName: user?.user_metadata?.given_name,
          familyName: user?.user_metadata?.family_name
        };

        // Exchange Supabase session for backend JWT (our API)
        const backendRes = await api.auth.googleLogin(backendPayload);
        if (!backendRes?.token) {
          throw new Error(backendRes?.error || 'فشل إنشاء جلسة التطبيق');
        }

        const phone = backendRes?.user?.phone || backendPayload.phone;

        localStorage.setItem('token', backendRes.token);
        localStorage.setItem('user', JSON.stringify({
          id: backendRes?.user?.id || user?.id || 'supabase-user',
          email: backendRes?.user?.email || backendPayload.email,
          name: `${backendRes?.user?.firstName || ''} ${backendRes?.user?.lastName || ''}`.trim() || backendPayload.name,
          phone,
          avatar: backendRes?.user?.avatar || backendPayload.picture,
          role: backendRes?.user?.role || 'customer',
          isGuest: false
        }));

        setStatus('success');
        
        const needsCompletion = backendRes?.needsCompletion || !phone;

        if (needsCompletion) {
          setMessage('يرجى إكمال بياناتك...');
          setTimeout(() => {
            window.location.replace('/complete-profile');
          }, 400);
        } else {
          setMessage('تم تسجيل الدخول بنجاح، سيتم تحويلك...');
          setTimeout(() => {
            window.location.replace('/');
          }, 400);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'حدث خطأ أثناء المعالجة.');
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center border border-gray-100">
        {status === 'processing' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-10 h-10 text-green-600" />
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-600" />
            <p className="text-gray-700 font-medium">{message}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
