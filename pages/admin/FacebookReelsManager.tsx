import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Save, X, RefreshCw, Facebook, Link as LinkIcon, Video, ExternalLink, GripVertical, Play, Bell, Youtube } from 'lucide-react';
import { api } from '../../services/api';
import { pushNotificationService } from '../../services/pushNotifications';

interface FacebookReel {
    id: number;
    title: string;
    thumbnail_url: string;
    video_url: string;
    facebook_url: string;
    views_count: string;
    duration: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

const emptyReel = {
    title: '',
    thumbnail_url: '',
    video_url: '',
    facebook_url: '',
    views_count: '0',
    duration: '0:30',
    is_active: true,
    display_order: 0
};

const FacebookReelsManager: React.FC = () => {
    const [reels, setReels] = useState<FacebookReel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<FacebookReel | null>(null);
    const [form, setForm] = useState(emptyReel);
    const [saving, setSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [sendPush, setSendPush] = useState(false);

    const fetchReels = async () => {
        setLoading(true);
        try {
            const response = await api.facebookReels.getAll();
            setReels(Array.isArray(response) ? response : response?.data || []);
        } catch (error) {
            console.error('Failed to fetch reels:', error);
            // استخدم بيانات افتراضية للعرض
            setReels([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReels();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.facebook_url && !form.video_url) {
            alert('أضف رابط فيسبوك أو رابط فيديو (YouTube/Vimeo/MP4)');
            return;
        }
        setSaving(true);

        try {
            const normalizedVideo = normalizeVideoUrl(form.video_url || form.facebook_url);
            const autoThumb = form.thumbnail_url || getYoutubeThumb(normalizedVideo);

            if (editing) {
                await api.facebookReels.update(editing.id, { ...form, video_url: normalizedVideo, thumbnail_url: autoThumb });
            } else {
                await api.facebookReels.create({ ...form, video_url: normalizedVideo, thumbnail_url: autoThumb });
            }

            if (sendPush) {
                await pushNotificationService.notifyNewReel({
                    title: form.title,
                    thumbnail: form.thumbnail_url,
                    url: form.video_url || form.facebook_url
                });
            }

            setShowModal(false);
            resetForm();
            fetchReels();
        } catch (error) {
            console.error('Failed to save reel:', error);
            alert('فشل في حفظ الريل');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الريل؟')) return;

        try {
            await api.facebookReels.delete(id);
            fetchReels();
        } catch (error) {
            console.error('Failed to delete reel:', error);
            alert('فشل في حذف الريل');
        }
    };

    const handleToggleActive = async (reel: FacebookReel) => {
        try {
            await api.facebookReels.update(reel.id, { is_active: !reel.is_active });
            fetchReels();
        } catch (error) {
            console.error('Failed to toggle reel:', error);
        }
    };

    const openEditModal = (reel: FacebookReel) => {
        setEditing(reel);
        setForm({
            title: reel.title,
            thumbnail_url: reel.thumbnail_url,
            video_url: reel.video_url || '',
            facebook_url: reel.facebook_url,
            views_count: reel.views_count,
            duration: reel.duration,
            is_active: reel.is_active,
            display_order: reel.display_order
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditing(null);
        setForm(emptyReel);
        setSendPush(false);
    };

    // Extract video ID from Facebook URL
    const extractFacebookVideoId = (url: string) => {
        const patterns = [
            /facebook\.com\/.*\/videos\/(\d+)/,
            /facebook\.com\/watch\/\?v=(\d+)/,
            /facebook\.com\/reel\/(\d+)/,
            /fb\.watch\/([a-zA-Z0-9]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    const getYoutubeThumb = (url: string) => {
        const ytWatch = url.match(/youtube\.com\/(?:watch\?v=|embed\/)([\w-]+)/);
        const ytShort = url.match(/youtu\.be\/([\w-]+)/);
        const id = ytWatch?.[1] || ytShort?.[1];
        return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
    };

    const normalizeVideoUrl = (url: string) => {
        if (!url) return '';
        // If user pasted embed code, extract src
        const srcMatch = url.match(/src=["']([^"']+)["']/);
        if (srcMatch && srcMatch[1]) {
            url = srcMatch[1];
        }

        // YouTube formats
        const ytWatch = url.match(/youtube\.com\/(?:watch\?v=|embed\/)([\w-]+)/);
        const ytShort = url.match(/youtu\.be\/([\w-]+)/);
        if (ytWatch && ytWatch[1]) {
            return `https://www.youtube.com/embed/${ytWatch[1]}?rel=0&autoplay=1&modestbranding=1`;
        }
        if (ytShort && ytShort[1]) {
            return `https://www.youtube.com/embed/${ytShort[1]}?rel=0&autoplay=1&modestbranding=1`;
        }

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
        }

        // Keep MP4 or direct link as-is
        return url;
    };

    // Auto-fill from Facebook URL
    const handleFacebookUrlChange = (url: string) => {
        setForm({ ...form, facebook_url: url });
        
        // Try to generate embed URL
        const videoId = extractFacebookVideoId(url);
        if (videoId) {
            // Facebook embed URL
            const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=300`;
            setForm(prev => ({
                ...prev,
                facebook_url: url,
                video_url: embedUrl
            }));
        }
    };

    const handleVideoUrlChange = (url: string) => {
        setForm(prev => ({
            ...prev,
            video_url: normalizeVideoUrl(url)
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Facebook className="w-7 h-7 text-blue-600" />
                        إدارة الريلز (Facebook / YouTube / Vimeo)
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        أضف روابط فيسبوك أو فيديوهات YouTube/Vimeo أو ملفات MP4 للعرض داخل الموقع
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    إضافة ريل جديد
                </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-blue-800">طرق الإضافة المدعومة:</h3>
                <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                    <li>رابط فيسبوك (ريل/فيديو): الصقه لنصنع رابط التشغيل تلقائياً.</li>
                    <li>رابط YouTube أو Vimeo: الصق الرابط المباشر وسيتم تحويله إلى Embed.</li>
                    <li>ملف MP4 مباشر: ضع الرابط المباشر للفيديو لتشغيله داخل الموقع.</li>
                </ul>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">إجمالي الريلز</p>
                    <p className="text-2xl font-bold text-gray-800">{reels.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">نشط</p>
                    <p className="text-2xl font-bold text-green-600">
                        {reels.filter(r => r.is_active).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">غير نشط</p>
                    <p className="text-2xl font-bold text-gray-400">
                        {reels.filter(r => !r.is_active).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-500 text-sm">إجمالي المشاهدات</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {reels.reduce((acc, r) => acc + parseInt(r.views_count.replace(/[^0-9]/g, '') || '0'), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Reels Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : reels.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                    <Facebook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">لا يوجد ريلز حتى الآن</p>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        إضافة أول ريل
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {reels.map((reel) => (
                        <div
                            key={reel.id}
                            className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${!reel.is_active ? 'opacity-60' : ''}`}
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-[9/16] bg-gray-100">
                                {reel.thumbnail_url ? (
                                    <img
                                        src={reel.thumbnail_url}
                                        alt={reel.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <Video className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                
                                {/* Play Overlay */}
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                        <Play className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" />
                                    </div>
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                    {reel.duration}
                                </div>

                                {/* Views */}
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Eye size={12} />
                                    {reel.views_count}
                                </div>

                                {/* Status */}
                                <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${reel.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <p className="font-medium text-sm text-gray-800 line-clamp-2 mb-2" title={reel.title}>
                                    {reel.title}
                                </p>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => window.open(reel.facebook_url, '_blank')}
                                        className="flex-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="فتح في فيسبوك"
                                    >
                                        <ExternalLink size={16} className="mx-auto" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(reel)}
                                        className={`flex-1 p-1.5 rounded-lg transition-colors ${reel.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                                        title={reel.is_active ? 'إخفاء' : 'إظهار'}
                                    >
                                        {reel.is_active ? <Eye size={16} className="mx-auto" /> : <EyeOff size={16} className="mx-auto" />}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(reel)}
                                        className="flex-1 p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="تعديل"
                                    >
                                        <Edit2 size={16} className="mx-auto" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(reel.id)}
                                        className="flex-1 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="حذف"
                                    >
                                        <Trash2 size={16} className="mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editing ? 'تعديل الريل' : 'إضافة ريل جديد'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Facebook URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    رابط فيسبوك (اختياري)
                                </label>
                                <div className="relative">
                                    <Facebook className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                                    <input
                                        type="url"
                                        value={form.facebook_url}
                                        onChange={(e) => handleFacebookUrlChange(e.target.value)}
                                        placeholder="https://www.facebook.com/reel/..."
                                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">الصق رابط الريل من فيسبوك (سنولّد رابط تشغيل تلقائي).</p>
                            </div>

                            {/* Video URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    رابط فيديو (YouTube / Vimeo / MP4) *
                                </label>
                                <div className="relative">
                                    <Youtube className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                                    <input
                                        type="url"
                                        value={form.video_url}
                                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                                        placeholder="https://youtu.be/XXXX أو https://player.vimeo.com/... أو https://.../video.mp4"
                                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required={!form.facebook_url}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">نحوّل YouTube/Vimeo تلقائياً إلى رابط تشغيل داخل الموقع.</p>
                                {form.video_url && (
                                    <div className="mt-3 rounded-xl overflow-hidden border">
                                        {/youtube\\.com|youtu\\.be|vimeo\\.com/.test(form.video_url) ? (
                                            <iframe
                                                src={form.video_url}
                                                className="w-full aspect-video"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title="preview"
                                            />
                                        ) : (
                                            <video
                                                src={form.video_url}
                                                className="w-full aspect-video object-cover"
                                                controls
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    عنوان الريل *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="عروض اليوم الخاصة..."
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Thumbnail URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    صورة مصغرة (Thumbnail) *
                                </label>
                                <input
                                    type="url"
                                    value={form.thumbnail_url}
                                    onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {form.thumbnail_url && (
                                    <div className="mt-2 w-24 aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                                        <img 
                                            src={form.thumbnail_url} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x355?text=Error'}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Views & Duration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        المشاهدات
                                    </label>
                                    <input
                                        type="text"
                                        value={form.views_count}
                                        onChange={(e) => setForm({ ...form, views_count: e.target.value })}
                                        placeholder="10K"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        المدة
                                    </label>
                                    <input
                                        type="text"
                                        value={form.duration}
                                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                        placeholder="0:30"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Display Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ترتيب العرض
                                </label>
                                <input
                                    type="number"
                                    value={form.display_order}
                                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">
                                    نشط (يظهر في الموقع)
                                </label>
                            </div>

                            {/* Push Notification Toggle */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="send_push_reel"
                                    checked={sendPush}
                                    onChange={(e) => setSendPush(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="send_push_reel" className="text-sm text-gray-700 flex items-center gap-1">
                                    <Bell size={16} />
                                    إرسال إشعار عند الحفظ
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            {editing ? 'تحديث' : 'إضافة'}
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

export default FacebookReelsManager;
