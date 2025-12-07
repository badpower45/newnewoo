import React, { useState, useEffect, useRef } from 'react';
import { Play, ExternalLink, Facebook, RefreshCw, X, Volume2, VolumeX } from 'lucide-react';
import { api } from '../services/api';

interface Reel {
    id: string | number;
    title: string;
    thumbnail: string;
    thumbnail_url?: string;
    videoUrl?: string;
    video_url?: string;
    facebook_url?: string;
    views?: string;
    views_count?: string;
    duration?: string;
}

interface FacebookReelsSectionProps {
    pageId?: string; // Facebook Page ID or username
    pageName?: string; // Display name
    limit?: number;
    reels?: Reel[]; // Custom reels data
}

const FacebookReelsSection: React.FC<FacebookReelsSectionProps> = ({
    pageId = 'alloshmarket', // ← غيّر ده لـ Page ID بتاعك
    pageName = 'Allosh Market',
    limit = 6,
    reels: customReels
}) => {
    const [loading, setLoading] = useState(true);
    const [reelsFromApi, setReelsFromApi] = useState<Reel[]>([]);
    const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Facebook Page URL
    const facebookPageUrl = `https://www.facebook.com/${pageId}`;

    // Default reels data (fallback إذا لم يكن هناك ريلز في قاعدة البيانات)
    const defaultReels: Reel[] = [
        {
            id: '1',
            title: 'عروض اليوم على الفواكه الطازجة 🍎',
            thumbnail: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=600&auto=format&fit=crop',
            views: '15K',
            duration: '0:30'
        },
        {
            id: '2',
            title: 'وصلنا منتجات جديدة 🛒',
            thumbnail: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=600&auto=format&fit=crop',
            views: '8.5K',
            duration: '0:45'
        },
        {
            id: '3',
            title: 'خصم 50% على منتجات الألبان 🥛',
            thumbnail: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop',
            views: '22K',
            duration: '0:20'
        },
        {
            id: '4',
            title: 'طريقة تخزين الخضروات 🥕',
            thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop',
            views: '35K',
            duration: '1:00'
        },
        {
            id: '5',
            title: 'عرض كرتونة العصائر 🧃',
            thumbnail: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop',
            views: '12K',
            duration: '0:25'
        },
        {
            id: '6',
            title: 'منتجات رمضان متوفرة الآن 🌙',
            thumbnail: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=600&auto=format&fit=crop',
            views: '50K',
            duration: '0:55'
        },
    ];

    // Fetch reels from API
    useEffect(() => {
        const fetchReels = async () => {
            try {
                const response = await api.facebookReels.getAll();
                const data = response?.data || response || [];
                if (Array.isArray(data) && data.length > 0) {
                    // Transform API data to match component format
                    const transformedReels = data.map((reel: any) => ({
                        id: reel.id,
                        title: reel.title,
                        thumbnail: reel.thumbnail_url,
                        videoUrl: reel.video_url,
                        facebook_url: reel.facebook_url,
                        views: reel.views_count,
                        duration: reel.duration
                    }));
                    setReelsFromApi(transformedReels);
                }
            } catch (error) {
                console.error('Failed to fetch reels:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReels();
    }, []);

    // Use API reels if available, otherwise use custom or default
    const reelsData = reelsFromApi.length > 0 ? reelsFromApi : (customReels || defaultReels);

    const openReel = (reel: Reel) => {
        // فتح الفيديو مباشرة على فيسبوك بدلاً من المودال
        // لأن المتصفحات الحديثة تمنع تحميل Facebook iframe بسبب Tracking Prevention
        const fbUrl = reel.facebook_url || `${facebookPageUrl}/videos`;
        window.open(fbUrl, '_blank', 'noopener,noreferrer');
    };

    const closeReel = () => {
        setSelectedReel(null);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
        }
    };

    return (
        <section className="py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">ريلز {pageName}</h2>
                        <p className="text-xs text-gray-500">أحدث الفيديوهات من صفحتنا</p>
                    </div>
                </div>
                <a
                    href={facebookPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                    <span>تابعنا</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>

            {/* Reels Grid */}
            <div className="relative">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-gray-500 text-sm">جاري تحميل الريلز...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                        {reelsData.slice(0, limit).map((reel, index) => (
                            <div
                                key={reel.id}
                                onClick={() => openReel(reel)}
                                className="flex-shrink-0 w-32 sm:w-40 cursor-pointer group snap-center"
                            >
                                {/* Thumbnail Container */}
                                <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                                    {/* Thumbnail Image */}
                                    <img
                                        src={reel.thumbnail}
                                        alt={reel.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
                                    
                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                                            <Play className="w-5 h-5 text-blue-600 ml-0.5" fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* Duration Badge */}
                                    {reel.duration && (
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                                            {reel.duration}
                                        </div>
                                    )}

                                    {/* Views */}
                                    {reel.views && (
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
                                            <Play className="w-3 h-3" fill="currentColor" />
                                            <span>{reel.views}</span>
                                        </div>
                                    )}

                                    {/* Facebook Badge */}
                                    <div className="absolute bottom-2 right-2">
                                        <Facebook className="w-4 h-4 text-white opacity-80" />
                                    </div>
                                </div>

                                {/* Title */}
                                <p className="mt-2 text-xs text-gray-700 font-medium line-clamp-2 text-right leading-relaxed">
                                    {reel.title}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Video Modal */}
            {selectedReel && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={closeReel}
                >
                    <div 
                        className="relative w-full max-w-sm aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeReel}
                            className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Mute Button */}
                        <button
                            onClick={toggleMute}
                            className="absolute top-4 left-4 z-10 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        {/* Video/Image Content */}
                        {selectedReel.videoUrl ? (
                            <video
                                ref={videoRef}
                                src={selectedReel.videoUrl}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted={isMuted}
                                playsInline
                            />
                        ) : (
                            <div className="relative w-full h-full">
                                <img
                                    src={selectedReel.thumbnail}
                                    alt={selectedReel.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay with Link to Facebook */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                    <p className="text-white text-center text-sm mb-4 px-4">
                                        شاهد الفيديو كامل على فيسبوك
                                    </p>
                                    <a
                                        href={selectedReel.facebook_url || facebookPageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        <Facebook className="w-5 h-5" />
                                        افتح في فيسبوك
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Video Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white font-semibold text-sm mb-1">{selectedReel.title}</p>
                            <div className="flex items-center gap-2 text-white/70 text-xs">
                                {selectedReel.views && <span>{selectedReel.views} مشاهدة</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Follow CTA */}
            <div className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-center">
                <p className="text-white text-sm mb-3">
                    🎬 تابعنا على فيسبوك لمشاهدة أحدث العروض والمنتجات
                </p>
                <a
                    href={facebookPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors"
                >
                    <Facebook className="w-5 h-5" />
                    تابع صفحتنا
                </a>
            </div>
        </section>
    );
};

export default FacebookReelsSection;
