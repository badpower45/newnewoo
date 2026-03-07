import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Search, ShoppingCart, User, Heart, Clock, Phone, Mic, MicOff, Barcode } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BranchSelector from './BranchSelector';
import BarcodeScanner from './BarcodeScanner';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';

const TopBar = () => {
    const { user, isAuthenticated } = useAuth();
    const { favorites } = useFavorites();
    const { totalItems } = useCart();
    const { selectedBranch } = useBranch();
    const { t, language } = useLanguage();
    const [showBranchSelector, setShowBranchSelector] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const navigate = useNavigate();

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = true; // Show interim results
            recognitionInstance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
            recognitionInstance.maxAlternatives = 1;
            
            recognitionInstance.onstart = () => {
                setIsListening(true);
                console.log('🎤 Voice recognition started');
            };
            
            recognitionInstance.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                const isFinal = event.results[0].isFinal;

                console.log(`🎤 Voice input: "${transcript}" (Final: ${isFinal})`);
                setSearchQuery(transcript);
            };
            
            recognitionInstance.onerror = (event: any) => {
                console.error('🎤 Speech recognition error:', event.error);
                setIsListening(false);
                
                // User-friendly error messages
                if (event.error === 'no-speech') {
                    alert('لم يتم اكتشاف صوت. جرب مرة أخرى.');
                } else if (event.error === 'not-allowed') {
                    alert('يرجى السماح بالوصول إلى الميكروفون');
                } else if (event.error === 'network') {
                    alert('خطأ في الشبكة. تحقق من اتصال الإنترنت.');
                } else if (event.error === 'aborted') {
                    console.log('🎤 Voice recognition aborted');
                } else {
                    console.error('🎤 Unknown error:', event.error);
                }
            };
            
            recognitionInstance.onend = () => {
                console.log('🎤 Voice recognition ended');
                setIsListening(false);
            };
            
            setRecognition(recognitionInstance);
        }
    }, [language]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            // فحص لو المدخل باركود (أرقام فقط وأكثر من 6 أرقام)
            const looksLikeBarcode = /^\d{6,}$/.test(trimmed);
            if (looksLikeBarcode) {
                navigate(`/products?barcode=${encodeURIComponent(trimmed)}`);
            } else {
                navigate(`/products?search=${encodeURIComponent(trimmed)}`);
            }
        }
    };

    const handleVoiceSearch = () => {
        if (!recognition) {
            alert(t('voice_search_not_supported'));
            return;
        }
        
        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                setIsListening(false);
            }
        }
    };

    return (
        <div className="bg-white sticky top-0 z-40 shadow-sm">
            {/* Main Header */}
            <div className="p-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Logo & Location Row (Mobile) */}
                    <div className="flex items-center justify-between w-full md:w-auto">
                        {/* Logo */}
                        <Link to="/" className="flex items-center group">
                            <img
                                src="/images/allosh-logo.png"
                                alt="علوش"
                                className="h-12 w-auto object-contain group-hover:opacity-90 transition-opacity"
                            />
                        </Link>

                        {/* Mobile Actions - Branch & User Icons */}
                        <div className="flex md:hidden items-center gap-2">
                            {/* Branch Selector - Enhanced with name */}
                            <button 
                                onClick={() => setShowBranchSelector(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border-2 border-blue-500 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
                                title="اختر الفرع"
                            >
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={18} className="text-blue-600 flex-shrink-0" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] text-blue-600 font-medium leading-none">التوصيل إلى</span>
                                        <span className="text-xs text-gray-900 font-bold leading-tight max-w-[100px] truncate">
                                            {selectedBranch?.name || 'اختر فرعك'}
                                        </span>
                                    </div>
                                </div>
                                <ChevronDown size={14} className="text-blue-600 flex-shrink-0" />
                            </button>
                            {/* User Icon */}
                            <Link to={isAuthenticated ? '/profile' : '/login'} className="p-2">
                                {isAuthenticated ? (
                                    user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover border border-primary/20"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )
                                ) : (
                                    <User size={22} className="text-gray-600" />
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="flex md:hidden items-center gap-2 w-full">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-xl flex-1 border border-gray-100 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                <Search size={16} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isListening ? t('listening') : t('search_placeholder')}
                                    className="w-full bg-transparent outline-none text-sm text-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={handleVoiceSearch}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        isListening 
                                            ? 'bg-red-500 text-white animate-pulse' 
                                            : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                                    }`}
                                    title="البحث الصوتي"
                                >
                                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                                </button>
                            </div>
                        </form>
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex-shrink-0"
                            title="مسح الباركود"
                        >
                            <Barcode size={18} />
                        </button>
                    </div>

                    {/* Desktop: Location + Search + Actions */}
                    <div className="hidden md:flex items-center gap-4 w-full">
                        {/* Branch Selector - Desktop */}
                        <button 
                            onClick={() => setShowBranchSelector(true)}
                            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white border-2 border-blue-500 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg flex-shrink-0"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <MapPin size={20} className="text-blue-600" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xs text-blue-600 font-medium leading-none">التوصيل إلى:</span>
                                    <span className="text-sm text-gray-900 font-bold leading-tight">
                                        {selectedBranch?.name || 'اختر فرعك الآن'}
                                    </span>
                                </div>
                            </div>
                            <ChevronDown size={18} className="text-blue-600" />
                        </button>
                        
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl w-full border border-gray-100 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                <Search size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isListening ? t('listening') : t('search_placeholder')}
                                    className="w-full bg-transparent outline-none text-sm text-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={handleVoiceSearch}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        isListening 
                                            ? 'bg-red-500 text-white animate-pulse' 
                                            : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                                    }`}
                                    title={t('voice_search')}
                                >
                                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                    title="مسح الباركود"
                                >
                                    <Barcode size={16} />
                                </button>
                                <button
                                    type="submit"
                                    className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
                                >
                                    بحث
                                </button>
                            </div>
                        </form>

                        {/* Desktop Actions */}
                        <div className="flex items-center gap-3">
                            <Link to="/favorites" className="relative p-2 rounded-xl hover:bg-gray-50">
                                <Heart size={22} className="text-gray-600" />
                                {favorites.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                        {favorites.length}
                                    </span>
                                )}
                            </Link>
                            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-50">
                                <ShoppingCart size={22} className="text-gray-600" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                            <Link to={isAuthenticated ? '/profile' : '/login'} className="p-2 rounded-xl hover:bg-gray-50">
                                {isAuthenticated ? (
                                    user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover border border-primary/20"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )
                                ) : (
                                    <User size={22} className="text-gray-600" />
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showBranchSelector && (
                <BranchSelector isOpen={showBranchSelector} onClose={() => setShowBranchSelector(false)} />
            )}
            
            {/* Barcode Scanner */}
            {showScanner && (
                <BarcodeScanner
                    onScan={(barcode) => {
                        setShowScanner(false);
                        navigate(`/products?barcode=${encodeURIComponent(barcode)}`);
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

export default TopBar;
