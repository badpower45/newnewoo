import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface LottieLoaderProps {
    onComplete?: () => void;
    duration?: number;
}

// Delivery animation data (simplified inline)
const deliveryAnimation = {
    "v": "5.7.4",
    "fr": 30,
    "ip": 0,
    "op": 90,
    "w": 400,
    "h": 400,
    "nm": "Delivery",
    "ddd": 0,
    "assets": [],
    "layers": [
        {
            "ddd": 0,
            "ind": 1,
            "ty": 4,
            "nm": "Scooter",
            "sr": 1,
            "ks": {
                "o": { "a": 0, "k": 100 },
                "r": { "a": 0, "k": 0 },
                "p": {
                    "a": 1,
                    "k": [
                        { "i": { "x": 0.667, "y": 1 }, "o": { "x": 0.333, "y": 0 }, "t": 0, "s": [100, 200, 0], "to": [33.333, 0, 0], "ti": [-33.333, 0, 0] },
                        { "t": 90, "s": [300, 200, 0] }
                    ]
                },
                "a": { "a": 0, "k": [0, 0, 0] },
                "s": { "a": 0, "k": [100, 100, 100] }
            },
            "ao": 0,
            "shapes": [
                {
                    "ty": "gr",
                    "it": [
                        {
                            "ty": "rc",
                            "d": 1,
                            "s": { "a": 0, "k": [60, 40] },
                            "p": { "a": 0, "k": [0, 0] },
                            "r": { "a": 0, "k": 10 }
                        },
                        {
                            "ty": "fl",
                            "c": { "a": 0, "k": [0.95, 0.5, 0.2, 1] },
                            "o": { "a": 0, "k": 100 }
                        }
                    ],
                    "nm": "Body"
                }
            ],
            "ip": 0,
            "op": 90,
            "st": 0,
            "bm": 0
        }
    ]
};

const LottieLoader: React.FC<LottieLoaderProps> = ({ onComplete, duration = 2000 }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                onComplete?.();
            }, 500);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
            {/* Logo/Brand */}
            <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                    <span className="text-4xl font-bold text-white">🛒</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 text-center">Shop Allosh</h1>
            </div>

            {/* Lottie Animation */}
            <div className="w-64 h-64">
                <Lottie
                    animationData={deliveryAnimation}
                    loop={true}
                    autoplay={true}
                />
            </div>

            {/* Free Palestine Message */}
            <div className="mt-8 flex items-center gap-2">
                <div className="w-8 h-8">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path d="M3 4h18v5.33H3zM3 9.33h18v5.34H3zM3 14.67h18V20H3z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 4h18v5.33H3z" fill="#000"/>
                        <path d="M3 9.33h18v5.34H3z" fill="#fff"/>
                        <path d="M3 14.67h18V20H3z" fill="#007A3D"/>
                        <path d="M3 4l8 8L3 20z" fill="#E4312B"/>
                    </svg>
                </div>
                <span className="text-orange-600 font-semibold text-lg">Free Palestine 🇵🇸</span>
            </div>

            {/* Loading dots */}
            <div className="mt-6 flex gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );
};

export default LottieLoader;
