// Frontend Error Logger
// يسجل جميع الأخطاء في الفرونت إند ويرسلها للباك إند

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  severity: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
}

class FrontendLogger {
  private static instance: FrontendLogger;
  private errorQueue: ErrorLog[] = [];
  private isProcessing = false;
  private readonly MAX_QUEUE_SIZE = 10;
  private readonly BATCH_INTERVAL = 5000; // 5 seconds

  private constructor() {
    this.setupGlobalErrorHandler();
    this.setupUnhandledRejectionHandler();
    this.startBatchProcessing();
  }

  public static getInstance(): FrontendLogger {
    if (!FrontendLogger.instance) {
      FrontendLogger.instance = new FrontendLogger();
    }
    return FrontendLogger.instance;
  }

  /**
   * تسجيل خطأ
   */
  public logError(error: Error | string, context?: Record<string, any>, severity: 'error' | 'warning' | 'info' = 'error') {
    const errorLog: ErrorLog = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error !== 'string' ? error.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      severity,
      context
    };

    // طباعة في الكونسول للتطوير
    if (import.meta.env.DEV) {
      console.error('🔴 Frontend Error:', errorLog);
    }

    // إضافة للقائمة
    this.errorQueue.push(errorLog);

    // إذا وصلت القائمة للحد الأقصى، أرسل فوراً
    if (this.errorQueue.length >= this.MAX_QUEUE_SIZE) {
      this.sendErrorBatch();
    }
  }

  /**
   * تسجيل معلومة
   */
  public logInfo(message: string, context?: Record<string, any>) {
    this.logError(message, context, 'info');
  }

  /**
   * تسجيل تحذير
   */
  public logWarning(message: string, context?: Record<string, any>) {
    this.logError(message, context, 'warning');
  }

  /**
   * تسجيل API request error
   */
  public logApiError(endpoint: string, error: any, method: string = 'GET') {
    this.logError(error, {
      type: 'API_ERROR',
      endpoint,
      method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }

  /**
   * إعداد معالج الأخطاء العام
   */
  private setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      this.logError(event.error || event.message, {
        type: 'GLOBAL_ERROR',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  /**
   * إعداد معالج Promise rejections
   */
  private setupUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason, {
        type: 'UNHANDLED_PROMISE_REJECTION'
      });
    });
  }

  /**
   * الحصول على معرف المستخدم من localStorage
   */
  private getUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id?.toString();
      }
    } catch (e) {
      // تجاهل الخطأ
    }
    return undefined;
  }

  /**
   * بدء معالجة دفعات الأخطاء
   */
  private startBatchProcessing() {
    setInterval(() => {
      if (this.errorQueue.length > 0 && !this.isProcessing) {
        this.sendErrorBatch();
      }
    }, this.BATCH_INTERVAL);
  }

  /**
   * إرسال دفعة من الأخطاء للباك إند
   */
  private async sendErrorBatch() {
    if (this.errorQueue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    const batch = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      await fetch(`${API_URL}/api/logs/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors: batch }),
      });
    } catch (error) {
      // في حالة فشل الإرسال، أعد الأخطاء للقائمة
      console.error('فشل إرسال الأخطاء للباك إند:', error);
      this.errorQueue = [...batch, ...this.errorQueue];
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * مسح قائمة الأخطاء
   */
  public clearQueue() {
    this.errorQueue = [];
  }
}

// تصدير instance واحدة
export const frontendLogger = FrontendLogger.getInstance();

// Helper functions للاستخدام السهل
export const logError = (error: Error | string, context?: Record<string, any>) => {
  frontendLogger.logError(error, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  frontendLogger.logInfo(message, context);
};

export const logWarning = (message: string, context?: Record<string, any>) => {
  frontendLogger.logWarning(message, context);
};

export const logApiError = (endpoint: string, error: any, method?: string) => {
  frontendLogger.logApiError(endpoint, error, method);
};
