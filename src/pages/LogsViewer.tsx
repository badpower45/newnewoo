import { useState, useEffect } from 'react';
import { logError } from '../utils/frontendLogger';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

interface LogStats {
  totalErrors: number;
  last24Hours: number;
  lastError: LogEntry | null;
}

export default function LogsViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [logType, setLogType] = useState<'error' | 'combined' | 'api'>('error');
  const [lineCount, setLineCount] = useState(100);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // جلب اللوجز
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/logs/view?type=${logType}&lines=${lineCount}`
      );
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      logError(error as Error, { context: 'fetch-logs' });
      console.error('فشل جلب اللوجز:', error);
    } finally {
      setLoading(false);
    }
  };

  // جلب الإحصائيات
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logs/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      logError(error as Error, { context: 'fetch-stats' });
      console.error('فشل جلب الإحصائيات:', error);
    }
  };

  // مسح اللوجز
  const clearLogs = async () => {
    if (!confirm('هل أنت متأكد من مسح اللوجز؟')) return;

    try {
      const response = await fetch(
        `${API_URL}/api/logs/clear?type=${logType}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      
      if (data.success) {
        alert('تم مسح اللوجز بنجاح');
        fetchLogs();
        fetchStats();
      }
    } catch (error) {
      logError(error as Error, { context: 'clear-logs' });
      alert('فشل مسح اللوجز');
    }
  };

  // تنزيل اللوجز
  const downloadLogs = () => {
    const logsText = JSON.stringify(logs, null, 2);
    const blob = new Blob([logsText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${logType}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [logType, lineCount]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
      fetchStats();
    }, 5000); // كل 5 ثواني

    return () => clearInterval(interval);
  }, [autoRefresh, logType, lineCount]);

  const getLogLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'error':
        return '#dc3545';
      case 'warn':
      case 'warning':
        return '#ffc107';
      case 'info':
        return '#17a2b8';
      case 'http':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: '0 0 20px 0' }}>🔍 سجل الأخطاء والأحداث</h1>

        {/* إحصائيات */}
        {stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>إجمالي الأخطاء</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {stats.totalErrors}
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666' }}>آخر 24 ساعة</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {stats.last24Hours}
              </div>
            </div>
          </div>
        )}

        {/* خيارات التحكم */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <select 
            value={logType} 
            onChange={(e) => setLogType(e.target.value as any)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          >
            <option value="error">أخطاء فقط</option>
            <option value="combined">جميع اللوجز</option>
            <option value="api">طلبات API</option>
          </select>

          <select 
            value={lineCount} 
            onChange={(e) => setLineCount(Number(e.target.value))}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          >
            <option value="50">آخر 50 سطر</option>
            <option value="100">آخر 100 سطر</option>
            <option value="500">آخر 500 سطر</option>
            <option value="1000">آخر 1000 سطر</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            تحديث تلقائي
          </label>

          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ جاري التحميل...' : '🔄 تحديث'}
          </button>

          <button
            onClick={downloadLogs}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📥 تنزيل
          </button>

          <button
            onClick={clearLogs}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🗑️ مسح
          </button>
        </div>
      </div>

      {/* قائمة اللوجز */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '15px'
      }}>
        <h2 style={{ marginTop: 0 }}>السجلات ({logs.length})</h2>
        
        {logs.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666' 
          }}>
            لا توجد سجلات
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            {logs.map((log, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '5px',
                  borderLeft: `4px solid ${getLogLevelColor(log.level)}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: getLogLevelColor(log.level)
                  }}>
                    {log.level?.toUpperCase() || 'LOG'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(log.timestamp).toLocaleString('ar-EG')}
                  </span>
                </div>
                
                <div style={{ 
                  fontSize: '14px', 
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  {log.message}
                </div>

                {(log.stack || log.componentStack || Object.keys(log).length > 4) && (
                  <details style={{ fontSize: '12px', marginTop: '10px' }}>
                    <summary style={{ 
                      cursor: 'pointer', 
                      color: '#007bff',
                      userSelect: 'none'
                    }}>
                      عرض التفاصيل
                    </summary>
                    <pre style={{
                      backgroundColor: '#f5f5f5',
                      padding: '10px',
                      borderRadius: '5px',
                      marginTop: '10px',
                      overflow: 'auto',
                      fontSize: '11px'
                    }}>
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
