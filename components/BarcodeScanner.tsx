import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [scannedCode, setScannedCode] = useState<string>('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const readerIdRef = useRef('barcode-reader');

    useEffect(() => {
        startScanner();
        return () => {
            stopScanner();
        };
    }, []);

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

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch((err) => {
                console.error('Error stopping scanner:', err);
            });
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const handleClose = () => {
        stopScanner();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-brand-orange to-orange-600 p-6 text-white relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Camera size={28} />
                        <h2 className="text-2xl font-bold">مسح الباركود</h2>
                    </div>
                    <p className="mt-2 text-white/90">وجّه الكاميرا نحو الباركود</p>
                </div>

                <div className="p-6">
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
