import React, { useState, useRef, useEffect } from 'react';
import { Play, ExternalLink, Facebook, ChevronLeft, ChevronRight, X, Volume2, VolumeX } from 'lucide-react';
import { api } from '../services/api';

interface Reel {
    id: string | number;
    title: string;
    thumbnail: string;
    thumbnail_url?: string;
    video_url?: string;
    facebook_url?: string;
    views: string;
    views_count?: string;
    duration?: string;
}

interface FacebookReelsGridProps {
    pageUsername?: string;
    pageName?: string;
}

const FacebookReelsGrid: React.FC<FacebookReelsGridProps> = ({
    pageUsername = 'Alloshchocolates',
    pageName = 'Allosh Chocolates'
}) => {
    const normalizeVideoUrl = (url?: string) => {
        if (!url) return '';
        const srcMatch = url.match(/src=["']([^"']+)["']/);
        if (srcMatch?.[1]) url = srcMatch[1];
        // Ensure https
        if (url.startsWith('//')) url = 'https:' + url;
        if (url.startsWith('/embed/')) url = `https://www.youtube.com${url}`;
        if (!/^https?:\/\//i.test(url) && url.startsWith('www.')) url = `https://${url}`;

        const ytId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/)?.[1];
        if (ytId) return `https://www.youtube.com/embed/${ytId}?rel=0&autoplay=1&modestbranding=1`;
        const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
        if (/facebook\.com/.test(url) && !/plugins\/video\.php/.test(url)) {
            return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=1`;
        }
        if (/facebook\.com\/plugins\/video\.php/.test(url)) {
            return url.startsWith('http') ? url : `https:${url}`;
        }
        return url;
    };

    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<number | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const facebookPageUrl = `https://www.facebook.com/${pageUsername}`;
    const facebookReelsUrl = `https://www.facebook.com/${pageUsername}/reels`;
    // Fetch reels from API
    useEffect(() => {
        const fetchReels = async () => {
            try {
                const response = await api.facebookReels.getAll();
                const data = response?.data || response || [];
                if (Array.isArray(data) && data.length > 0) {
                    const transformedReels = data.map((reel: any) => ({
                        id: reel.id,
                        title: reel.title,
                        thumbnail: reel.thumbnail_url,
                        video_url: normalizeVideoUrl(reel.video_url || reel.facebook_url),
                        facebook_url: reel.facebook_url,
                        views: reel.views_count || '0',
                        duration: reel.duration
                    }));
                    setReels(transformedReels);
                } else {
                    setReels([]);
                }
            } catch (error) {
                console.error('Failed to fetch reels:', error);
                setReels([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReels();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const openVideoModal = (index: number) => {
        const reel = reelsData[index];
        const playable = normalizeVideoUrl(reel?.video_url || reel?.facebook_url);
        if (playable) {
            // cache normalized url
            reelsData[index].video_url = playable;
            setActiveVideo(index);
            setIsPlaying(true);
        } else if (reel?.facebook_url) {
            window.open(reel.facebook_url, '_blank', 'noopener,noreferrer');
        }
    };

    const closeVideoModal = () => {
        setActiveVideo(null);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
        }
        setIsMuted(!isMuted);
    };

    const navigateVideo = (direction: 'prev' | 'next') => {
        if (activeVideo === null) return;
        
        if (direction === 'prev' && activeVideo > 0) {
            setActiveVideo(activeVideo - 1);
        } else if (direction === 'next' && activeVideo < reelsData.length - 1) {
            setActiveVideo(activeVideo + 1);
        }
        setIsPlaying(true);
    };

    const reelsData = reels;

    return (
        <section className="py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Facebook className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Play className="w-2.5 h-2.5 text-white fill-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">فيديوهات {pageName}</h2>
                        <p className="text-xs text-gray-500">شاهد أحدث فيديوهاتنا وعروضنا</p>
                    </div>
                </div>
                <a
                    href={facebookReelsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
                >
                    <span>عرض الكل</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>

            {/* Reels Carousel */}
            <div className="relative">
                {!loading && reelsData.length === 0 && (
                    <div className="text-center text-sm text-gray-500 py-6">
                        لا توجد فيديوهات حالياً
                    </div>
                )}
                {/* Navigation Buttons */}
                {reelsData.length > 0 && (
                    <>
                        <button
                            onClick={() => scroll('right')}
                            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => scroll('left')}
                            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    </>
                )}

                {/* Scrollable Container */}
                <div 
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-2"
                >
                    {loading ? (
                        // Loading skeleton
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-36 md:w-44">
                                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-200 animate-pulse" />
                            </div>
                        ))
                    ) : (
                        reelsData.map((video, index) => (
                            <div
                                key={video.id}
                                className="flex-shrink-0 w-36 md:w-44 cursor-pointer group"
                                onClick={() => openVideoModal(index)}
                            >
                                {/* Video Thumbnail */}
                                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-md group-hover:shadow-xl transition-all">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            // استخدام gradient placeholder
                                            target.style.display = 'none';
                                            target.onerror = null;
                                        }}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    
                                    {/* Fallback Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Facebook className="w-16 h-16 text-white/30" />
                                    </div>
                                    
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    
                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white/50 transition-all">
                                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                                        </div>
                                    </div>

                                    {/* Facebook Badge */}
                                    <div className="absolute top-2 right-2">
                                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                                            <Facebook className="w-4 h-4 text-white" />
                                        </div>
                                    </div>

                                    {/* Duration Badge */}
                                    {video.duration && (
                                        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                            {video.duration}
                                        </div>
                                    )}

                                    {/* Views Count */}
                                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                                        <span className="text-white text-xs font-medium">{video.views} مشاهدة</span>
                                    </div>

                                    {/* Title */}
                                    <div className="absolute bottom-2 left-2 right-10">
                                        <p className="text-white text-sm font-medium truncate">{video.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* View All Card */}
                    <a
                        href={facebookReelsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-36 md:w-44"
                    >
                        <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-md hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <ExternalLink className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-white font-bold text-lg">عرض الكل</p>
                                <p className="text-white/80 text-sm">على فيسبوك</p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>

            {/* Video Modal */}
            {activeVideo !== null && (
                <div 
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                    onClick={closeVideoModal}
                >
                    <div 
                        className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeVideoModal}
                            className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {(() => {
                            const current = reelsData[activeVideo];
                            const playableUrl = normalizeVideoUrl(current?.video_url || current?.facebook_url);
                            const isEmbedSource = playableUrl
                                ? /youtube\.com|youtu\.be|vimeo\.com|facebook\.com\/plugins\/video\.php/.test(playableUrl)
                                : false;
                            const hasVideoFile = playableUrl && !isEmbedSource;

                            return (
                                <>
                                    {/* Mute Button - only for direct video */}
                                    {hasVideoFile && (
                                        <button
                                            onClick={toggleMute}
                                            className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                        >
                                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                    )}

                                    {/* Video Content */}
                                    {playableUrl ? (
                                        isEmbedSource ? (
                                            <iframe
                                                src={playableUrl}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title={current.title}
                                            />
                                        ) : (
                                            <video
                                                ref={videoRef}
                                                src={playableUrl}
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                loop
                                                muted={isMuted}
                                                poster={current?.thumbnail}
                                                playsInline
                                                onClick={togglePlay}
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                            />
                                        )
                                    ) : (
                                        // Fallback: Show thumbnail with link to Facebook
                                        <div className="relative w-full h-full">
                                            <img
                                                src={current?.thumbnail}
                                                alt={current?.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                                                <p className="text-white text-center text-sm mb-4 px-4">
                                                    الفيديو غير متاح حالياً
                                                </p>
                                                {current?.facebook_url && (
                                                    <a
                                                        href={current.facebook_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Facebook className="w-5 h-5" />
                                                        شاهد على فيسبوك
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {/* Play/Pause Overlay */}
                        {reelsData[activeVideo]?.video_url && !/youtube\\.com|youtu\\.be|vimeo\\.com/.test(reelsData[activeVideo].video_url || '') && !isPlaying && (
                            <div 
                                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                                onClick={togglePlay}
                            >
                                <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                                </div>
                            </div>
                        )}

                        {/* Video Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Facebook className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white font-bold">{pageName}</span>
                            </div>
                            <p className="text-white text-sm">{reelsData[activeVideo]?.title}</p>
                            <p className="text-white/70 text-xs">{reelsData[activeVideo]?.views} مشاهدة</p>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {activeVideo > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); navigateVideo('prev'); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                    {activeVideo < reelsData.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); navigateVideo('next'); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}

            {/* Follow CTA Banner */}
            <div className="mt-4 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Facebook className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="text-white text-center md:text-right">
                        <h3 className="font-bold text-lg">{pageName}</h3>
                        <p className="text-white/80 text-sm">تابعنا لمشاهدة أحدث العروض والمنتجات 🍫</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <a
                        href={facebookReelsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur text-white rounded-full font-semibold hover:bg-white/30 transition-colors border border-white/30"
                    >
                        <Play className="w-4 h-4 fill-white" />
                        الريلز
                    </a>
                    <a
                        href={facebookPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg"
                    >
                        <Facebook className="w-5 h-5" />
                        متابعة
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FacebookReelsGrid;
