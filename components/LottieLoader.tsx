import React, { useEffect, useState } from 'react';

interface LottieLoaderProps {
    onComplete?: () => void;
    duration?: number;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'dotlottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

const DOT_LOTTIE_SRC = 'https://lottie.host/5527c3be-5de8-428e-9392-86f486676eeb/WlfpbU5EZl.lottie';

const LottieLoader: React.FC<LottieLoaderProps> = ({ onComplete, duration = 2000 }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Load dotlottie player script only once
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
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
                fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* Enlarged Video/Animation - Full Screen */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <dotlottie-player
                    src={DOT_LOTTIE_SRC}
                    background="transparent"
                    speed="1"
                    loop
                    autoplay
                    style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '800px' }}
                />
            </div>
        </div>
    );
};

export default LottieLoader;
