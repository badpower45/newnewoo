import React from 'react';
import { ShoppingCart, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class CartErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Cart Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('cart_items');
      localStorage.removeItem('cart_timestamp');
      localStorage.removeItem('cart_version');
    } catch (e) {
      console.error('Failed to clear cart:', e);
    }
    
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={40} className="text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              عذراً، حدث خطأ في السلة
            </h2>
            
            <p className="text-gray-600 mb-6">
              نعمل على حل المشكلة. يمكنك المحاولة مرة أخرى.
            </p>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-right">
                <p className="text-xs text-red-800 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-brand-orange text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                إعادة تعيين السلة
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                المحاولة مرة أخرى
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
