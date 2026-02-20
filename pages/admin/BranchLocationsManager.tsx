import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MapPin, Navigation, Save, Edit3, Trash2, X, RefreshCw, Check,
  AlertCircle, Info, Crosshair
} from 'lucide-react';
import { api } from '../../services/api';

interface Branch {
  id: number;
  name: string;
  name_ar?: string;
  address?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  location_lat?: number | null;
  location_lng?: number | null;
  is_active?: boolean;
}

// Access Leaflet from window (loaded via CDN)
declare global {
  interface Window { L: any; }
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

// ─── Small helper: orange numbered pin ───────────────────────────────────────
function makeNumberedIcon(L: any, num: number, active = false, editing = false) {
  const bg = editing ? '#3B82F6' : active ? '#22C55E' : '#F97316';
  return L.divIcon({
    html: `
      <div style="
        background:${bg};color:white;width:34px;height:34px;
        border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        border:2px solid white;
        box-shadow:0 3px 10px rgba(0,0,0,.35);
        ${editing ? 'animation:pulse 1.2s infinite;' : ''}
      ">
        <span style="transform:rotate(45deg);font-weight:700;font-size:13px">${num}</span>
      </div>`,
    className: '',
    iconSize:   [34, 34],
    iconAnchor: [17, 34],
    popupAnchor:[0,  -36],
  });
}

// ─── Temp (blue) draggable pin ────────────────────────────────────────────────
function makeTempIcon(L: any) {
  return L.divIcon({
    html: `
      <div style="
        background:#2563EB;color:white;width:38px;height:38px;
        border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;
        box-shadow:0 4px 14px rgba(37,99,235,.55);
      ">
        <svg style="transform:rotate(45deg)" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
        </svg>
      </div>`,
    className: '',
    iconSize:   [38, 38],
    iconAnchor: [19, 38],
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
const BranchLocationsManager: React.FC = () => {
  const [branches,      setBranches]      = useState<Branch[]>([]);
  const [loading,       setLoading]        = useState(true);
  const [leafletReady,  setLeafletReady]   = useState(false);
  const [editingId,     setEditingId]      = useState<number | null>(null);
  const [tempCoords,    setTempCoords]     = useState<{ lat: number; lng: number } | null>(null);
  const [saving,        setSaving]         = useState(false);
  const [toast,         setToast]          = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [mapLoading,    setMapLoading]     = useState(true);

  const mapRef         = useRef<any>(null);
  const mapContainerRef= useRef<HTMLDivElement>(null);
  const markersRef     = useRef<Map<number, any>>(new Map());
  const tempMarkerRef  = useRef<any>(null);
  const clickHandlerRef= useRef<any>(null);

  // ── Load Leaflet from CDN ──────────────────────────────────────────────────
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }

    const cssId = 'leaflet-css-branch-mgr';
    const jsId  = 'leaflet-js-branch-mgr';

    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = LEAFLET_CSS;
      link.id   = cssId;
      document.head.appendChild(link);
    }

    if (!document.getElementById(jsId)) {
      const script    = document.createElement('script');
      script.src      = LEAFLET_JS;
      script.id       = jsId;
      script.onload   = () => setLeafletReady(true);
      script.onerror  = () => console.error('Failed to load Leaflet');
      document.head.appendChild(script);
    } else {
      // Script tag exists but may already be loaded
      if (window.L) setLeafletReady(true);
      else {
        const existing = document.getElementById(jsId) as HTMLScriptElement;
        existing.onload = () => setLeafletReady(true);
      }
    }
  }, []);

  // ── Load branches ──────────────────────────────────────────────────────────
  const loadBranches = async () => {
    setLoading(true);
    try {
      const res  = await api.branches.getAll();
      const list = Array.isArray((res as any)?.data ?? res)
        ? ((res as any).data ?? res)
        : [];
      setBranches(list);
    } catch (e) {
      console.error('Failed to load branches', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBranches(); }, []);

  // ── Init map ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapRef.current) return;

    const L   = window.L;
    const map = L.map(mapContainerRef.current, {
      center:      [30.0444, 31.2357], // Cairo default
      zoom:        10,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.whenReady(() => {
      setMapLoading(false);
      setTimeout(() => map.invalidateSize(), 100);
    });

    // Extra invalidateSize calls to handle layout shifts
    setTimeout(() => map.invalidateSize(), 300);
    setTimeout(() => map.invalidateSize(), 800);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletReady]);

  // ── Redraw all branch markers whenever branches list changes ───────────────
  const redrawMarkers = useCallback(() => {
    if (!mapRef.current || !leafletReady) return;
    const L   = window.L;
    const map = mapRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    branches.forEach((branch, idx) => {
      const lat = branch.latitude ?? branch.location_lat;
      const lng = branch.longitude ?? branch.location_lng;
      if (!lat || !lng) return;

      // Hide the marker for the branch being edited (temp blue marker replaces it)
      if (editingId !== null && editingId === branch.id) return;

      const icon = makeNumberedIcon(L, idx + 1, true, false);

      // Make all markers non-interactive during editing so they don't absorb map clicks
      const marker = L.marker([Number(lat), Number(lng)], {
        icon,
        draggable: false,
        interactive: editingId === null,
      })
        .addTo(map)
        .bindPopup(`
          <div dir="rtl" style="text-align:right;min-width:140px">
            <strong>${branch.name}</strong><br/>
            <small style="color:#6B7280">${branch.address || ''}</small><br/>
            <small style="color:#10B981;font-family:monospace">${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}</small>
          </div>`);

      markersRef.current.set(branch.id, marker);
    });
  }, [branches, leafletReady, editingId]);

  useEffect(() => { redrawMarkers(); }, [redrawMarkers]);

  // ── Map click handler (only active while editing) ──────────────────────────
  useEffect(() => {
    if (!mapRef.current || !leafletReady) return;
    const L   = window.L;
    const map = mapRef.current;

    // Remove old listener
    if (clickHandlerRef.current) {
      map.off('click', clickHandlerRef.current);
    }

    if (editingId === null) {
      if (mapContainerRef.current) mapContainerRef.current.style.cursor = '';
      return;
    }

    if (mapContainerRef.current) mapContainerRef.current.style.cursor = 'crosshair';

    const placeTempMarker = (lat: number, lng: number) => {
      if (tempMarkerRef.current) { tempMarkerRef.current.remove(); }
      const m = L.marker([lat, lng], { icon: makeTempIcon(L), draggable: true }).addTo(map);
      m.on('dragend', (ev: any) => {
        const p = ev.target.getLatLng();
        setTempCoords({ lat: p.lat, lng: p.lng });
      });
      // Clicking on the temp marker itself should also move it (re-fire as map click)
      m.on('click', (ev: any) => {
        L.DomEvent.stopPropagation(ev);
        handleClick(ev);
      });
      tempMarkerRef.current = m;
    };

    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng;
      setTempCoords({ lat, lng });
      placeTempMarker(lat, lng);
    };

    clickHandlerRef.current = handleClick;
    map.on('click', handleClick);

    return () => { map.off('click', handleClick); };
  }, [editingId, leafletReady]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startEditing = (branch: Branch) => {
    if (tempMarkerRef.current) { tempMarkerRef.current.remove(); tempMarkerRef.current = null; }
    setTempCoords(null);
    setEditingId(branch.id);

    const lat = branch.latitude ?? branch.location_lat;
    const lng = branch.longitude ?? branch.location_lng;
    if (lat && lng && mapRef.current) {
      mapRef.current.setView([Number(lat), Number(lng)], 16);
    } else if (mapRef.current) {
      mapRef.current.setView([30.0444, 31.2357], 10);
    }

    // If branch already has coords → pre-place draggable temp marker immediately
    if (lat && lng && leafletReady && mapRef.current) {
      const L   = window.L;
      const map = mapRef.current;
      const m = L.marker([Number(lat), Number(lng)], { icon: makeTempIcon(L), draggable: true }).addTo(map);
      m.on('dragend', (ev: any) => {
        const p = ev.target.getLatLng();
        setTempCoords({ lat: p.lat, lng: p.lng });
      });
      tempMarkerRef.current = m;
      setTempCoords({ lat: Number(lat), lng: Number(lng) });
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempCoords(null);
    if (tempMarkerRef.current) { tempMarkerRef.current.remove(); tempMarkerRef.current = null; }
    if (mapContainerRef.current) mapContainerRef.current.style.cursor = '';
  };

  const saveLocation = async () => {
    if (!editingId || !tempCoords) return;
    setSaving(true);
    try {
      await api.branches.update(editingId, {
        latitude:  tempCoords.lat,
        longitude: tempCoords.lng,
      });
      showToast('✅ تم حفظ الموقع بنجاح', 'success');
      await loadBranches();
      cancelEditing();
    } catch {
      showToast('❌ فشل حفظ الموقع', 'error');
    } finally {
      setSaving(false);
    }
  };

  const clearLocation = async (branchId: number) => {
    if (!confirm('هل تريد حذف إحداثيات هذا الفرع؟')) return;
    try {
      await api.branches.update(branchId, { latitude: null, longitude: null });
      showToast('تم حذف الإحداثيات', 'success');
      await loadBranches();
    } catch {
      showToast('فشل حذف الإحداثيات', 'error');
    }
  };

  const zoomTo = (branch: Branch) => {
    const lat = branch.latitude ?? branch.location_lat;
    const lng = branch.longitude ?? branch.location_lng;
    if (lat && lng && mapRef.current) {
      mapRef.current.setView([Number(lat), Number(lng)], 16);
      markersRef.current.get(branch.id)?.openPopup();
    }
  };

  const fitAll = () => {
    if (!mapRef.current) return;
    const pts: [number, number][] = [];
    branches.forEach(b => {
      const lat = b.latitude ?? b.location_lat;
      const lng = b.longitude ?? b.location_lng;
      if (lat && lng) pts.push([Number(lat), Number(lng)]);
    });
    if (pts.length > 0) mapRef.current.fitBounds(pts, { padding: [50, 50] });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(pos => {
      mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 14);
    });
  };

  const editingBranch = branches.find(b => b.id === editingId);
  const branchesWithLocation = branches.filter(b => (b.latitude ?? b.location_lat) && (b.longitude ?? b.location_lng));
  const branchesWithoutLocation = branches.filter(b => !(b.latitude ?? b.location_lat) || !(b.longitude ?? b.location_lng));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" dir="rtl" style={{ minHeight: 'calc(100vh - 80px)' }}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">📍 مواقع الفروع على الخريطة</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              حدد إحداثيات كل فرع لتفعيل نظام «أقرب فرع» تلقائياً —
              <span className="text-green-600 font-semibold"> {branchesWithLocation.length} فرع محدد</span>
              {branchesWithoutLocation.length > 0 && (
                <span className="text-orange-500 font-semibold"> / {branchesWithoutLocation.length} بدون موقع</span>
              )}
            </p>
          </div>
          <button
            onClick={loadBranches}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition text-sm font-medium border border-orange-200"
          >
            <RefreshCw size={15} />
            تحديث
          </button>
        </div>

        {/* Warning if branches have no location */}
        {branchesWithoutLocation.length > 0 && !editingId && (
          <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-sm text-orange-800">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-orange-500" />
            <span>
              <strong>{branchesWithoutLocation.length} فرع</strong> بدون إحداثيات — نظام «أقرب فرع» لن يعمل معهم.
              اضغط «تحديد موقع» لكل فرع.
            </span>
          </div>
        )}

        {/* Editing mode banner */}
        {editingId !== null && (
          <div className="mt-3 flex items-center gap-2 bg-blue-50 border-2 border-blue-300 rounded-xl px-4 py-2.5 text-sm text-blue-800">
            <Crosshair size={16} className="flex-shrink-0 text-blue-600 animate-pulse" />
            <div className="flex-1">
              <strong>وضع تحديد الموقع:</strong> «{editingBranch?.name}» —
              {tempCoords
                ? <span className="text-green-700 font-semibold"> تم التحديد ✓ — اسحب الدبوس الأزرق للضبط أو اضغط حفظ</span>
                : <span className="text-blue-700"> اضغط على الخريطة لوضع الدبوس</span>
              }
            </div>
            <button onClick={cancelEditing} className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Main Layout: List + Map ── */}
      <div className="flex gap-4 flex-1 min-h-0" style={{ height: '65vh' }}>

        {/* ── Branch List ── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2.5 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full" />
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center text-gray-400 py-16 text-sm">لا توجد فروع</div>
          ) : (
            branches.map((branch, idx) => {
              const lat      = branch.latitude ?? branch.location_lat;
              const lng      = branch.longitude ?? branch.location_lng;
              const hasLoc   = !!(lat && lng);
              const isEdit   = editingId === branch.id;
              const inactive = branch.is_active === false;

              return (
                <div
                  key={branch.id}
                  className={`rounded-xl border-2 p-3 transition-all duration-150
                    ${isEdit
                      ? 'border-blue-400 bg-blue-50 shadow-md'
                      : hasLoc
                        ? 'border-green-200 bg-white hover:border-green-400'
                        : 'border-orange-200 bg-orange-50/60 hover:border-orange-400'
                    }
                    ${inactive ? 'opacity-60' : ''}
                  `}
                >
                  {/* Branch info */}
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white shadow
                      ${isEdit ? 'bg-blue-500' : hasLoc ? 'bg-green-500' : 'bg-orange-400'}`}>
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm leading-tight truncate">{branch.name}</p>
                      {branch.address && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{branch.address}</p>
                      )}
                      {hasLoc ? (
                        <p className="text-xs text-green-600 font-mono mt-1 bg-green-50 rounded px-1.5 py-0.5 inline-block">
                          {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                        </p>
                      ) : (
                        <p className="text-xs text-orange-500 mt-1">⚠️ لا يوجد موقع محدد</p>
                      )}
                      {isEdit && tempCoords && (
                        <p className="text-xs text-blue-600 font-mono mt-1 bg-blue-50 rounded px-1.5 py-0.5 inline-block">
                          🔵 {tempCoords.lat.toFixed(5)}, {tempCoords.lng.toFixed(5)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    {isEdit ? (
                      <>
                        <button
                          onClick={saveLocation}
                          disabled={!tempCoords || saving}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 disabled:opacity-40 transition"
                        >
                          {saving
                            ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            : <Save size={12} />
                          }
                          حفظ الموقع
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(branch)}
                          disabled={editingId !== null}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 disabled:opacity-40 transition"
                        >
                          <Edit3 size={12} />
                          {hasLoc ? 'تعديل' : 'تحديد موقع'}
                        </button>
                        {hasLoc && (
                          <>
                            <button
                              onClick={() => zoomTo(branch)}
                              disabled={editingId !== null}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition disabled:opacity-40"
                              title="عرض على الخريطة"
                            >
                              <MapPin size={13} />
                            </button>
                            <button
                              onClick={() => clearLocation(branch.id)}
                              disabled={editingId !== null}
                              className="p-1.5 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 transition disabled:opacity-40"
                              title="حذف الموقع"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* How-to card */}
          {!loading && branches.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-700 flex items-center gap-1.5"><Info size={13} /> كيفية الاستخدام</p>
              <p>١. اضغط «تحديد موقع» على الفرع</p>
              <p>٢. اضغط على الخريطة لوضع الدبوس</p>
              <p>٣. اسحب الدبوس الأزرق للضبط الدقيق</p>
              <p>٤. اضغط «حفظ الموقع» للتأكيد</p>
              <p className="text-green-600 font-medium pt-1">✓ بعد الحفظ يعمل نظام «أقرب فرع» تلقائياً</p>
            </div>
          )}
        </div>

        {/* ── Map Panel ── */}
        <div className="flex-1 relative rounded-2xl shadow-lg border border-gray-200" style={{ overflow: 'hidden', minHeight: 0 }}>

          {/* Loading overlay */}
          {(!leafletReady || mapLoading) && (
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center z-20 gap-3">
              <div className="animate-spin w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full" />
              <p className="text-sm text-gray-500 font-medium">جاري تحميل الخريطة…</p>
            </div>
          )}

          {/* Map container */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />

          {/* Floating map controls */}
          <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
            <button
              onClick={useMyLocation}
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition border border-gray-100"
              title="موقعي الحالي"
            >
              <Navigation size={17} />
            </button>
            {branchesWithLocation.length > 0 && (
              <button
                onClick={fitAll}
                className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-orange-600 hover:bg-orange-50 transition border border-gray-100"
                title="عرض كل الفروع"
              >
                <MapPin size={17} />
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl shadow-md px-3 py-2 text-xs space-y-1 border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
              <span className="text-gray-600">موقع محدد</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-400" />
              <span className="text-gray-600">جاري التعديل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500" />
              <span className="text-gray-600">الدبوس الجديد</span>
            </div>
          </div>

          {/* "Click to place" hint */}
          {editingId !== null && !tempCoords && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
              <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-bounce flex items-center gap-2">
                <MapPin size={16} />
                اضغط على الخريطة لتحديد موقع «{editingBranch?.name}»
              </div>
            </div>
          )}

          {/* "Drag or save" hint */}
          {editingId !== null && tempCoords && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
              <div className="bg-green-600 text-white px-5 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2">
                <Check size={14} />
                تم التحديد — اسحب الدبوس الأزرق أو اضغط «حفظ الموقع»
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchLocationsManager;
