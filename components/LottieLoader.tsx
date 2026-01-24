import React, { useEffect, useState } from 'react';
import { loadDotLottiePlayer } from '../utils/loadDotLottie';

interface LottieLoaderProps {
    onComplete?: () => void;
    duration?: number;
}

const DOT_LOTTIE_SRC = 'https://lottie.host/5527c3be-5de8-428e-9392-86f486676eeb/WlfpbU5EZl.lottie';

const LottieLoader: React.FC<LottieLoaderProps> = ({ onComplete, duration = 2000 }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        loadDotLottiePlayer();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                onComplete?.();
            }, 400);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
                fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* Full Width Video - No Padding */}
            <div className="w-full h-screen flex items-center justify-center overflow-hidden">
                <dotlottie-player
                    src={DOT_LOTTIE_SRC}
                    background="transparent"
                    speed="1"
                    loop
                    autoplay
                    style={{ width: '100%', height: 'auto', minHeight: '100vh', objectFit: 'contain' }}
                />
            </div>
        </div>
    );
};

export default LottieLoader;
