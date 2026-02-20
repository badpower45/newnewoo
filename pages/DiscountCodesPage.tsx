import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Tag, Copy, CheckCircle, Clock, Percent, Gift, RefreshCw, Flame, Users, X } from 'lucide-react';
import { api } from '../services/api';
import Footer from '../components/Footer';

interface Coupon {
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    max_discount: number | null;
    valid_until: string | null;
    usage_limit: number | null;
    used_count: number;
}

// ─── Scratch Card Popup ──────────────────────────────────────────────────────
const ScratchModal = ({
    code,
    onClose,
    onRevealed,
}: {
    code: string;
    onClose: () => void;
    onRevealed: (code: string) => void;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        // Draw scratch surface
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#78716C');
        grad.addColorStop(0.5, '#44403C');
        grad.addColorStop(1, '#78716C');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Diagonal texture lines
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        for (let i = -h; i < w + h; i += 13) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + h, h);
            ctx.stroke();
        }

        // Center label
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.round(w * 0.072)}px sans-serif`;
        ctx.fillText('🎟️ اخربش هنا', w / 2, h / 2 - 13);
        ctx.font = `${Math.round(w * 0.042)}px sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.70)';
        ctx.fillText('حرّك إصبعك لكشف كود الخصم', w / 2, h / 2 + 14);
    }, []);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            if (e.touches.length === 0) return null;
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    };

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas || revealed) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 46;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (lastPos.current) {
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        ctx.arc(x, y, 23, 0, Math.PI * 2);
        ctx.fill();
        lastPos.current = { x, y };

        // Check % revealed
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparent = 0;
        for (let i = 3; i < img.data.length; i += 4) {
            if (img.data[i] === 0) transparent++;
        }
        if ((transparent / (img.data.length / 4)) * 100 > 45) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setRevealed(true);
            onRevealed(code);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[320px] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
                    <span className="text-white font-bold text-sm">🎟️ كشف كود الخصم</span>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="p-5">
                    {/* Scratch area */}
                    <div className="relative rounded-xl overflow-hidden mb-4" style={{ height: 110 }}>
                        {/* Code underneath */}
                        <div className="absolute inset-0 bg-orange-50 border-2 border-dashed border-orange-200 flex flex-col items-center justify-center">
                            <p className="text-[10px] text-orange-400 font-medium mb-1">كود الخصم</p>
                            <p className="text-xl font-black text-gray-900 font-mono tracking-[0.15em] px-3 text-center break-all">
                                {code}
                            </p>
                        </div>
                        {/* Canvas scratch overlay */}
                        {!revealed && (
                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full"
                                style={{ touchAction: 'none', cursor: 'crosshair' }}
                                onMouseDown={(e) => { isDrawing.current = true; lastPos.current = null; const p = getPos(e); if (p) scratch(p.x, p.y); }}
                                onMouseMove={(e) => { if (!isDrawing.current) return; const p = getPos(e); if (p) scratch(p.x, p.y); }}
                                onMouseUp={() => { isDrawing.current = false; lastPos.current = null; }}
                                onMouseLeave={() => { isDrawing.current = false; lastPos.current = null; }}
                                onTouchStart={(e) => { e.preventDefault(); isDrawing.current = true; lastPos.current = null; const p = getPos(e); if (p) scratch(p.x, p.y); }}
                                onTouchMove={(e) => { e.preventDefault(); const p = getPos(e); if (p) scratch(p.x, p.y); }}
                                onTouchEnd={() => { isDrawing.current = false; lastPos.current = null; }}
                            />
                        )}
                    </div>

                    {!revealed ? (
                        <p className="text-center text-sm text-gray-400">👆 اسحب إصبعك على المربع لكشف الكود</p>
                    ) : (
                        <button
                            onClick={handleCopy}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                                copied
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                        >
                            {copied ? (
                                <><CheckCircle size={18} /><span>تم النسخ! ✓</span></>
                            ) : (
                                <><Copy size={18} /><span>نسخ الكود</span></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
// ────────────────────────────────────────────────────────────────────────────

const DiscountCodesPage = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [scratchModalCode, setScratchModalCode] = useState<string | null>(null);
    const [revealedCodes, setRevealedCodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.coupons.getAvailable();
            setCoupons(res.data || []);
        } catch (error) {
            console.error('Error loading coupons:', error);
        }
        setLoading(false);
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getDaysRemaining = (validUntil: string | null) => {
        if (!validUntil) return null;
        const now = new Date();
        const end = new Date(validUntil);
        return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getRemaining = (coupon: Coupon) => {
        if (coupon.usage_limit === null) return null;
        return coupon.usage_limit - coupon.used_count;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
            {/* Scratch modal */}
            {scratchModalCode && (
                <ScratchModal
                    code={scratchModalCode}
                    onClose={() => setScratchModalCode(null)}
                    onRevealed={(code) => {
                        setRevealedCodes(prev => new Set(prev).add(code));
                    }}
                />
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                    >
                        <ArrowRight size={20} />
                    </button>
                    <h1 className="text-xl font-bold">كل أكواد الخصم</h1>
                    <div className="w-10" />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-start gap-2">
                    <Gift className="text-yellow-300 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-white/90">
                        <strong>وفّر مع أكواد الخصم!</strong> اخربش الكارت لكشف الكود واستخدمه عند إتمام الطلب
                    </p>
                </div>
            </div>

            {/* Coupons List */}
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-12">
                        <RefreshCw className="animate-spin text-gray-400 mx-auto mb-2" size={32} />
                        <p className="text-gray-500">جاري التحميل...</p>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <Tag className="text-gray-300 mx-auto mb-3" size={48} />
                        <p className="text-gray-600 font-medium mb-1">لا توجد أكواد خصم متاحة حالياً</p>
                        <p className="text-gray-400 text-sm">تابعنا لمعرفة أحدث العروض!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {coupons.map((coupon) => {
                            const daysRemaining = getDaysRemaining(coupon.valid_until);
                            const remaining = getRemaining(coupon);
                            const isCopied = copiedCode === coupon.code;
                            const isLowStock = remaining !== null && remaining <= 5;
                            const isExpiringSoon = daysRemaining !== null && daysRemaining <= 3;
                            const isRevealed = revealedCodes.has(coupon.code);

                            return (
                                <div
                                    key={coupon.code}
                                    className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-sm"
                                >
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 border-b border-dashed border-orange-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                    {coupon.discount_type === 'percentage' ? (
                                                        <Percent className="text-orange-600" size={20} />
                                                    ) : (
                                                        <Tag className="text-orange-600" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black text-orange-600 leading-tight">
                                                        {coupon.discount_type === 'percentage'
                                                            ? `${coupon.discount_value}%`
                                                            : `${coupon.discount_value} جنيه`}
                                                    </p>
                                                    <p className="text-xs text-orange-500 font-medium">
                                                        {coupon.discount_type === 'percentage' ? 'خصم نسبي' : 'خصم ثابت'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {remaining !== null && (
                                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isLowStock ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {isLowStock ? <Flame size={11} /> : <Users size={11} />}
                                                        متبقي {remaining}
                                                    </div>
                                                )}
                                                {remaining === null && (
                                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                                        <Flame size={11} />عرض محدود!
                                                    </div>
                                                )}
                                                {daysRemaining !== null && (
                                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isExpiringSoon ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        <Clock size={11} />
                                                        {daysRemaining <= 0 ? 'ينتهي اليوم' : `${daysRemaining} يوم`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {coupon.description && (
                                            <p className="text-gray-600 text-sm mt-1 leading-relaxed">{coupon.description}</p>
                                        )}
                                    </div>

                                    {/* Code area */}
                                    <div className="px-4 pt-4 pb-4 space-y-3">
                                        {isRevealed ? (
                                            <>
                                                {/* Revealed: show code box + copy button */}
                                                <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl px-4 py-3 text-center">
                                                    <p className="text-[11px] text-orange-400 mb-1">كود الخصم</p>
                                                    <p className="text-xl font-black text-gray-900 font-mono tracking-[0.15em] break-all">
                                                        {coupon.code}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(coupon.code)}
                                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                                                        isCopied
                                                            ? 'bg-green-100 text-green-700 border border-green-300'
                                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                                    }`}
                                                >
                                                    {isCopied ? (
                                                        <><CheckCircle size={18} /><span>تم النسخ! ✓</span></>
                                                    ) : (
                                                        <><Copy size={18} /><span>نسخ الكود</span></>
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            /* Hidden: tap to scratch */
                                            <button
                                                onClick={() => setScratchModalCode(coupon.code)}
                                                className="w-full rounded-xl overflow-hidden bg-gradient-to-r from-stone-500 to-stone-600 py-5 flex flex-col items-center justify-center gap-1.5 hover:opacity-90 transition active:scale-95 shadow-inner"
                                            >
                                                <span className="text-2xl">🎟️</span>
                                                <span className="text-white font-bold text-sm">اضغط لكشف الكود</span>
                                                <span className="text-white/60 text-xs">اخربش لظهور كود الخصم</span>
                                            </button>
                                        )}

                                        {/* Conditions */}
                                        {(coupon.min_order_value > 0 || coupon.max_discount || coupon.valid_until) && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {coupon.min_order_value > 0 && (
                                                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                        الحد الأدنى: {coupon.min_order_value} جنيه
                                                    </span>
                                                )}
                                                {coupon.max_discount && coupon.discount_type === 'percentage' && (
                                                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                                        أقصى خصم: {coupon.max_discount} جنيه
                                                    </span>
                                                )}
                                                {coupon.valid_until && (
                                                    <span className={`text-xs px-3 py-1 rounded-full ${isExpiringSoon ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                        حتى: {new Date(coupon.valid_until).toLocaleDateString('ar-EG')}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default DiscountCodesPage;


