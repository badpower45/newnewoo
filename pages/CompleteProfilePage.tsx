import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const CompleteProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate phone number
        if (!phone || phone.length < 11) {
            setError('الرجاء إدخال رقم هاتف صحيح (11 رقم على الأقل)');
            return;
        }

        setLoading(true);
        try {
            // Update user profile with phone number
            const response = await api.users.updateProfile({
                phone: phone,
                user_id: user?.id
            });

            if (response.success) {
                // Update local user data
                updateUser({ phone: phone });
                
                // Redirect to home page
                navigate('/', { replace: true });
            } else {
                setError(response.message || 'حدث خطأ أثناء تحديث البيانات');
            }
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'حدث خطأ أثناء تحديث البيانات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">إكمال البيانات</h1>
                    <p className="text-gray-600">نحتاج إلى رقم هاتفك لإتمام عملية التسجيل</p>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-3">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Phone Input */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            رقم الهاتف <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="01XXXXXXXXX"
                                className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-transparent text-right"
                                required
                                dir="ltr"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">سيتم استخدام هذا الرقم للتواصل معك بخصوص طلباتك</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-brand-orange to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                <span>جاري الحفظ...</span>
                            </>
                        ) : (
                            <>
                                <span>متابعة</span>
                                <ArrowLeft className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        بإكمال البيانات، أنت توافق على{' '}
                        <a href="/privacy-policy" className="text-brand-orange hover:underline">
                            سياسة الخصوصية
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfilePage;
