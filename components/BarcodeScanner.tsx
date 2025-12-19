import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, CheckCircle2, AlertCircle, Keyboard } from 'lucide-react';

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
            const html5QrCode = new Html5Qrcode(readerIdRef.current);
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // Success callback
                    setScannedCode(decodedText);
                    setSuccess(true);
                    stopScanner();
                    setTimeout(() => {
                        onScan(decodedText);
                    }, 1500);
                },
                (errorMessage) => {
                    // Error callback (scanning in progress)
                    // Don't show these errors as they're normal during scanning
                }
            );
            setScanning(true);
        } catch (err: any) {
            console.error('Scanner error:', err);
            if (err.name === 'NotAllowedError') {
                setError('يرجى السماح بالوصول إلى الكاميرا');
            } else if (err.name === 'NotFoundError') {
                setError('لم يتم العثور على كاميرا');
            } else {
                setError('حدث خطأ في بدء المسح الضوئي');
            }
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
            setTimeout(() => {
                onScan(manualInput.trim());
            }, 1000);
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
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-0">
            <div className="bg-white w-full h-full md:rounded-2xl md:shadow-2xl md:max-w-md md:w-full md:max-h-[90vh] md:h-auto overflow-y-auto">
                <div className="bg-gradient-to-r from-brand-orange to-orange-600 p-4 md:p-6 text-white relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors z-10"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Camera size={24} className="md:w-7 md:h-7" />
                        <h2 className="text-xl md:text-2xl font-bold">مسح الباركود</h2>
                    </div>
                    <p className="mt-2 text-sm md:text-base text-white/90">وجّه الكاميرا نحو الباركود</p>
                </div>

                <div className="p-4 md:p-6">
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
                            <Camera size={20} />
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
                            <div
                                id={readerIdRef.current}
                                className="rounded-xl overflow-hidden bg-gray-100"
                                style={{ minHeight: '300px' }}
                            />

                            {scanning && (
                                <div className="mt-4 text-center">
                                    <div className="inline-flex items-center space-x-2 rtl:space-x-reverse text-gray-600">
                                        <div className="animate-pulse w-2 h-2 bg-brand-orange rounded-full"></div>
                                        <div className="animate-pulse w-2 h-2 bg-brand-orange rounded-full animation-delay-200"></div>
                                        <div className="animate-pulse w-2 h-2 bg-brand-orange rounded-full animation-delay-400"></div>
                                        <span className="mr-2 rtl:ml-2">جارٍ البحث عن الباركود...</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="mt-6 flex space-x-3 rtl:space-x-reverse">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
