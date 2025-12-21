import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    duration?: number;
    onComplete?: () => void;
}

// Fullscreen animation-only splash without text overlay
const DOT_LOTTIE_SRC = 'https://lottie.host/5527c3be-5de8-428e-9392-86f486676eeb/WlfpbU5EZl.lottie';

const SplashScreen: React.FC<SplashScreenProps> = ({ duration = 2600, onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);

    // Ensure lottie player script is loaded once
    useEffect(() => {
        const alreadyLoaded = (window as any)?.customElements?.get?.('dotlottie-player');
        if (!alreadyLoaded) {
            const existingScript = document.querySelector('script[data-dotlottie]');
            if (!existingScript) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.js';
                script.defer = true;
                script.setAttribute('data-dotlottie', 'true');
                document.body.appendChild(script);
            }
        }
    }, []);

    // Auto-hide splash after the animation finishes
    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onComplete?.(), 400);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-400 ${
                fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* خلفية بسيطة ونظيفة */}
            <div className="absolute inset-0 bg-white" />

            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <dotlottie-player
                    src={DOT_LOTTIE_SRC}
                    background="transparent"
                    speed="1"
                    loop
                    autoplay
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </div>
        </div>
    );
};

export default SplashScreen;
