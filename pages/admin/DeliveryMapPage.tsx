import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MapPin, ArrowLeft, Navigation, Truck, Package, Phone, Clock,
    WifiOff, RefreshCw, Radio, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface DriverLocation {
    driverId: number;
    lat: number;
    lng: number;
    timestamp: number;
    orderId?: number;
    driverName?: string;
    driverPhone?: string;
}

interface Branch {
    id: number;
    name: string;
    address: string;
    location_lat: number;
    location_lng: number;
    phone: string;
}

const secondsAgo = (ts: number) => Math.floor((Date.now() - ts) / 1000);
const timeLabel = (ts: number) => {
    const s = secondsAgo(ts);
    if (s < 60) return `\u0645\u0646\u0630 ${s} \u062b`;
    if (s < 3600) return `\u0645\u0646\u0630 ${Math.floor(s / 60)} \u062f`;
    return `\u0645\u0646\u0630 ${Math.floor(s / 3600)} \u0633`;
};
const isStale = (ts: number) => secondsAgo(ts) > 60;

const AdminDeliveryMapPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<Map<number, any>>(new Map());
    const branchMarkersRef = useRef<any[]>([]);
    const [leafletReady, setLeafletReady] = useState(false);
    const [driverLocations, setDriverLocations] = useState<Map<number, DriverLocation>>(new Map());
    const [branches, setBranches] = useState<Branch[]>([]);
    const [connected, setConnected] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        if ((window as any).L) { setLeafletReady(true); return; }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.crossOrigin = '';
        document.head.appendChild(link);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.crossOrigin = '';
        script.onload = () => setLeafletReady(true);
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (!leafletReady || !mapContainerRef.current || mapRef.current) return;
        const L = (window as any).L;
        const map = L.map(mapContainerRef.current, { center: [30.0444, 31.2357], zoom: 12 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);
        mapRef.current = map;
    }, [leafletReady]);

    useEffect(() => {
        if (!mapRef.current || !leafletReady || branches.length === 0) return;
        const L = (window as any).L;
        branchMarkersRef.current.forEach(m => m.remove());
        branchMarkersRef.current = [];
        branches.forEach(branch => {
            if (!branch.location_lat || !branch.location_lng) return;
            const icon = L.divIcon({
                className: '',
                html: `<div style="background:#1d4ed8;color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white">\u{1F3EA} ${branch.name}</div>`,
                iconAnchor: [0, 0],
            });
            const marker = L.marker([branch.location_lat, branch.location_lng], { icon })
                .addTo(mapRef.current)
                .bindPopup(`<b>${branch.name}</b><br>${branch.address}`);
            branchMarkersRef.current.push(marker);
        });
    }, [leafletReady, branches]);

    useEffect(() => {
        const fetch = async () => {
            try { const res = await api.get('/admin/delivery-map'); setBranches(res.data?.branches || []); } catch {}
        };
        fetch();
    }, []);

    useEffect(() => {
        socketService.connect();
        const tryJoin = () => { setConnected(true); if (user?.id) socketService.joinAsAdmin(user.id); };
        if (socketService.isConnected()) tryJoin();
        socketService.on('connect', tryJoin);
        socketService.on('driver:location:update', (data: DriverLocation) => {
            const loc = { ...data, timestamp: data.timestamp || Date.now() };
            setDriverLocations(prev => { const n = new Map(prev); n.set(loc.driverId, loc); return n; });
            updateDriverMarker(loc);
        });
        socketService.on('drivers:all:locations', (locations: DriverLocation[]) => {
            const m = new Map<number, DriverLocation>();
            locations.forEach(loc => { const l = { ...loc, timestamp: loc.timestamp || Date.now() }; m.set(l.driverId, l); updateDriverMarker(l); });
            setDriverLocations(m);
        });
        socketService.on('driver:disconnected', (data: { driverId: number }) => {
            setDriverLocations(prev => { const n = new Map(prev); n.delete(data.driverId); return n; });
            removeDriverMarker(data.driverId);
        });
        return () => {
            socketService.off('connect', tryJoin);
            socketService.off('driver:location:update');
            socketService.off('drivers:all:locations');
            socketService.off('driver:disconnected');
        };
    }, [user?.id]);

    useEffect(() => {
        const t = setInterval(() => forceUpdate(n => n + 1), 10000);
        return () => clearInterval(t);
    }, []);

    const updateDriverMarker = useCallback((data: DriverLocation) => {
        if (!mapRef.current) return;
        const L = (window as any).L;
        if (!L) return;
        const name = data.driverName || `\u0633\u0627\u0626\u0642 ${data.driverId}`;
        const makeIcon = () => L.divIcon({
            className: '',
            html: `<div style="background:#4f46e5;color:white;padding:5px 10px;border-radius:20px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.35);border:2px solid white">\u{1F697} ${name}</div>`,
            iconAnchor: [0, 20],
        });
        if (markersRef.current.has(data.driverId)) {
            markersRef.current.get(data.driverId).setLatLng([data.lat, data.lng]);
        } else {
            const marker = L.marker([data.lat, data.lng], { icon: makeIcon() }).addTo(mapRef.current).bindPopup(`<b>${name}</b>`);
            markersRef.current.set(data.driverId, marker);
        }
    }, []);

    const removeDriverMarker = useCallback((driverId: number) => {
        const m = markersRef.current.get(driverId);
        if (m) { m.remove(); markersRef.current.delete(driverId); }
    }, []);

    const flyToDriver = (driverId: number) => {
        const loc = driverLocations.get(driverId);
        if (!loc || !mapRef.current) return;
        mapRef.current.flyTo([loc.lat, loc.lng], 16, { animate: true, duration: 1 });
        markersRef.current.get(driverId)?.openPopup();
        setSelectedDriverId(driverId);
    };

    const fitAllDrivers = () => {
        if (!mapRef.current || driverLocations.size === 0) return;
        const L = (window as any).L;
        if (!L) return;
        const coords = Array.from(driverLocations.values()).map(l => [l.lat, l.lng]);
        mapRef.current.fitBounds((L as any).latLngBounds(coords), { padding: [60, 60] });
    };

    const driversArray = Array.from(driverLocations.values());

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={22} /></button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">🗺️ تتبع السائقين - مباشر</h1>
                            <p className="text-xs text-gray-500">Real-time Live Driver Tracking</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {connected ? <><Radio size={12} className="animate-pulse" /> \u0645\u062a\u0635\u0644</> : <><WifiOff size={12} /> \u063a\u064a\u0631 \u0645\u062a\u0635\u0644</>}
                        </div>
                        {driversArray.length > 0 && (
                            <button onClick={fitAllDrivers} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                                <Navigation size={14} /> \u0639\u0631\u0636 \u0627\u0644\u0643\u0644
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border-b px-4 py-2 max-w-7xl mx-auto w-full flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="font-bold text-indigo-700">{driversArray.length}</span>
                    <span className="text-gray-500">\u0633\u0627\u0626\u0642 \u0646\u0634\u0637</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="font-bold text-blue-700">{branches.length}</span>
                    <span className="text-gray-500">\u0641\u0631\u0639</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Clock size={12} /> \u064a\u062a\u062c\u062f\u062f \u0644\u062d\u0638\u064a\u0627\u064b \u0639\u0628\u0631 WebSocket
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
                <div className="lg:w-80 xl:w-96 bg-white border-r flex flex-col order-2 lg:order-1" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <Truck size={18} className="text-indigo-600" />
                            \u0627\u0644\u0633\u0627\u0626\u0642\u0648\u0646 \u0627\u0644\u0646\u0634\u0637\u0648\u0646
                            {driversArray.length > 0 && <span className="mr-auto bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{driversArray.length}</span>}
                        </h2>
                    </div>
                    <div className="flex-1 divide-y divide-gray-100">
                        {driversArray.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 px-6 text-center">
                                <Truck size={48} className="mb-3 opacity-30" />
                                <p className="font-medium text-gray-600">\u0644\u0627 \u064a\u0648\u062c\u062f \u0633\u0627\u0626\u0642\u0648\u0646 \u0645\u062a\u0635\u0644\u0648\u0646 \u0627\u0644\u0622\u0646</p>
                                <p className="text-xs mt-2">\u064a\u062c\u0628 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0626\u0642 \u0641\u062a\u062d \u0635\u0641\u062d\u062a\u0647 \u0648\u062a\u0641\u0639\u064a\u0644 GPS \u062d\u062a\u0649 \u064a\u0638\u0647\u0631 \u0647\u0646\u0627</p>
                            </div>
                        ) : driversArray.map(loc => {
                            const stale = isStale(loc.timestamp);
                            const isSel = selectedDriverId === loc.driverId;
                            return (
                                <button key={loc.driverId} onClick={() => flyToDriver(loc.driverId)}
                                    className={`w-full text-right p-4 hover:bg-indigo-50 transition-colors ${isSel ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${stale ? 'bg-yellow-400' : 'bg-green-500 animate-pulse'}`} />
                                                <span className="font-bold text-gray-900 truncate">{loc.driverName || `\u0633\u0627\u0626\u0642 ${loc.driverId}`}</span>
                                            </div>
                                            {loc.driverPhone && <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Phone size={11}/><span dir="ltr">{loc.driverPhone}</span></div>}
                                            {loc.orderId && <div className="flex items-center gap-1.5 text-xs text-indigo-600 mb-1"><Package size={11}/><span>\u064a\u0648\u0635\u0651\u0644 \u0637\u0644\u0628 #{loc.orderId}</span></div>}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400"><MapPin size={11}/><span dir="ltr">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</span></div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stale ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {stale ? '\u26a0 \u0628\u0637\u064a\u0621' : '\u25cf \u0645\u0628\u0627\u0634\u0631'}
                                            </span>
                                            <span className="text-xs text-gray-400">{timeLabel(loc.timestamp)}</span>
                                            <a href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} target="_blank" rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()} className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
                                                <Navigation size={10}/> Google Maps
                                            </a>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 space-y-1.5">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> \u0633\u0627\u0626\u0642 (\u062a\u062d\u062f\u064a\u062b &lt; 1 \u062f\u0642\u064a\u0642\u0629)</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> \u062a\u062d\u062f\u064a\u062b \u0628\u0637\u064a\u0621 (&gt; 1 \u062f\u0642\u064a\u0642\u0629)</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> \u0641\u0631\u0639</div>
                    </div>
                </div>

                <div className="flex-1 order-1 lg:order-2 relative" style={{ minHeight: '60vh' }}>
                    <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '60vh' }} />
                    {!leafletReady && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                            <div className="text-center">
                                <RefreshCw size={32} className="animate-spin text-indigo-600 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u062e\u0631\u064a\u0637\u0629\u2026</p>
                            </div>
                        </div>
                    )}
                    {leafletReady && driversArray.length === 0 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-white shadow-lg rounded-2xl px-6 py-3 flex items-center gap-3 text-sm text-gray-600 border border-gray-200">
                            <AlertCircle size={18} className="text-yellow-500" />
                            <span>\u0641\u064a \u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u062a\u0635\u0627\u0644 \u0627\u0644\u0633\u0627\u0626\u0642\u064a\u0646\u2026</span>
                        </div>
                    )}
                    {!connected && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-red-600 text-white text-sm px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
                            <WifiOff size={16} /> \u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u0633\u064a\u0631\u0641\u0631
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDeliveryMapPage;
