import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PhoneNumberGuardProps {
    children: React.ReactNode;
}

/**
 * PhoneNumberGuard - يمنع المستخدمين من الوصول للصفحات إذا لم يكملوا رقم الهاتف
 * يسمح بالوصول لصفحات معينة فقط (complete-profile, login, register)
 */
const PhoneNumberGuard: React.FC<PhoneNumberGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, needsPhoneNumber } = useAuth();

    // الصفحات المسموح بها بدون رقم هاتف
    const allowedPaths = [
        '/complete-profile',
        '/login',
        '/register',
        '/auth/callback',
        '/forgot-password',
        '/reset-password'
    ];

    useEffect(() => {
        // انتظر حتى ينتهي التحميل
        if (loading) return;

        // إذا كان المستخدم بحاجة لإكمال رقم الهاتف
        if (needsPhoneNumber) {
            // تحقق من أن المستخدم ليس في صفحة مسموحة
            const isAllowedPath = allowedPaths.some(path => 
                location.pathname.startsWith(path)
            );

            if (!isAllowedPath) {
                // توجيه المستخدم لصفحة إكمال البيانات
                navigate('/complete-profile', { replace: true });
            }
        }
    }, [user, loading, needsPhoneNumber, location.pathname, navigate]);

    // إذا كان يجب التوجيه، لا تعرض المحتوى
    if (!loading && needsPhoneNumber && !allowedPaths.some(path => location.pathname.startsWith(path))) {
        return null;
    }

    return <>{children}</>;
};

export default PhoneNumberGuard;
