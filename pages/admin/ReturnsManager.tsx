import React from 'react';
import { RotateCcw, Search, Filter } from 'lucide-react';

const ReturnsManager = () => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <RotateCcw className="text-brand-orange" />
                    إدارة المرتجعات الذكية
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RotateCcw className="text-brand-orange" size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">نظام المرتجعات الذكية</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                    هنا ستظهر طلبات الإرجاع والاستبدال من العملاء. يمكنك مراجعة الطلبات والموافقة عليها أو رفضها.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-sm">
                    <span>🚧</span>
                    <span>جاري العمل على تطوير هذه الصفحة</span>
                </div>
            </div>
        </div>
    );
};

export default ReturnsManager;
