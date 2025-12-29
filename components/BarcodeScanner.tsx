import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, ScanLine, CheckCircle2, AlertCircle, Keyboard } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-6">
            <div 
                className="bg-white w-full h-full max-w-lg md:max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col md:h-auto md:max-h-[92vh]"
                style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="bg-gradient-to-r from-brand-orange to-orange-600 p-4 md:p-6 text-white relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-xl transition-colors z-10"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <ScanLine size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold">مسح الباركود</h2>
                            <p className="text-sm text-white/90">اكتشف المنتجات بسرعة</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                    {/* Mode Toggle */}
                    <div className="mb-4 flex gap-2">
                        <button
                            onClick={toggleMode}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                !useManualMode 
                                    ? 'bg-brand-orange text-white shadow-lg' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <ScanLine size={20} />
                            <span>مسح ضوئي</span>
                        </button>
                        <button
                            onClick={toggleMode}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                useManualMode 
                                    ? 'bg-brand-orange text-white shadow-lg' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Keyboard size={20} />
                            <span>إدخال يدوي</span>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 rtl:space-x-reverse">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div className="text-red-700">
                                <p className="font-medium">خطأ</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && scannedCode && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                                <CheckCircle2 className="text-green-500" size={20} />
                                <p className="text-green-700 font-medium">تم المسح بنجاح!</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-green-300">
                                <p className="text-xs text-gray-500 mb-1">كود الباركود:</p>
                                <p className="text-lg font-mono font-bold text-gray-900 break-all">{scannedCode}</p>
                            </div>
                        </div>
                    )}

                    {useManualMode ? (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    أدخل رقم الباركود
                                </label>
                                <input
                                    type="text"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    placeholder="مثال: 6223000236703"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-lg font-mono"
                                    autoFocus
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    💡 أدخل الرقم الموجود أسفل الباركود
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={!manualInput.trim()}
                                className="w-full px-6 py-3 bg-brand-orange hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                            >
                                بحث عن المنتج
                            </button>
                        </form>
                    ) : (
                        <>
                            <div className="flex justify-center mb-4">
                                <div
                                    id={readerIdRef.current}
                                    className="rounded-2xl overflow-hidden bg-black w-full aspect-video border-4 border-brand-orange/30 shadow-2xl"
                                    style={{ minHeight: '280px', maxWidth: '400px' }}
                                />
                            </div>

                            {/* Scanning Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <ScanLine className="text-blue-600" size={20} />
                                    نصائح للمسح الناجح:
                                </h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>✓ اقترب من الباركود على بعد 10-20 سم</li>
                                    <li>✓ تأكد من الإضاءة الجيدة</li>
                                    <li>✓ ثبت الهاتف لمدة ثانية</li>
                                    <li>✓ تأكد من وضوح الباركود</li>
                                </ul>
                            </div>

                            {scanning && (
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 text-gray-700 bg-white px-4 py-2 rounded-full border border-gray-200">
                                        <div className="flex gap-1">
                                            <div className="animate-pulse w-2 h-2 bg-brand-orange rounded-full"></div>
                                            <div className="animate-pulse w-2 h-2 bg-brand-orange rounded-full" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="animate-pulse w-2 h-2 bg-brand-orange rounded-full" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                        <span className="font-medium">جارٍ البحث عن الباركود...</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors border border-gray-300"
                        >
                            إلغاء
                        </button>
                        {!useManualMode && !success && (
                            <button
                                onClick={() => setUseManualMode(true)}
                                className="flex-1 px-6 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-lg"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Keyboard size={20} />
                                    إدخال يدوي
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
