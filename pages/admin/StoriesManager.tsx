import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Clock, Link as LinkIcon, Image, Video, Save, X, RefreshCw, Upload, Search, Package, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

interface Story {
    id: number;
    user_id?: number;
    circle_name?: string;
    title: string;
    media_url?: string;
    media_type: 'image' | 'video';
    duration: number;
    link_url?: string;
    link_text?: string;
    views_count: number;
    is_active: boolean;
    priority: number;
    expires_at: string;
    created_at: string;
    user_name?: string;
}

interface StoryItemForm {
    title: string;
    media_url: string;
    media_type: 'image' | 'video';
    duration: number;
    link_url: string;
    link_text: string;
}

interface ProductResult {
    id: string | number;
    name: string;
    image_url?: string;
    price?: number;
}

const StoriesManager: React.FC = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStory, setEditingStory] = useState<Story | null>(null);
    const defaultStoryItem = (): StoryItemForm => ({
        title: '',
        media_url: '',
        media_type: 'image',
        duration: 5,
        link_url: '',
        link_text: ''
    });
    const [formData, setFormData] = useState({
        circle_name: '',
        expires_in_hours: 24,
        priority: 0
    });
    const [storyItems, setStoryItems] = useState<StoryItemForm[]>([defaultStoryItem()]);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadingItems, setUploadingItems] = useState<Record<number, boolean>>({});
    const [dragOver, setDragOver] = useState<Record<number, boolean>>({});
    const [productSearchQuery, setProductSearchQuery] = useState<Record<number, string>>({});
    const [productResults, setProductResults] = useState<Record<number, ProductResult[]>>({});
    const [searchingProducts, setSearchingProducts] = useState<Record<number, boolean>>({});
    const [showProductDropdown, setShowProductDropdown] = useState<Record<number, boolean>>({});
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
    const searchTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    const toYoutubeEmbed = (url: string) => {
        if (!url) return '';
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
        // YouTube shorts/links
        if (/youtube\.com|youtu\.be/.test(url)) {
            return toYoutubeEmbed(url);
        }
        return url;
    };

    // ── Image upload helpers ──────────────────────────────────
    const handleImageUpload = useCallback(async (index: number, file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('الملف ده مش صورة! اختار صورة JPG أو PNG أو WebP');
            return;
        }
        setUploadingItems(prev => ({ ...prev, [index]: true }));
        try {
            const url = await api.images.upload(file);
            updateStoryItem(index, { media_url: url, media_type: 'image' });
        } catch (e) {
            console.error('Image upload failed', e);
            alert('فشل رفع الصورة، حاول تاني');
        } finally {
            setUploadingItems(prev => ({ ...prev, [index]: false }));
        }
    }, []);

    const handleFileDrop = useCallback((index: number, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(prev => ({ ...prev, [index]: false }));
        const file = e.dataTransfer.files?.[0];
        if (file) handleImageUpload(index, file);
    }, [handleImageUpload]);

    // ── Product search helpers ────────────────────────────────
    const searchProducts = useCallback((index: number, q: string) => {
        setProductSearchQuery(prev => ({ ...prev, [index]: q }));
        if (searchTimers.current[index]) clearTimeout(searchTimers.current[index]);
        if (!q.trim()) {
            setProductResults(prev => ({ ...prev, [index]: [] }));
            setShowProductDropdown(prev => ({ ...prev, [index]: false }));
            return;
        }
        searchTimers.current[index] = setTimeout(async () => {
            setSearchingProducts(prev => ({ ...prev, [index]: true }));
            try {
                const res = await api.products.search(q);
                const list: ProductResult[] = Array.isArray(res) ? res : (res?.data || res?.products || []);
                setProductResults(prev => ({ ...prev, [index]: list.slice(0, 8) }));
                setShowProductDropdown(prev => ({ ...prev, [index]: true }));
            } catch {
                setProductResults(prev => ({ ...prev, [index]: [] }));
            } finally {
                setSearchingProducts(prev => ({ ...prev, [index]: false }));
            }
        }, 400);
    }, []);

    const selectProduct = useCallback((index: number, product: ProductResult) => {
        updateStoryItem(index, {
            link_url: `/product/${product.id}`,
            link_text: product.name || 'شاهد المنتج'
        });
        setProductSearchQuery(prev => ({ ...prev, [index]: '' }));
        setShowProductDropdown(prev => ({ ...prev, [index]: false }));
        setProductResults(prev => ({ ...prev, [index]: [] }));
    }, []);

    const fetchStories = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const response = await api.stories.getAdminList();
            const fetched = Array.isArray(response) ? response : response?.data || [];
            setStories(fetched);
        } catch (error) {
            console.error('Failed to fetch stories:', error);
            setStories([]);
            setErrorMessage('تعذر تحميل الاستوريز من الخادم.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const circleOptions = useMemo(() => {
        const names = stories
            .map((story) => story.circle_name?.trim())
            .filter((name): name is string => Boolean(name));
        return Array.from(new Set(names));
    }, [stories]);

    const storyCircles = useMemo(() => {
        const circles = new Map<string, { name: string; coverUrl: string; count: number; latest: number }>();
        stories.forEach((story) => {
            const name = story.circle_name?.trim() || 'بدون دائرة';
            const createdAt = new Date(story.created_at).getTime();
            const ytId = extractYoutubeId(story.link_url || story.media_url || '');
            const cover =
                story.media_type === 'video'
                    ? youtubeThumbnail(ytId)
                    : (story.media_url || '');

            const existing = circles.get(name);
            if (!existing) {
                circles.set(name, { name, coverUrl: cover, count: 1, latest: createdAt });
                return;
            }

            existing.count += 1;
            if (createdAt > existing.latest) {
                existing.coverUrl = cover;
                existing.latest = createdAt;
            }
        });
        return Array.from(circles.values()).sort((a, b) => b.latest - a.latest);
    }, [stories]);

    const updateStoryItem = (index: number, updates: Partial<StoryItemForm>) => {
        setStoryItems((items) =>
            items.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
        );
    };

    const addStoryItem = () => {
        setStoryItems((items) => [...items, defaultStoryItem()]);
    };

    const removeStoryItem = (index: number) => {
        setStoryItems((items) => items.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const circleName = formData.circle_name.trim();
            const buildPayload = (item: StoryItemForm) => {
                let derivedMediaUrl = item.media_url;
                let derivedMediaType = item.media_type;

                // If YouTube link is provided and no media selected, use thumbnail automatically
                const ytId = extractYoutubeId(item.link_url || item.media_url);
                if (!derivedMediaUrl && ytId) {
                    derivedMediaUrl = youtubeThumbnail(ytId);
                    derivedMediaType = 'image';
                }

                return {
                    title: item.title,
                    media_url: normalizeMediaUrl(derivedMediaUrl, derivedMediaType),
                    media_type: derivedMediaType,
                    duration: item.duration,
                    link_url: item.link_url,
                    link_text: item.link_text,
                    circle_name: circleName || undefined,
                    priority: formData.priority
                };
            };

            if (editingStory) {
                const payload = buildPayload(storyItems[0] || defaultStoryItem());
                await api.stories.update(editingStory.id, payload);
            } else {
                for (const item of storyItems) {
                    const payload = buildPayload(item);
                    await api.stories.create({
                        ...payload,
                        expires_in_hours: formData.expires_in_hours
                    });
                }
            }
            setShowModal(false);
            resetForm();
            fetchStories();
        } catch (error) {
            console.error('Failed to save story:', error);
            alert('فشل في حفظ الاستوري');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الاستوري؟')) return;

        try {
            await api.stories.delete(id);
            fetchStories();
        } catch (error) {
            console.error('Failed to delete story:', error);
            alert('فشل في حذف الاستوري');
        }
    };

    const handleToggleActive = async (story: Story) => {
        try {
            await api.stories.update(story.id, { is_active: !story.is_active });
            fetchStories();
        } catch (error) {
            console.error('Failed to toggle story:', error);
        }
    };

    const openEditModal = async (story: Story) => {
        try {
            const response = await api.stories.getById(story.id);
            const fullStory = response?.data || response;
            setEditingStory(fullStory);
            setFormData({
                circle_name: fullStory.circle_name || '',
                expires_in_hours: 24,
                priority: fullStory.priority
            });
            setStoryItems([{
                title: fullStory.title,
                media_url: fullStory.media_url || '',
                media_type: fullStory.media_type,
                duration: fullStory.duration,
                link_url: fullStory.link_url || '',
                link_text: fullStory.link_text || ''
            }]);
            setShowModal(true);
        } catch (error) {
            console.error('Failed to load story details:', error);
            alert('تعذر تحميل بيانات الاستوري كاملة');
        }
    };

    const resetForm = (presetCircle?: string) => {
        setEditingStory(null);
        setFormData({
            circle_name: presetCircle || '',
            expires_in_hours: 24,
            priority: 0
        });
        setStoryItems([defaultStoryItem()]);
    };

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">إدارة الاستوريز</h1>
                    <p className="text-gray-500 mt-1">إضافة وإدارة استوريز المتجر</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchStories}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="تحديث"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة استوري
                    </button>
                </div>
            </div>

            {/* Story Circles */}
            <div className="mb-6 bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">دوائر الاستوريز</h2>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="text-sm text-[#F97316] hover:text-[#EA580C] font-semibold"
                    >
                        <Plus className="w-4 h-4 inline-block ml-1" />
                        دائرة جديدة
                    </button>
                </div>
                {storyCircles.length === 0 ? (
                    <p className="text-sm text-gray-500">لا توجد دوائر بعد. ابدأ بإضافة استوري جديدة.</p>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {storyCircles.map((circle) => (
                            <button
                                key={circle.name}
                                type="button"
                                onClick={() => { resetForm(circle.name); setShowModal(true); }}
                                className="flex flex-col items-center gap-2 min-w-[80px] active:scale-95 transition-transform"
                                title={`إضافة صور لدائرة ${circle.name}`}
                            >
                                <div className="relative w-16 h-16 rounded-full p-1 border-2 border-[#F97316]">
                                    {circle.coverUrl ? (
                                        <img
                                            src={circle.coverUrl}
                                            alt={circle.name}
                                            className="w-full h-full rounded-full object-cover"
                                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                            <Image className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                    <span className="absolute -bottom-1 -right-1 bg-[#F97316] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                        {circle.count}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-700 font-medium truncate max-w-[80px]">
                                    {circle.name}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Stories Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                            <div className="aspect-[9/16] bg-gray-200 rounded-lg mb-3" />
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : stories.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl">
                    {errorMessage && (
                        <p className="text-red-600 mb-3">{errorMessage}</p>
                    )}
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد استوريز</h3>
                    <p className="text-gray-500 mb-4">ابدأ بإضافة استوري جديد لعرضه للعملاء</p>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة أول استوري
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {stories.map((story) => (
                        <div 
                            key={story.id} 
                            className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                                !story.is_active || isExpired(story.expires_at) ? 'opacity-60' : ''
                            }`}
                        >
                            {/* Preview */}
                            <div className="relative aspect-[9/16] bg-gray-100">
                                {story.media_url ? (
                                    story.media_type === 'video' ? (
                                        <video 
                                            src={story.media_url} 
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                    ) : (
                                        <img 
                                            src={story.media_url} 
                                            alt={story.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <Image className="w-8 h-8 mb-2" />
                                        <span className="text-xs">بدون معاينة</span>
                                    </div>
                                )}
                                
                                {/* Status Badge */}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {!story.is_active && (
                                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                                            معطل
                                        </span>
                                    )}
                                    {isExpired(story.expires_at) && (
                                        <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
                                            منتهي
                                        </span>
                                    )}
                                </div>

                                {/* Type Badge */}
                                <div className="absolute top-2 left-2">
                                    <span className="p-1.5 bg-black/50 text-white rounded-full">
                                        {story.media_type === 'video' ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                                    </span>
                                </div>

                                {/* Title Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                                    <h3 className="text-white font-semibold text-sm line-clamp-2">{story.title}</h3>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <div className="text-xs text-gray-500 mb-2">
                                    الدائرة: {story.circle_name?.trim() || 'بدون دائرة'}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" />
                                        {story.views_count.toLocaleString('ar-EG')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {story.duration}ث
                                    </span>
                                    {story.link_url && (
                                        <span className="flex items-center gap-1">
                                            <LinkIcon className="w-3.5 h-3.5" />
                                            رابط
                                        </span>
                                    )}
                                </div>

                                <div className="text-xs text-gray-400 mb-3">
                                    <div>أُنشئ: {formatDate(story.created_at)}</div>
                                    <div>ينتهي: {formatDate(story.expires_at)}</div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleActive(story)}
                                        className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                                            story.is_active 
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                    >
                                        {story.is_active ? <EyeOff className="w-4 h-4 mx-auto" /> : <Eye className="w-4 h-4 mx-auto" />}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(story)}
                                        className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 mx-auto" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(story.id)}
                                        className="flex-1 p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-lg font-bold">
                                {editingStory ? 'تعديل الاستوري' : 'إضافة استوري جديد'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-5">
                            {/* Circle Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الدائرة *</label>
                                <input
                                    type="text"
                                    value={formData.circle_name}
                                    onChange={(e) => setFormData({ ...formData, circle_name: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                    placeholder="مثلاً: عروض الأسبوع"
                                    list="story-circles"
                                    required={!editingStory}
                                />
                                {circleOptions.length > 0 && (
                                    <datalist id="story-circles">
                                        {circleOptions.map((name) => (
                                            <option key={name} value={name} />
                                        ))}
                                    </datalist>
                                )}
                                <p className="text-xs text-gray-500 mt-1">الاسم اللي هيظهر تحت الدائرة في صفحة العملاء.</p>
                            </div>

                            {/* Story Items */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700">وسائط الاستوري</h3>
                                {!editingStory && (
                                    <button
                                        type="button"
                                        onClick={addStoryItem}
                                        className="text-sm text-[#F97316] hover:text-[#EA580C] font-semibold"
                                    >
                                        <Plus className="w-4 h-4 inline-block ml-1" />
                                        إضافة ستوري
                                    </button>
                                )}
                            </div>

                            {storyItems.map((item, index) => (
                                <div key={`story-item-${index}`} className="border rounded-xl p-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">صورة {index + 1}</span>
                                        {!editingStory && storyItems.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeStoryItem(index)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="حذف الصورة"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        {/* ── Media Upload / URL ── */}
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الصورة / الفيديو *</label>

                                        {/* Upload Zone */}
                                        {item.media_type === 'image' && (
                                            <div
                                                onDrop={(e) => handleFileDrop(index, e)}
                                                onDragOver={(e) => { e.preventDefault(); setDragOver(prev => ({ ...prev, [index]: true })); }}
                                                onDragLeave={() => setDragOver(prev => ({ ...prev, [index]: false }))}
                                                onClick={() => fileInputRefs.current[index]?.click()}
                                                className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-2 ${
                                                    dragOver[index]
                                                        ? 'border-[#F97316] bg-orange-50'
                                                        : 'border-gray-300 hover:border-[#F97316] hover:bg-orange-50/50'
                                                }`}
                                            >
                                                <input
                                                    ref={(el) => { fileInputRefs.current[index] = el; }}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload(index, file);
                                                        e.target.value = '';
                                                    }}
                                                />
                                                {uploadingItems[index] ? (
                                                    <div className="flex flex-col items-center gap-2 text-[#F97316]">
                                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                                        <span className="text-sm font-medium">جاري الرفع...</span>
                                                    </div>
                                                ) : item.media_url ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={item.media_url}
                                                            alt="Preview"
                                                            className="w-full h-full object-contain rounded-xl"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                            <span className="text-white text-sm font-medium flex items-center gap-1"><Upload className="w-4 h-4" /> تغيير الصورة</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                                        <Upload className="w-7 h-7" />
                                                        <span className="text-sm font-medium text-gray-600">اسحب صورة هنا أو اضغط للرفع</span>
                                                        <span className="text-xs text-gray-400">JPG · PNG · WebP</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* OR paste URL for both types */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="url"
                                                    value={item.media_url}
                                                    onChange={(e) => updateStoryItem(index, { media_url: e.target.value })}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-sm"
                                                    placeholder={
                                                        item.media_type === 'video'
                                                            ? 'رابط الفيديو أو YouTube...'
                                                            : 'أو الصق رابط صورة هنا...'
                                                    }
                                                />
                                            </div>
                                            {item.media_url && (
                                                <button
                                                    type="button"
                                                    onClick={() => updateStoryItem(index, { media_url: '' })}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="مسح"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Video preview */}
                                        {item.media_url && item.media_type === 'video' && (
                                            <div className="mt-2 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                {/youtube\.com|youtu\.be/.test(item.media_url) ? (
                                                    <iframe
                                                        src={normalizeMediaUrl(item.media_url, 'video')}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        title={`story-preview-${index}`}
                                                    />
                                                ) : (
                                                    <video src={item.media_url} className="w-full h-full object-cover" controls />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الوسائط</label>
                                            <div className="flex gap-3">
                                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    item.media_type === 'image' ? 'border-[#F97316] bg-orange-50' : 'hover:bg-gray-50'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name={`media_type_${index}`}
                                                        value="image"
                                                        checked={item.media_type === 'image'}
                                                        onChange={() => updateStoryItem(index, { media_type: 'image' })}
                                                        className="sr-only"
                                                    />
                                                    <Image className="w-5 h-5" />
                                                    صورة
                                                </label>
                                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    item.media_type === 'video' ? 'border-[#F97316] bg-orange-50' : 'hover:bg-gray-50'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name={`media_type_${index}`}
                                                        value="video"
                                                        checked={item.media_type === 'video'}
                                                        onChange={() => updateStoryItem(index, { media_type: 'video' })}
                                                        className="sr-only"
                                                    />
                                                    <Video className="w-5 h-5" />
                                                    فيديو
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">المدة (ثواني)</label>
                                            <input
                                                type="number"
                                                value={item.duration}
                                                onChange={(e) => updateStoryItem(index, { duration: parseInt(e.target.value) || 5 })}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                                min="3"
                                                max="30"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الكلام تحت الصورة *</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateStoryItem(index, { title: e.target.value })}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                            placeholder="اكتب النص اللي هيظهر تحت الصورة"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">رابط الزر (اختياري)</label>

                                        {/* Product Search */}
                                        <div className="relative mb-2">
                                            <div className="flex items-center gap-2 p-2 border border-dashed rounded-lg bg-gray-50">
                                                <Package className="w-4 h-4 text-gray-400 shrink-0" />
                                                <input
                                                    type="text"
                                                    value={productSearchQuery[index] || ''}
                                                    onChange={(e) => searchProducts(index, e.target.value)}
                                                    onFocus={() => {
                                                        if (productResults[index]?.length) {
                                                            setShowProductDropdown(prev => ({ ...prev, [index]: true }));
                                                        }
                                                    }}
                                                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                                                    placeholder="ابحث عن منتج وربطه بالستوري..."
                                                />
                                                {searchingProducts[index] && <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />}
                                                {!searchingProducts[index] && <Search className="w-4 h-4 text-gray-400" />}
                                            </div>

                                            {/* Product Dropdown */}
                                            {showProductDropdown[index] && productResults[index]?.length > 0 && (
                                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-52 overflow-y-auto">
                                                    {productResults[index].map((product) => (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onMouseDown={() => selectProduct(index, product)}
                                                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-orange-50 transition-colors text-right"
                                                        >
                                                            {product.image_url ? (
                                                                <img src={product.image_url} alt={product.name} className="w-9 h-9 object-cover rounded-lg shrink-0" />
                                                            ) : (
                                                                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                                                    <Package className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0 text-right">
                                                                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                                                {product.price && (
                                                                    <p className="text-xs text-[#F97316]">{product.price} ج.م</p>
                                                                )}
                                                            </div>
                                                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Manual URL */}
                                        <input
                                            type="text"
                                            value={item.link_url}
                                            onChange={(e) => updateStoryItem(index, { link_url: e.target.value })}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-sm"
                                            placeholder="/deals أو رابط صفحة..."
                                        />
                                        {item.link_url && (
                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                <LinkIcon className="w-3 h-3" /> {item.link_url}
                                            </p>
                                        )}
                                    </div>

                                    {item.link_url && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">نص الزر</label>
                                            <input
                                                type="text"
                                                value={item.link_text}
                                                onChange={(e) => updateStoryItem(index, { link_text: e.target.value })}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                                placeholder="شاهد العروض"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Priority & Expires */}
                            <div className={`grid gap-4 ${editingStory ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                                    <input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                        min="0"
                                        max="100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">كلما زاد الرقم ظهر أولاً</p>
                                </div>

                                {!editingStory && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ينتهي خلال (ساعات)</label>
                                        <select
                                            value={formData.expires_in_hours}
                                            onChange={(e) => setFormData({ ...formData, expires_in_hours: parseInt(e.target.value) })}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                        >
                                            <option value={6}>6 ساعات</option>
                                            <option value={12}>12 ساعة</option>
                                            <option value={24}>24 ساعة (يوم)</option>
                                            <option value={48}>48 ساعة (يومين)</option>
                                            <option value={72}>72 ساعة (3 أيام)</option>
                                            <option value={168}>أسبوع</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-[#F97316] text-white rounded-lg font-medium hover:bg-[#EA580C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {editingStory ? 'تحديث' : 'إضافة'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoriesManager;
