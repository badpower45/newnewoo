import React, { useEffect, useRef, useState } from 'react';
import { X, ScanLine, CheckCircle2, AlertCircle, Keyboard, ArrowLeft } from 'lucide-react';

// Lazy load html5-qrcode to reduce initial bundle size
let Html5Qrcode: any;
let Html5QrcodeSupportedFormats: any;

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [scannedCode, setScannedCode] = useState<string>('');
    const [manualInput, setManualInput] = useState('');
    const [useManualMode, setUseManualMode] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const readerIdRef = useRef('barcode-reader');

    useEffect(() => {
        if (!useManualMode) {
            startScanner();
        }
        return () => {
            stopScanner();
        };
    }, [useManualMode]);

    const startScanner = async () => {
        try {
            setError('');
            setSuccess(false);
            setScannedCode('');
            
            // Lazy load html5-qrcode only when scanner is opened
            if (!Html5Qrcode) {
                const module = await import('html5-qrcode');
                Html5Qrcode = module.Html5Qrcode;
                Html5QrcodeSupportedFormats = module.Html5QrcodeSupportedFormats;
            }
            
            const html5QrCode = new Html5Qrcode(readerIdRef.current);
            scannerRef.current = html5QrCode;

            // Enhanced configuration for better barcode scanning
            const config = {
                fps: 30, // Increased FPS for smoother scanning
                qrbox: { width: 300, height: 200 }, // Larger scanning area for barcodes
                aspectRatio: 1.5, // Better aspect ratio for barcodes
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.QR_CODE,
                ],
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true // Use native barcode detector if available
                }
            };

            await html5QrCode.start(
                { facingMode: 'environment' }, // Use back camera
                config,
                (decodedText) => {
                    // Success callback - barcode detected
                    console.log('✅ Barcode scanned:', decodedText);
                    setScannedCode(decodedText);
                    setSuccess(true);
                    stopScanner();
                    // Quick feedback then callback
                    setTimeout(() => {
                        onScan(decodedText);
                    }, 500);
                },
                (errorMessage) => {
                    // Error during scanning (ignore - normal)
                }
            );
            setScanning(true);
        } catch (err: any) {
            console.error('Scanner error:', err);
            if (err.name === 'NotAllowedError') {
                setError('❌ يرجى السماح بالوصول إلى الكاميرا من إعدادات المتصفح');
            } else if (err.name === 'NotFoundError') {
                setError('❌ لم يتم العثور على كاميرا. جرب الإدخال اليدوي');
            } else if (err.name === 'NotReadableError') {
                setError('❌ الكاميرا قيد الاستخدام بواسطة تطبيق آخر');
            } else {
                setError('❌ حدث خطأ في تشغيل الكاميرا. جرب الإدخال اليدوي');
            }
            // Auto-switch to manual mode on camera error
            setTimeout(() => {
                setUseManualMode(true);
            }, 2000);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && scanning) {
            try {
                await scannerRef.current.stop();
                console.log('✅ Scanner stopped successfully');
            } catch (err) {
                // Ignore errors if scanner is already stopped
                console.log('🔴 Scanner stop ignored:', err);
            } finally {
                scannerRef.current = null;
                setScanning(false);
            }
        }
    };

    const handleClose = () => {
        stopScanner();
        onClose();
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput.trim()) {
            setScannedCode(manualInput.trim());
            setSuccess(true);
            // Call onScan immediately for manual input
            setTimeout(() => {
                onScan(manualInput.trim());
            }, 300); // Reduced delay
        }
    };

    const toggleMode = () => {
        if (!useManualMode) {
            stopScanner();
        }
        setUseManualMode(!useManualMode);
        setError('');
        setSuccess(false);
        setScannedCode('');
        setManualInput('');
    };

    return (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center px-3">
            <div className="relative w-full max-w-lg h-auto md:h-auto max-h-[85vh] rounded-[32px] overflow-hidden">
                {/* Header Bar */}
                <div className="absolute top-4 left-4 right-4 z-30">
                    <div className="relative bg-white text-gray-900 rounded-2xl shadow-xl px-4 py-3 flex items-center justify-center">
                        <button
                            onClick={handleClose}
                            className="absolute right-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            aria-label="إغلاق"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <span className="text-lg font-bold">Scan Barcode</span>
                    </div>
                </div>

                <div className="pt-20 pb-6 px-3 sm:px-4 flex flex-col items-center gap-3">
                    {/* Camera / Manual Input */}
                    {useManualMode ? (
                        <form onSubmit={handleManualSubmit} className="w-full max-w-sm bg-white/95 rounded-2xl p-3 shadow-lg space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">
                                أدخل رقم الباركود
                            </label>
                            <input
                                type="text"
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                placeholder="مثال: 6223000236703"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-lg font-mono"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!manualInput.trim()}
                                className="w-full px-4 py-3 bg-brand-orange hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                بحث عن المنتج
                            </button>
                        </form>
                    ) : (
                        <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)] bg-black/80" style={{ height: '280px' }}>
                            <div
                                id={readerIdRef.current}
                                className="absolute inset-0 w-full h-full"
                                style={{ minHeight: '280px' }}
                            />

                            {/* Single mask with clear center rectangle */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div
                                    className="relative"
                                    style={{
                                        width: '85%',
                                        maxWidth: 340,
                                        height: 200,
                                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
                                        borderRadius: 18
                                    }}
                                >
                                    <span className="absolute -top-1.5 -left-1.5 w-12 h-12 border-t-3 border-l-3 border-white rounded-lg"></span>
                                    <span className="absolute -top-1.5 -right-1.5 w-12 h-12 border-t-3 border-r-3 border-white rounded-lg"></span>
                                    <span className="absolute -bottom-1.5 -left-1.5 w-12 h-12 border-b-3 border-l-3 border-white rounded-lg"></span>
                                    <span className="absolute -bottom-1.5 -right-1.5 w-12 h-12 border-b-3 border-r-3 border-white rounded-lg"></span>
                                </div>
                            </div>

                            {scanning && (
                                <div className="absolute bottom-4 inset-x-0 flex justify-center">
                                    <div className="inline-flex items-center gap-2 text-white bg-black/60 px-4 py-2 rounded-full border border-white/20">
                                        <div className="flex gap-1">
                                            <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
                                            <div className="animate-pulse w-2 h-2 bg-white rounded-full" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="animate-pulse w-2 h-2 bg-white rounded-full" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                        <span className="font-medium text-sm">جارٍ البحث عن الباركود...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status Blocks */}
                    {error && (
                        <div className="w-full max-w-sm bg-red-50 border border-red-200 rounded-xl p-2 flex items-start gap-2 shadow-sm">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                            <div>
                                <p className="font-semibold text-red-700">خطأ</p>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && scannedCode && (
                        <div className="w-full max-w-sm bg-green-50 border border-green-200 rounded-xl p-2 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="text-green-600" size={18} />
                                <p className="text-green-700 font-semibold">تم المسح بنجاح!</p>
                            </div>
                            <p className="text-sm text-gray-600">كود الباركود:</p>
                            <p className="text-lg font-mono font-bold text-gray-900 break-all">{scannedCode}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="w-full max-w-sm grid grid-cols-2 gap-2 mt-2">
                        <button
                            onClick={handleClose}
                            className="px-4 py-3 bg-white/90 text-gray-800 font-bold rounded-xl border border-gray-200 hover:bg-white transition-colors flex items-center justify-center gap-2"
                        >
                            <X size={18} />
                            إغلاق
                        </button>
                        <button
                            onClick={toggleMode}
                            className="px-4 py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                            {useManualMode ? (
                                <>
                                    <ScanLine size={18} />
                                    عودة للكاميرا
                                </>
                            ) : (
                                <>
                                    <Keyboard size={18} />
                                    إدخال يدوي
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
