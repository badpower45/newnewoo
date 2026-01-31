import React, { useEffect, useState } from 'react';
import { loadDotLottiePlayer } from '../utils/loadDotLottie';

interface SplashScreenProps {
    duration?: number;
    onComplete?: () => void;
}

const DOT_LOTTIE_SRC = 'https://lottie.host/5527c3be-5de8-428e-9392-86f486676eeb/WlfpbU5EZl.lottie';

const SplashScreen: React.FC<SplashScreenProps> = ({ duration = 2600, onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        loadDotLottiePlayer();
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
            <div className="absolute inset-0 bg-[#0b0f14]" />
            <div className="absolute inset-0 bg-[radial-gradient(700px_380px_at_15%_20%,rgba(34,197,94,0.25),transparent_60%),radial-gradient(800px_420px_at_85%_25%,rgba(16,185,129,0.22),transparent_60%),radial-gradient(900px_500px_at_50%_90%,rgba(56,189,248,0.18),transparent_60%)]" />
            <div className="relative w-full max-w-lg px-6">
                <div className="mx-auto w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 blur-2xl" />
                        <div className="relative w-64 max-w-full">
                            <dotlottie-player
                                src={DOT_LOTTIE_SRC}
                                background="transparent"
                                speed="1"
                                loop
                                autoplay
                                style={{ width: '100%', height: 'auto' }}
                            />
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <h1 className="text-3xl font-bold text-white tracking-wide splash-rise">
                            علوش ماركت
                        </h1>
                        <p className="mt-2 text-sm text-white/70 splash-rise-delayed">
                            بنجهز طلبك بأفضل جودة
                        </p>
                    </div>

                    <div className="mt-6 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-300 splash-loading"
                            style={{ animationDuration: `${duration}ms` }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes splash-loading {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                @keyframes splash-rise {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .splash-loading { animation: splash-loading linear forwards; }
                .splash-rise { animation: splash-rise 0.6s ease-out; }
                .splash-rise-delayed { animation: splash-rise 0.8s ease-out; }
            `}</style>
        </div>
    );
};

export default SplashScreen;
