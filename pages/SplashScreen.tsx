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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,149,0,0.18),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,115,29,0.15),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(255,68,0,0.12),transparent_28%)]" />

            <div className="w-[110vw] h-[110vh] max-w-none max-h-none flex items-center justify-center overflow-hidden">
                <dotlottie-player
                    src={DOT_LOTTIE_SRC}
                    background="transparent"
                    speed="1"
                    loop
                    autoplay
                    style={{ width: '120vw', height: '120vh', objectFit: 'cover' }}
                />
            </div>
        </div>
    );
};

export default SplashScreen;
