import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Clock, Link as LinkIcon, Image, Video, Save, X, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface Story {
    id: number;
    user_id?: number;
    title: string;
    media_url: string;
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

const StoriesManager: React.FC = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStory, setEditingStory] = useState<Story | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        media_url: '',
        media_type: 'image' as 'image' | 'video',
        duration: 5,
        link_url: '',
        link_text: '',
        expires_in_hours: 24,
        priority: 0
    });
    const [saving, setSaving] = useState(false);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const response = await api.stories.getAllAdmin();
            setStories(Array.isArray(response) ? response : response?.data || []);
        } catch (error) {
            console.error('Failed to fetch stories:', error);
            // Mock data for development
            setStories([
                {
                    id: 1,
                    title: 'عروض اليوم! 🔥',
                    media_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
                    media_type: 'image',
                    duration: 5,
                    link_url: '/deals',
                    link_text: 'شاهد العروض',
                    views_count: 1250,
                    is_active: true,
                    priority: 10,
                    expires_at: new Date(Date.now() + 86400000).toISOString(),
                    created_at: new Date().toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingStory) {
                await api.stories.update(editingStory.id, formData);
            } else {
                await api.stories.create(formData);
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

    const openEditModal = (story: Story) => {
        setEditingStory(story);
        setFormData({
            title: story.title,
            media_url: story.media_url,
            media_type: story.media_type,
            duration: story.duration,
            link_url: story.link_url || '',
            link_text: story.link_text || '',
            expires_in_hours: 24,
            priority: story.priority
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingStory(null);
        setFormData({
            title: '',
            media_url: '',
            media_type: 'image',
            duration: 5,
            link_url: '',
            link_text: '',
            expires_in_hours: 24,
            priority: 0
        });
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
                                {story.media_type === 'video' ? (
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

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                    placeholder="عروض اليوم! 🔥"
                                    required
                                />
                            </div>

                            {/* Media URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رابط الوسائط *</label>
                                <input
                                    type="url"
                                    value={formData.media_url}
                                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                    required
                                />
                                {formData.media_url && (
                                    <div className="mt-2 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        <img 
                                            src={formData.media_url} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Media Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الوسائط</label>
                                <div className="flex gap-3">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                                        formData.media_type === 'image' ? 'border-[#F97316] bg-orange-50' : 'hover:bg-gray-50'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="media_type"
                                            value="image"
                                            checked={formData.media_type === 'image'}
                                            onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'image' })}
                                            className="sr-only"
                                        />
                                        <Image className="w-5 h-5" />
                                        صورة
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                                        formData.media_type === 'video' ? 'border-[#F97316] bg-orange-50' : 'hover:bg-gray-50'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="media_type"
                                            value="video"
                                            checked={formData.media_type === 'video'}
                                            onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'video' })}
                                            className="sr-only"
                                        />
                                        <Video className="w-5 h-5" />
                                        فيديو
                                    </label>
                                </div>
                            </div>

                            {/* Duration & Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">المدة (ثواني)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 5 })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                        min="3"
                                        max="30"
                                    />
                                </div>
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
                            </div>

                            {/* Expires In */}
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

                            {/* Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رابط الزر (اختياري)</label>
                                <input
                                    type="text"
                                    value={formData.link_url}
                                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                    placeholder="/deals أو https://..."
                                />
                            </div>

                            {formData.link_url && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نص الزر</label>
                                    <input
                                        type="text"
                                        value={formData.link_text}
                                        onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                                        placeholder="شاهد العروض"
                                    />
                                </div>
                            )}

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
