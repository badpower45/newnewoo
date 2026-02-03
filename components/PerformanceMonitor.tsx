import React, { useState, useEffect } from 'react';
import { Activity, Zap, Database, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface PerformanceMetrics {
    apiCallsCount: number;
    totalBandwidth: number;
    averageResponseTime: number;
    cacheHitRate: number;
    timestamp: string;
}

interface PerformanceMonitorProps {
    endpoint?: string;
    showDetails?: boolean;
}

/**
 * 🎯 Performance Monitor Component
 * 
 * Tracks and displays API performance metrics:
 * - API calls count
 * - Bandwidth usage
 * - Response times
 * - Cache hit rates
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
    endpoint = 'unified',
    showDetails = true 
}) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [history, setHistory] = useState<PerformanceMetrics[]>([]);

    // Monitor performance on API calls
    useEffect(() => {
        // Listen for performance data from API calls
        const handlePerformanceUpdate = (event: CustomEvent) => {
            const newMetric: PerformanceMetrics = {
                apiCallsCount: event.detail.callsCount || 1,
                totalBandwidth: event.detail.bandwidth || 0,
                averageResponseTime: event.detail.responseTime || 0,
                cacheHitRate: event.detail.cacheHit ? 100 : 0,
                timestamp: new Date().toISOString()
            };
            
            setMetrics(newMetric);
            setHistory(prev => [...prev.slice(-9), newMetric]); // Keep last 10
        };

        window.addEventListener('api-performance' as any, handlePerformanceUpdate);
        
        return () => {
            window.removeEventListener('api-performance' as any, handlePerformanceUpdate);
        };
    }, []);

    const startMonitoring = () => {
        setIsMonitoring(true);
        // Reset metrics
        setMetrics(null);
        setHistory([]);
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
    };

    // Calculate savings vs traditional approach
    const calculateSavings = () => {
        if (!metrics) return null;

        const traditional = {
            calls: endpoint === 'admin' ? 12 : 3,
            bandwidth: endpoint === 'admin' ? 400 : 180
        };

        const callsSaved = traditional.calls - metrics.apiCallsCount;
        const bandwidthSaved = traditional.bandwidth - metrics.totalBandwidth;
        const percentSaved = ((bandwidthSaved / traditional.bandwidth) * 100).toFixed(0);

        return { callsSaved, bandwidthSaved, percentSaved };
    };

    const savings = calculateSavings();

    if (!showDetails && !metrics) return null;

    return (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Activity size={18} className="text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">مراقب الأداء</h3>
                        <p className="text-xs text-gray-500">
                            {endpoint === 'admin' ? 'Admin Dashboard' : 'Home Page'}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={isMonitoring ? stopMonitoring : startMonitoring}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isMonitoring 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                    {isMonitoring ? 'إيقاف' : 'بدء المراقبة'}
                </button>
            </div>

            {/* Metrics Grid */}
            {metrics && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        {/* API Calls */}
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap size={16} className="text-yellow-500" />
                                <span className="text-xs text-gray-500">طلبات API</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{metrics.apiCallsCount}</p>
                            {savings && (
                                <p className="text-xs text-green-600">
                                    وفّرت {savings.callsSaved} طلبات
                                </p>
                            )}
                        </div>

                        {/* Bandwidth */}
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Database size={16} className="text-blue-500" />
                                <span className="text-xs text-gray-500">حجم البيانات</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">
                                {metrics.totalBandwidth} KB
                            </p>
                            {savings && (
                                <p className="text-xs text-green-600">
                                    وفّرت {savings.bandwidthSaved} KB
                                </p>
                            )}
                        </div>

                        {/* Response Time */}
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={16} className="text-purple-500" />
                                <span className="text-xs text-gray-500">زمن الاستجابة</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">
                                {metrics.averageResponseTime}ms
                            </p>
                            <p className="text-xs text-gray-500">متوسط</p>
                        </div>

                        {/* Savings Percentage */}
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={16} className="text-green-500" />
                                <span className="text-xs text-gray-500">التوفير</span>
                            </div>
                            <p className="text-xl font-bold text-green-600">
                                {savings?.percentSaved}%
                            </p>
                            <p className="text-xs text-gray-500">من البيانات</p>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-900 mb-1">
                                    ملخص الأداء
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    تم تحميل البيانات بنجاح باستخدام الـ Unified API. 
                                    وفّرت <strong className="text-green-600">{savings?.callsSaved} طلبات API</strong> و
                                    <strong className="text-green-600"> {savings?.bandwidthSaved} KB</strong> من البيانات 
                                    ({savings?.percentSaved}% توفير). 
                                    زمن الاستجابة: <strong>{metrics.averageResponseTime}ms</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* History Chart (if multiple measurements) */}
                    {history.length > 1 && (
                        <div className="mt-3 bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs font-medium text-gray-900 mb-2">
                                سجل الأداء (آخر {history.length} قياسات)
                            </p>
                            <div className="flex items-end justify-between gap-1 h-16">
                                {history.map((h, idx) => (
                                    <div
                                        key={idx}
                                        className="flex-1 bg-green-200 rounded-t hover:bg-green-300 transition-colors cursor-pointer"
                                        style={{ 
                                            height: `${(h.totalBandwidth / 500) * 100}%`,
                                            minHeight: '8px'
                                        }}
                                        title={`${h.totalBandwidth} KB - ${h.averageResponseTime}ms`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!metrics && isMonitoring && (
                <div className="bg-white rounded-lg p-6 text-center">
                    <Activity size={32} className="text-gray-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-gray-500">في انتظار بيانات الأداء...</p>
                    <p className="text-xs text-gray-400 mt-1">قم بتحديث الصفحة لبدء القياس</p>
                </div>
            )}

            {!isMonitoring && !metrics && (
                <div className="bg-white rounded-lg p-6 text-center">
                    <Activity size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium mb-1">مراقب الأداء جاهز</p>
                    <p className="text-xs text-gray-500">اضغط "بدء المراقبة" لتتبع أداء الـ API</p>
                </div>
            )}
        </div>
    );
};

export default PerformanceMonitor;
