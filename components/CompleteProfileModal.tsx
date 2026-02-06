import React, { useState } from 'react';
import { X, Loader2, User, Phone, Calendar } from 'lucide-react';
import { api } from '../services/api';

interface CompleteProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (userData: any) => void;
    initialData?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        birthDate?: string;
    };
}

const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
    isOpen,
    onClose,
    onComplete,
    initialData = {}
}) => {
    const [firstName, setFirstName] = useState(initialData.firstName || '');
    const [lastName, setLastName] = useState(initialData.lastName || '');
    const [email, setEmail] = useState(initialData.email || '');
    const [phone, setPhone] = useState(initialData.phone || '');
    const [birthDate, setBirthDate] = useState(initialData.birthDate || '');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate phone is provided (required)
        if (!phone) {
            setError('رقم الهاتف مطلوب');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/auth/complete-profile', {
                firstName,
                lastName,
                email,
                phone,
                birthDate: birthDate || undefined
            });

            if (response.data.success) {
                onComplete(response.data.user);
                onClose();
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || 'فشل تحديث البيانات');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pb-safe">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">استكمل بياناتك</h2>
                        <p className="text-sm text-gray-500 mt-1">لنتمكن من خدمتك بشكل أفضل</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* First Name & Last Name */}
                    {(!initialData.firstName || !initialData.lastName) && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    الاسم الأول
                                </label>
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        placeholder="أحمد"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    الاسم الأخير
                                </label>
                                <div className="relative">
                                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        placeholder="محمد"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email (if missing from OAuth) */}
                    {!initialData.email && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                placeholder="example@email.com"
                            />
                        </div>
                    )}

                    {/* Phone Number (Required) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            رقم الهاتف <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                placeholder="01xxxxxxxxx"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">مطلوب للتواصل معك بخصوص الطلبات</p>
                    </div>

                    {/* Birth Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            تاريخ الميلاد (اختياري)
                        </label>
                        <div className="relative">
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">للحصول على عروض في عيد ميلادك 🎉</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !phone}
                        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            'حفظ البيانات'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfileModal;
