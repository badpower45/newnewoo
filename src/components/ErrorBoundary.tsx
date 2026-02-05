import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../utils/frontendLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary لالتقاط الأخطاء في React Components
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // تسجيل الخطأ
    logError(error, {
      componentStack: errorInfo.componentStack,
      type: 'REACT_ERROR_BOUNDARY'
    });
  }

  public render() {
    if (this.state.hasError) {
      // عرض UI بديل عند حدوث خطأ
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fee',
          border: '2px solid #fcc',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2 style={{ color: '#c00' }}>حدث خطأ ما</h2>
          <p>عذراً، حدث خطأ في تحميل هذا الجزء من الصفحة.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            إعادة تحميل الصفحة
          </button>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#666' }}>
                تفاصيل الخطأ (Development Only)
              </summary>
              <pre style={{
                padding: '10px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
