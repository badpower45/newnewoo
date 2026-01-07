import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabaseBlockingService } from '../services/supabaseBlockingService';
import { useAuth } from '../context/AuthContext';
import { Ban, Shield, Clock } from 'lucide-react';

/**
 * BlockedUserGuard - يمنع المستخدمين المحظورين من استخدام الموقع
 */
const BlockedUserGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockInfo, setBlockInfo] = useState<any>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkBlockStatus = async () => {
            // السماح بالصفحات العامة
            const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
            if (publicPaths.includes(location.pathname)) {
                setChecking(false);
                return;
            }

            // فحص الحظر للمستخدمين المسجلين
            if (user && user.email) {
                try {
                    const blockStatus = await supabaseBlockingService.checkIfBlocked(user.email);
                    
                    if (blockStatus.isBlocked) {
                        setIsBlocked(true);
                        setBlockInfo(blockStatus);
                        
                        // تسجيل محاولة الدخول
                        await supabaseBlockingService.logBlockedAttempt({
                            userEmail: user.email,
                            userId: user.id,
                            attemptType: 'api_call',
                            blockReason: blockStatus.blockReason || 'محاولة دخول محظور'
                        });
                    } else {
                        setIsBlocked(false);
                        setBlockInfo(null);
                    }
                } catch (error) {
                    console.error('خطأ في فحص حالة الحظر:', error);
                }
            }
            
            setChecking(false);
        };

        checkBlockStatus();
    }, [user, location.pathname]);

    // أثناء الفحص
    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // إذا كان محظور
    if (isBlocked && blockInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                    {/* أيقونة الحظر */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                            <Ban size={48} className="text-red-600" />
                        </div>
                    </div>

                    {/* العنوان */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        تم حظر حسابك
                    </h1>

                    {/* السبب */}
                    {blockInfo.blockReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Shield className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-red-900 mb-1">سبب الحظر:</p>
                                    <p className="text-sm text-red-700">{blockInfo.blockReason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* مدة الحظر */}
                    {blockInfo.banType === 'temporary' && blockInfo.daysRemaining && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3 justify-center">
                                <Clock className="text-yellow-600" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-900">حظر مؤقت</p>
                                    <p className="text-sm text-yellow-700">
                                        متبقي: {Math.ceil(blockInfo.daysRemaining)} {blockInfo.daysRemaining === 1 ? 'يوم' : 'أيام'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* رسالة */}
                    <p className="text-gray-600 text-sm mb-8">
                        {blockInfo.banType === 'permanent' 
                            ? 'تم حظر حسابك بشكل دائم. للاستفسار، يرجى التواصل مع خدمة العملاء.'
                            : 'حسابك محظور مؤقتاً. سيتم رفع الحظر تلقائياً بعد انتهاء المدة.'}
                    </p>

                    {/* أزرار */}
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            تسجيل الخروج
                        </button>
                        
                        <a
                            href="tel:+201234567890"
                            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            📞 الاتصال بخدمة العملاء
                        </a>
                    </div>

                    {/* تفاصيل إضافية */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            رقم الحساب: {user?.id || 'غير متوفر'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // السماح بالمرور إذا لم يكن محظور
    return <>{children}</>;
};

export default BlockedUserGuard;
