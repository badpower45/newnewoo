import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    duration?: number;
    onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ duration = 3000, onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onComplete?.(), 400);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-orange-500 transition-opacity duration-400 ${
                fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* Spinning ring + logo */}
            <div className="relative flex items-center justify-center">
                {/* Outer spinning ring */}
                <svg
                    className="absolute"
                    style={{ width: 220, height: 220, animation: 'splash-spin 2s linear infinite' }}
                    viewBox="0 0 220 220"
                    fill="none"
                >
                    <circle
                        cx="110"
                        cy="110"
                        r="100"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="180 450"
                        opacity="0.95"
                    />
                </svg>

                {/* Static outer thin ring */}
                <svg
                    className="absolute"
                    style={{ width: 220, height: 220 }}
                    viewBox="0 0 220 220"
                    fill="none"
                >
                    <circle
                        cx="110"
                        cy="110"
                        r="100"
                        stroke="white"
                        strokeWidth="1"
                        opacity="0.3"
                    />
                </svg>

                {/* Logo image in center */}
                <div className="w-36 h-36 rounded-full bg-orange-500 flex items-center justify-center p-3">
                    <img
                        src="/images/allosh-logo-splash.png"
                        alt="علوش"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            <style>{`
                @keyframes splash-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;
