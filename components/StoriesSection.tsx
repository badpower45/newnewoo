import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, Play, ExternalLink, Eye } from 'lucide-react';
import { api } from '../services/api';

interface Story {
    id: number;
    user_id?: number;
    circle_name?: string;
    title: string;
    media_url: string;
    media_type: 'image' | 'video';
    duration: number;
    link_url?: string;
    link_text?: string;
    views_count: number;
    is_active: boolean;
    expires_at: string;
    created_at: string;
    user_name?: string;
    user_avatar?: string;
    circle_image_url?: string;
}

interface StoryGroup {
    id: string | number;
    name: string;
    avatar: string;
    coverTitle?: string;
    coverLink?: string;
    stories: Story[];
    hasUnviewed: boolean;
}

// ─── Video URL detection & embedding (supports YouTube, Facebook, Vimeo, direct) ───
type VideoSource = 'youtube' | 'facebook' | 'vimeo' | 'direct' | 'external';

const detectSource = (url: string): VideoSource => {
    if (!url) return 'external';
    if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
    if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) return 'facebook';
    if (/vimeo\.com/i.test(url)) return 'vimeo';
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return 'direct';
    return 'external';
};

const extractYoutubeId = (url: string): string => {
    if (!url) return '';
    const srcMatch = url.match(/src=["']([^"']+)["']/);
    if (srcMatch?.[1]) url = srcMatch[1];
    const m = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    return m?.[1] || '';
};

const getYtThumb = (id: string) => id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';

const buildEmbedUrl = (url: string): string => {
    if (!url) return '';
    const src = detectSource(url);
    if (src === 'youtube') {
        const id = extractYoutubeId(url);
        return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1&mute=1` : url;
    }
    if (src === 'facebook') {
        if (/plugins\/video\.php/.test(url)) return url.startsWith('http') ? url : `https:${url}`;
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true&muted=true&width=350`;
    }
    if (src === 'vimeo') {
        const vId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
        return vId ? `https://player.vimeo.com/video/${vId}?autoplay=1&muted=1&background=1` : url;
    }
    return url;
};

// Lazy iframe – only renders when the story is active, shows spinner until loaded
const LazyIframe = memo(({ src, title }: { src: string; title: string }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="relative w-full h-full bg-black">
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            )}
            <iframe
                src={src}
                className={`w-full h-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                style={{ background: '#000' }}
            />
        </div>
    );
});

const StoriesSection: React.FC = () => {
    const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
    const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [loading, setLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(false);
    const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
    const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const viewTrackedRef = useRef<Set<number>>(new Set());

    // ── Fetch stories ─────────────────────────────────────────────
    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await api.stories.getAll();
                const stories: Story[] = Array.isArray(response) ? response : response?.data || [];
                
                const groupsMap = new Map<string | number, StoryGroup>();
                stories.forEach((story) => {
                    const circleName = story.circle_name?.trim();
                    const key = circleName || (story.user_id ?? story.user_name ?? 'store');
                    const name = circleName || story.user_name || 'Allosh Market';
                    const ytThumb = getYtThumb(extractYoutubeId(story.link_url || story.media_url));
                    const avatar =
                        story.circle_image_url ||
                        story.user_avatar ||
                        (story.media_type === 'image' ? story.media_url : '') ||
                        ytThumb ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F97316&color=fff&size=96`;

                    if (!groupsMap.has(key)) {
                        groupsMap.set(key, { id: key, name, avatar, stories: [], hasUnviewed: true });
                    }
                    groupsMap.get(key)!.stories.push(story);
                });

                const groups: StoryGroup[] = Array.from(groupsMap.values()).map((group) => {
                    if (!group.stories.length) return group;
                    const sorted = [...group.stories].sort(
                        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    );
                    const cover = sorted[sorted.length - 1];
                    const ytThumb = getYtThumb(extractYoutubeId(cover?.link_url || cover?.media_url || ''));
                    const coverAvatar = cover?.circle_image_url || (cover?.media_type === 'image' ? cover.media_url : '') || ytThumb || group.avatar;
                    return { ...group, avatar: coverAvatar, coverTitle: cover?.title, coverLink: cover?.link_url };
                });

                setStoryGroups(groups);
            } catch (error) {
                console.error('Failed to fetch stories:', error);
                setStoryGroups([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    // ── Track view ────────────────────────────────────────────────
    const trackView = useCallback((story: Story) => {
        if (!viewTrackedRef.current.has(story.id)) {
            viewTrackedRef.current.add(story.id);
            api.stories.recordView?.(story.id)?.catch?.(() => {});
        }
    }, []);

    // ── Determine media type for a story ──────────────────────────
    const getStoryMedia = useCallback((story: Story) => {
        const videoUrl = story.link_url || story.media_url;
        const source = detectSource(videoUrl);
        const isVideoStory = story.media_type === 'video' || source !== 'external';

        if (!isVideoStory || source === 'external') {
            // Pure image story, or unsupported video platform → show image + external link
            if (story.link_url && source === 'external') return { type: 'external' as const, url: story.link_url };
            return { type: 'image' as const, url: story.media_url };
        }
        if (source === 'direct') return { type: 'video' as const, url: videoUrl };
        // YouTube / Facebook / Vimeo → efficient embed
        return { type: 'embed' as const, url: buildEmbedUrl(videoUrl), source };
    }, []);

    // ── Progress timer (adapts duration for embeds) ───────────────
    useEffect(() => {
        if (activeGroupIndex === null || isPaused || videoLoading) {
            if (progressInterval.current) clearInterval(progressInterval.current);
            return;
        }

        const currentGroup = storyGroups[activeGroupIndex];
        const currentStory = currentGroup?.stories[activeStoryIndex];
        if (!currentStory) return;

        trackView(currentStory);

        const media = getStoryMedia(currentStory);
        const isEmbed = media.type === 'embed';
        // Give embeds at least 15s, direct video uses its duration, images use configured duration
        const durationSec = isEmbed ? Math.max(currentStory.duration, 15) : currentStory.duration;
        const durationMs = durationSec * 1000;
        const step = 100 / (durationMs / 50);

        progressInterval.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNextStory();
                    return 0;
                }
                return prev + step;
            });
        }, 50);

        return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
    }, [activeGroupIndex, activeStoryIndex, isPaused, videoLoading, storyGroups]);

    const handleNextStory = useCallback(() => {
        if (activeGroupIndex === null) return;
        
        const currentGroup = storyGroups[activeGroupIndex];
        if (activeStoryIndex < currentGroup.stories.length - 1) {
            setActiveStoryIndex(prev => prev + 1);
            setProgress(0);
        } else if (activeGroupIndex < storyGroups.length - 1) {
            setActiveGroupIndex(prev => (prev ?? 0) + 1);
            setActiveStoryIndex(0);
            setProgress(0);
        } else {
            closeStoryViewer();
        }
    }, [activeGroupIndex, activeStoryIndex, storyGroups]);

    const handlePrevStory = useCallback(() => {
        if (activeGroupIndex === null) return;
        
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => prev - 1);
            setProgress(0);
        } else if (activeGroupIndex > 0) {
            const prevGroup = storyGroups[activeGroupIndex - 1];
            setActiveGroupIndex(prev => (prev ?? 0) - 1);
            setActiveStoryIndex(prevGroup.stories.length - 1);
            setProgress(0);
        }
    }, [activeGroupIndex, activeStoryIndex, storyGroups]);

    const openStoryViewer = (groupIndex: number) => {
        setActiveGroupIndex(groupIndex);
        setActiveStoryIndex(0);
        setProgress(0);
        setIsPaused(false);
        setVideoLoading(false);
        document.body.style.overflow = 'hidden';
    };

    const closeStoryViewer = () => {
        setActiveGroupIndex(null);
        setActiveStoryIndex(0);
        setProgress(0);
        setIsPaused(false);
        setVideoLoading(false);
        document.body.style.overflow = '';
    };

    // Touch handlers for swipe (horizontal only)
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const dx = touchStartX.current - e.changedTouches[0].clientX;
        const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
        if (Math.abs(dx) > 50 && dy < 100) {
            const goNext = dx > 0;
            if ((goNext && !isRTL) || (!goNext && isRTL)) handleNextStory();
            else handlePrevStory();
        }
    };

    // Click zones
    const handleStoryClick = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        const isLeftZone = x < width / 3;
        const isRightZone = x > (2 * width) / 3;

        // عكس الاتجاه: الضغط على اليسار ينقل لليمين (الأستوري التالي)
        if ((isLeftZone && !isRTL) || (isRightZone && isRTL)) {
            handlePrevStory();  // اليسار = السابق
        } else if ((isRightZone && !isRTL) || (isLeftZone && isRTL)) {
            handleNextStory();  // اليمين = التالي
        } else {
            setIsPaused(prev => !prev);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeGroupIndex === null) return;
            
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    handleNextStory();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    handlePrevStory();
                    break;
                case 'Escape':
                    closeStoryViewer();
                    break;
                case ' ':
                    e.preventDefault();
                    setIsPaused(prev => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeGroupIndex, handleNextStory, handlePrevStory]);

    if (loading) {
        return (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 animate-pulse">
                        <div className="w-[68px] h-[68px] rounded-full bg-gray-200" />
                        <div className="w-12 h-3 rounded bg-gray-200" />
                    </div>
                ))}
            </div>
        );
    }

    if (storyGroups.length === 0) return null;

    const currentGroup = activeGroupIndex !== null ? storyGroups[activeGroupIndex] : null;
    const currentStory = currentGroup?.stories[activeStoryIndex];

    return (
        <>
            {/* Stories Circles */}
            <div className="flex gap-3 overflow-x-scroll pb-2 -mx-4 px-4 scrollbar-hide" style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {storyGroups.map((group, index) => (
                    <div 
                        key={group.id}
                        className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => openStoryViewer(index)}
                    >
                        <div className="relative">
                            <div className={`w-[68px] h-[68px] rounded-full p-[3px] ${
                                group.hasUnviewed 
                                    ? 'bg-gradient-to-tr from-[#F97316] via-[#EC4899] to-[#8B5CF6]' 
                                    : 'bg-gray-300'
                            }`}>
                                <div className="w-full h-full rounded-full bg-white p-[2px]">
                                    <img 
                                        src={group.avatar} 
                                        alt={group.name}
                                        className="w-full h-full rounded-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=F97316&color=fff&size=96`;
                                        }}
                                    />
                                </div>
                            </div>
                            {group.stories.length > 1 && (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-[#F97316] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {group.stories.length}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-[#1F2937] font-medium truncate max-w-[64px]">
                            {group.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Story Viewer Modal */}
            {activeGroupIndex !== null && currentStory && currentGroup && (() => {
                const media = getStoryMedia(currentStory);

                return (
                    <div 
                        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div 
                            className="relative w-full h-full max-w-md mx-auto flex flex-col"
                            onClick={handleStoryClick}
                        >
                            {/* Progress Bars */}
                            <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-2 pt-3">
                                {currentGroup.stories.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden"
                                    >
                                        <div 
                                            className="h-full bg-white rounded-full transition-all duration-75"
                                            style={{ 
                                                width: idx < activeStoryIndex ? '100%' : 
                                                       idx === activeStoryIndex ? `${progress}%` : '0%'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Header */}
                            <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-8 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={currentGroup.avatar} 
                                        alt={currentGroup.name}
                                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentGroup.name)}&background=F97316&color=fff&size=96`;
                                        }}
                                    />
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{currentGroup.name}</h4>
                                        <p className="text-white/70 text-xs">
                                            {new Date(currentStory.created_at).toLocaleDateString('ar-EG', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setIsPaused(prev => !prev); }}
                                        className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                                    >
                                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                                    </button>
                                    {media.type === 'video' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setIsMuted(prev => !prev); }}
                                            className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                                        >
                                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); closeStoryViewer(); }}
                                        className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Story Content */}
                            <div className="flex-1 flex items-center justify-center">
                                {/* Loading spinner overlay */}
                                {videoLoading && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
                                        <div className="w-12 h-12 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}

                                {media.type === 'image' && (
                                    <img 
                                        src={media.url}
                                        alt={currentStory.title}
                                        className="max-w-full max-h-full object-contain"
                                        loading="eager"
                                    />
                                )}

                                {media.type === 'video' && (
                                    <video
                                        ref={videoRef}
                                        key={`vid-${activeGroupIndex}-${activeStoryIndex}`}
                                        src={media.url}
                                        className="max-w-full max-h-full object-contain"
                                        autoPlay
                                        muted={isMuted}
                                        playsInline
                                        preload="metadata"
                                        onLoadStart={() => setVideoLoading(true)}
                                        onCanPlay={() => { setVideoLoading(false); setIsPaused(false); }}
                                        onError={() => setVideoLoading(false)}
                                    />
                                )}

                                {media.type === 'embed' && (
                                    <LazyIframe
                                        key={`embed-${activeGroupIndex}-${activeStoryIndex}`}
                                        src={media.url}
                                        title={currentStory.title}
                                    />
                                )}

                                {media.type === 'external' && (
                                    <div className="flex flex-col items-center justify-center gap-6 p-8">
                                        {currentStory.media_url && currentStory.media_type === 'image' && (
                                            <img
                                                src={currentStory.media_url}
                                                alt={currentStory.title}
                                                className="max-w-full max-h-[60vh] object-contain rounded-xl"
                                            />
                                        )}
                                        <a
                                            href={media.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            شاهد الفيديو
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Title, Link & Views */}
                            <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                <h3 className="text-white text-lg font-bold mb-2 text-center drop-shadow-lg">
                                    {currentStory.title}
                                </h3>
                                {currentStory.link_url && media.type !== 'embed' && (
                                    <a 
                                        href={currentStory.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-[#1F2937] font-semibold rounded-full text-center hover:bg-gray-100 transition-colors shadow-lg"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {currentStory.link_text || 'عرض المزيد'}
                                    </a>
                                )}
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                    <Eye className="w-3.5 h-3.5 text-white/60" />
                                    <span className="text-white/60 text-xs">
                                        {(currentStory.views_count || 0).toLocaleString('ar-EG')} مشاهدة
                                    </span>
                                </div>
                            </div>

                            {/* Navigation Arrows (Desktop) */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
                                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/30 rounded-full items-center justify-center text-white hover:bg-black/50 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
                                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/30 rounded-full items-center justify-center text-white hover:bg-black/50 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                );
            })()}

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};

export default StoriesSection;
