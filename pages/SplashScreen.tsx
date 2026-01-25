import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    duration?: number;
    onComplete?: () => void;
}

// Fast CSS-only splash screen (no Lottie = save 1.8MB!)
const SplashScreen: React.FC<SplashScreenProps> = ({ duration = 2600, onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);

    // Auto-hide splash after animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onComplete?.(), 400);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 transition-opacity duration-400 ${
                fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            <div className="relative flex flex-col items-center justify-center space-y-6 p-8">
                {/* Logo Animation - Pure CSS */}
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '2s' }} />
                    <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-emerald-100 splash-bounce">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-12 h-12 text-white splash-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Brand Name */}
                <div className="text-center space-y-2 splash-fade-in">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        علوش ماركت
                    </h1>
                    <p className="text-sm text-gray-600 font-medium">
                        طازج دايماً معاك
                    </p>
                </div>

                {/* Loading Bar */}
                <div className="w-40 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full splash-loading"
                        style={{ animationDuration: `${duration}ms` }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes splash-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes splash-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes splash-fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes splash-loading {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .splash-bounce { animation: splash-bounce 2s ease-in-out infinite; }
                .splash-spin { animation: splash-spin 3s linear infinite; }
                .splash-fade-in { animation: splash-fade-in 0.6s ease-out; }
                .splash-loading { animation: splash-loading linear forwards; }
            `}</style>
        </div>
    );
};

export default SplashScreen;
