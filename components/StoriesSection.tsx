import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { api } from '../services/api';

interface Story {
    id: number;
    user_id?: number;
    title: string;
    media_url: string;
    media_type: 'image' | 'video';
    duration: number; // seconds
    link_url?: string;
    link_text?: string;
    views_count: number;
    is_active: boolean;
    expires_at: string;
    created_at: string;
    user_name?: string;
    user_avatar?: string;
}

interface StoryGroup {
    id: number;
    name: string;
    avatar: string;
    coverTitle?: string;
    coverLink?: string;
    stories: Story[];
    hasUnviewed: boolean;
}

const StoriesSection: React.FC = () => {
    const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
    const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [loading, setLoading] = useState(true);
    const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const touchStartX = useRef<number>(0);

    const toYoutubeEmbed = (url: string) => {
        const srcMatch = url.match(/src=["']([^"']+)["']/);
        if (srcMatch?.[1]) url = srcMatch[1];
        const shorts = url.match(/youtube\.com\/shorts\/([\w-]+)/);
        const watch = url.match(/youtube\.com\/(?:watch\?v=|embed\/)([\w-]+)/);
        const short = url.match(/youtu\.be\/([\w-]+)/);
        const id = shorts?.[1] || watch?.[1] || short?.[1];
        return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1` : url;
    };

    const extractYoutubeId = (url: string) => {
        if (!url) return '';
        const srcMatch = url.match(/src=["']([^"']+)["']/);
        if (srcMatch?.[1]) url = srcMatch[1];
        const shorts = url.match(/youtube\.com\/shorts\/([\w-]+)/);
        const watch = url.match(/youtube\.com\/(?:watch\?v=|embed\/)([\w-]+)/);
        const short = url.match(/youtu\.be\/([\w-]+)/);
        return shorts?.[1] || watch?.[1] || short?.[1] || '';
    };

    const youtubeThumbnail = (id: string) => id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';

    const normalizeMediaUrl = (url: string, type: 'image' | 'video') => {
        if (!url) return '';
        if (type !== 'video') return url;
        if (/youtube\.com|youtu\.be/.test(url)) return toYoutubeEmbed(url);
        return url;
    };

    // Fetch stories from API
    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await api.stories.getAll();
                const stories: Story[] = Array.isArray(response) ? response : response?.data || [];
                
                // Group stories by user_id/name
                const groupsMap = new Map<string | number, StoryGroup>();
                stories.forEach((story) => {
                    const key = story.user_id ?? story.user_name ?? 'store';
                    const name = story.user_name || 'Allosh Market';
                    const ytId = extractYoutubeId(story.link_url || story.media_url);
                    const derivedThumb = youtubeThumbnail(ytId);
                    const avatar =
                        story.user_avatar ||
                        story.media_url ||
                        derivedThumb ||
                        'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(name) +
                            '&background=F97316&color=fff&size=128';

                    if (!groupsMap.has(key)) {
                        groupsMap.set(key, {
                            id: typeof key === 'number' ? key : Date.now() + Math.random(),
                            name,
                            avatar,
                            stories: [],
                            hasUnviewed: true
                        });
                    }
                    groupsMap.get(key)!.stories.push(story);
                });

                const groups: StoryGroup[] = Array.from(groupsMap.values()).map((group) => {
                    if (!group.stories.length) return group;
                    // اختر آخر ستوري (الأحدث) لتكون الغلاف الظاهر خارجياً
                    const sorted = [...group.stories].sort(
                        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    );
                    const cover = sorted[sorted.length - 1];
                    const ytId = extractYoutubeId(cover?.link_url || cover?.media_url || '');
                    const coverAvatar = cover?.media_url || youtubeThumbnail(ytId) || group.avatar;
                    return {
                        ...group,
                        avatar: coverAvatar,
                        coverTitle: cover?.title,
                        coverLink: cover?.link_url
                    };
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

    // Progress timer
    useEffect(() => {
        if (activeGroupIndex === null || isPaused) {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            return;
        }

        const currentGroup = storyGroups[activeGroupIndex];
        const currentStory = currentGroup?.stories[activeStoryIndex];
        if (!currentStory) return;

        const duration = currentStory.duration * 1000; // Convert to ms
        const step = 100 / (duration / 50); // Update every 50ms

        progressInterval.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNextStory();
                    return 0;
                }
                return prev + step;
            });
        }, 50);

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [activeGroupIndex, activeStoryIndex, isPaused, storyGroups]);

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
        document.body.style.overflow = 'hidden';
    };

    const closeStoryViewer = () => {
        setActiveGroupIndex(null);
        setActiveStoryIndex(0);
        setProgress(0);
        setIsPaused(false);
        document.body.style.overflow = '';
    };

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        if (Math.abs(diff) > 50) {
            const goNext = diff > 0;
            if ((goNext && !isRTL) || (!goNext && isRTL)) {
                handleNextStory();
            } else {
                handlePrevStory();
            }
        }
    };

    // Click zones
    const handleStoryClick = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        const isLeftZone = x < width / 3;
        const isRightZone = x > (2 * width) / 3;

        // Fix swipe direction for RTL: when RTL and click right, go next (not prev)
        if ((isLeftZone && !isRTL) || (isRightZone && isRTL)) {
            handleNextStory();  // Changed from handlePrevStory
        } else if ((isRightZone && !isRTL) || (isLeftZone && isRTL)) {
            handlePrevStory();  // Changed from handleNextStory
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
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-gray-200" />
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
                {/* Story Groups */}
                {storyGroups.map((group, index) => (
                    <div 
                        key={group.id}
                        className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => openStoryViewer(index)}
                    >
                        <div className="relative">
                            {/* Gradient Ring */}
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
                                    />
                                </div>
                            </div>
                            {/* Story count badge */}
                            {group.stories.length > 1 && (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-[#F97316] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {group.stories.length}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-[#1F2937] font-medium truncate max-w-[64px]">
                            {group.coverTitle || group.name}
                        </span>
                        {group.coverLink && (
                            <span className="text-[10px] text-blue-600 font-semibold truncate max-w-[64px]">
                                رابط متاح
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Story Viewer Modal */}
            {activeGroupIndex !== null && currentStory && currentGroup && (
                <div 
                    className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Removed background blur to fix black overlay issue */}

                    {/* Story Container */}
                    <div 
                        className="relative w-full h-full max-w-md mx-auto flex flex-col"
                        onClick={handleStoryClick}
                    >
                        {/* Progress Bars */}
                        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-3">
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
                        <div className="absolute top-0 left-0 right-0 z-20 p-3 pt-8 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={currentGroup.avatar} 
                                    alt={currentGroup.name}
                                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
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
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsPaused(prev => !prev); }}
                                    className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                                >
                                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                                </button>
                                {currentStory.media_type === 'video' && (
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
                        <div className="flex-1 flex items-center justify-center px-2">
                            {currentStory.media_type === 'video' ? (() => {
                                const playableUrl = normalizeMediaUrl(currentStory.media_url, 'video');
                                if (/youtube\.com|youtu\.be/.test(playableUrl)) {
                                    return (
                                        <iframe
                                            src={playableUrl}
                                            className="max-w-full max-h-full w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title={currentStory.title}
                                        />
                                    );
                                }
                                return (
                                    <video
                                        ref={videoRef}
                                        src={playableUrl}
                                        className="max-w-full max-h-full object-contain"
                                        autoPlay
                                        muted={isMuted}
                                        playsInline
                                        loop={false}
                                        onLoadStart={() => setIsPaused(true)}
                                        onCanPlay={() => setIsPaused(false)}
                                    />
                                );
                            })() : (
                                <img 
                                    src={currentStory.media_url}
                                    alt={currentStory.title}
                                    className="max-w-full max-h-full object-contain"
                                    loading="eager"
                                />
                            )}
                        </div>

                        {/* Story Title & Link */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/70 to-transparent">
                            <h3 className="text-white text-lg font-bold mb-2 text-center">
                                {currentStory.title}
                            </h3>
                            {currentStory.link_url && (
                                <a 
                                    href={currentStory.link_url}
                                    onClick={(e) => e.stopPropagation()}
                                    className="block w-full py-2.5 bg-white text-[#1F2937] font-semibold rounded-full text-center hover:bg-gray-100 transition-colors"
                                >
                                    {currentStory.link_text || 'عرض المزيد'}
                                </a>
                            )}
                            {/* Views count */}
                            <p className="text-white/60 text-xs text-center mt-2">
                                👁 {currentStory.views_count.toLocaleString('ar-EG')} مشاهدة
                            </p>
                        </div>

                        {/* Navigation Arrows (Desktop) */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
                            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 rounded-full items-center justify-center text-white hover:bg-black/50 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
                            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 rounded-full items-center justify-center text-white hover:bg-black/50 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

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
