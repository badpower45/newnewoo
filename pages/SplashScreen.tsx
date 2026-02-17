import React, { useEffect, useState, lazy, Suspense } from 'react';

const Lottie = lazy(() => import('lottie-react'));

interface SplashScreenProps {
    duration?: number;
    onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ duration = 4000, onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);
    const [animationData, setAnimationData] = useState<any>(null);

    // Load the Lottie animation JSON
    useEffect(() => {
        fetch('/welcome-animation.json')
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error('Failed to load animation:', err));
    }, []);

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
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400 ${
                fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* خلفية بيضاء نظيفة */}
            <div className="absolute inset-0 bg-white" />

            <div className="relative w-full max-w-md px-6 flex flex-col items-center justify-center">
                {/* Lottie Animation */}
                <div className="relative w-72 h-72 max-w-full flex items-center justify-center">
                    {animationData && (
                        <Suspense fallback={<div className="w-32 h-32 rounded-full bg-orange-100 animate-pulse" />}>
                            <Lottie
                                animationData={animationData}
                                loop={true}
                                autoplay={true}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </Suspense>
                    )}
                </div>

                {/* Loading bar - بلون البراند البرتقالي */}
                <div className="mt-6 h-1.5 w-48 rounded-full bg-orange-100 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 splash-loading"
                        style={{ animationDuration: `${duration}ms` }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes splash-loading {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .splash-loading { animation: splash-loading linear forwards; }
            `}</style>
        </div>
    );
};

export default SplashScreen;
