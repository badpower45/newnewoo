import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from './BarcodeScanner';

interface ProductsTopBarProps {
    onScan?: () => void;
}

const ProductsTopBar: React.FC<ProductsTopBarProps> = ({ onScan }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const navigate = useNavigate();

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'ar-EG';
            recognitionInstance.maxAlternatives = 1;
            
            recognitionInstance.onstart = () => {
                setIsListening(true);
                console.log('🎤 Voice recognition started');
            };
            
            recognitionInstance.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                console.log('🎤 Voice input:', transcript);
                setSearchQuery(transcript);
                
                if (event.results[0].isFinal && transcript.trim()) {
                    setIsListening(false);
                    navigate(`/products?search=${encodeURIComponent(transcript.trim())}`);
                }
            };
            
            recognitionInstance.onerror = (event: any) => {
                console.error('🎤 Speech recognition error:', event.error);
                setIsListening(false);
                
                if (event.error === 'no-speech') {
                    alert('لم يتم اكتشاف صوت');
                } else if (event.error === 'not-allowed') {
                    alert('يرجى السماح بالوصول للميكروفون');
                } else if (event.error === 'network') {
                    alert('خطأ في الاتصال');
                }
            };
            
            recognitionInstance.onend = () => {
                setIsListening(false);
                console.log('🎤 Voice recognition ended');
            };
            
            setRecognition(recognitionInstance);
        }
    }, [navigate]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleVoiceSearch = () => {
        if (!recognition) {
            alert('البحث الصوتي غير مدعوم');
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

    const handleScanClick = () => {
        if (onScan) {
            onScan();
        } else {
            setShowScanner(true);
        }
    };

    return (
        <>
            <div className="bg-white sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isListening ? 'جاري الاستماع...' : 'ابحث عن المنتجات...'}
                                className="w-full bg-transparent outline-none text-sm text-gray-900"
                            />
                            
                            {/* Voice Search Button */}
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
                                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                            </button>
                        </form>

                        {/* Barcode Scanner Button - Hidden on Mobile */}
                        <button
                            onClick={handleScanClick}
                            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                        >
                            <Scan size={18} />
                            <span className="text-sm font-medium">مسح الباركود</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Barcode Scanner Modal */}
            {showScanner && (
                <BarcodeScanner 
                    onClose={() => setShowScanner(false)} 
                    onScan={(code) => {
                        console.log('Scanned:', code);
                        setSearchQuery(code);
                        navigate(`/products?search=${encodeURIComponent(code)}`);
                        setShowScanner(false);
                    }}
                />
            )}
        </>
    );
};

export default ProductsTopBar;
