import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Zap, Trophy, ArrowLeft } from 'lucide-react';

interface BannerProps {
    type: 'login' | 'promo';
    title?: string;
    subtitle?: string;
    buttonText?: string;
    image?: string;
    bgColor?: string;
}

const Banner: React.FC<BannerProps> = ({ type, title, subtitle, buttonText, image, bgColor }) => {
    if (type === 'login') {
        return (
            <div className="relative rounded-2xl overflow-hidden" style={{
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 40%, #FFB347 70%, #FF6B00 100%)',
                boxShadow: '0 8px 32px rgba(255, 107, 0, 0.35)'
            }}>
                {/* Animated background circles */}
                <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
                <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
                <div className="absolute top-2 right-12 w-4 h-4 rounded-full bg-white opacity-30" />
                <div className="absolute bottom-3 left-16 w-3 h-3 rounded-full bg-white opacity-25" />

                {/* Floating icons */}
                <div className="absolute top-3 left-3 opacity-40">
                    <Star size={18} className="text-white fill-white" />
                </div>
                <div className="absolute top-8 left-10 opacity-25">
                    <Zap size={14} className="text-white fill-white" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between p-4 gap-3">
                    {/* Text Section */}
                    <div className="flex-1 min-w-0">
                        {/* Badge */}
                        <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex items-center gap-1 bg-white/25 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-white/30">
                                <Trophy size={11} className="text-white" />
                                <span className="text-white text-xs font-bold">اكسب نقاط</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-black text-white mb-0.5 leading-tight" style={{ fontSize: '15px' }}>
                            سجّل وتسوّق واربح! 🎉
                        </h3>

                        {/* Subtitle */}
                        <p className="text-white/85 font-medium" style={{ fontSize: '11px' }}>
                            نقاط بكل طلب تستبدلها بهدايا مجانية
                        </p>

                        {/* Points indicator */}
                        <div className="flex items-center gap-1 mt-1.5">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-white"
                                    style={{ opacity: 0.4 + i * 0.15, transform: `scale(${0.7 + i * 0.1})` }}
                                />
                            ))}
                            <span className="text-white/70 text-xs mr-1">→ 🎁</span>
                        </div>
                    </div>

                    {/* Button */}
                    <Link
                        to="/login"
                        className="flex-shrink-0 flex items-center gap-1.5 font-black text-sm rounded-xl px-4 py-3 transition-all duration-200 active:scale-95 hover:scale-105"
                        style={{
                            background: 'rgba(255,255,255,0.95)',
                            color: '#FF6B00',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        <span>سجّل دخولك</span>
                        <ArrowLeft size={14} />
                    </Link>
                </div>

                {/* Shimmer animation */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                        animation: 'shimmer 3s infinite',
                    }}
                />
                <style>{`
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="relative rounded-2xl overflow-hidden shadow-sm h-36 w-full">
            <img
                src={image || "https://placehold.co/600x200/orange/white?text=Yellow+Friday"}
                alt="Banner"
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{ imageRendering: 'auto' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        </div>
    );
};

export default Banner;
