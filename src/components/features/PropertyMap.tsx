
import { useState, useEffect, useRef } from "react";
import { Lock, MapPin, Navigation } from "lucide-react";

interface PropertyMapProps {
  lat: number;
  lng: number;
  revealed: boolean;
  locationLabel: string;
  zoneRadius?: number;
  /** If true, show routing controls from user's current location */
  showRouting?: boolean;
}

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

let leafletLoaded = false;
let leafletPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (leafletLoaded) return Promise.resolve();
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if ((window as any).L) { leafletLoaded = true; resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => { leafletLoaded = true; resolve(); };
    document.head.appendChild(script);
  });
  return leafletPromise;
}

export default function PropertyMap({
  lat, lng, revealed, locationLabel, zoneRadius = 700, showRouting = false,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const routeRef = useRef<any>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet().then(() => {
      if (cancelled || !mapContainerRef.current) return;
      const L = window.L;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        routeRef.current = null;
      }

      const offsetLat = revealed ? lat : lat + (Math.random() * 0.004 - 0.002);
      const offsetLng = revealed ? lng : lng + (Math.random() * 0.004 - 0.002);
      const zoom = revealed ? 16 : 13;

      const map = L.map(mapContainerRef.current, {
        center: [offsetLat, offsetLng],
        zoom,
        scrollWheelZoom: false,
        zoomControl: revealed,
        dragging: revealed,
        doubleClickZoom: false,
        attributionControl: false,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      if (revealed) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:42px;height:42px;
            background:hsl(152,52%,22%);
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid white;
            box-shadow:0 3px 12px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
          "><div style="transform:rotate(45deg);font-size:18px;margin-left:1px;margin-top:1px;">📍</div></div>`,
          iconSize: [42, 42],
          iconAnchor: [21, 42],
        });
        L.marker([lat, lng], { icon }).addTo(map);
      } else {
        L.circle([offsetLat, offsetLng], {
          radius: zoneRadius,
          color: "hsl(152,52%,22%)",
          fillColor: "hsl(152,52%,22%)",
          fillOpacity: 0.10,
          weight: 2,
          opacity: 0.45,
          dashArray: "6 4",
        }).addTo(map);

        const zoneIcon = L.divIcon({
          className: "",
          html: `<div style="
            background:hsl(152,52%,22%);color:white;
            padding:5px 12px;border-radius:20px;
            font-size:12px;font-weight:600;
            white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);
          ">${locationLabel}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        L.marker([offsetLat, offsetLng], { icon: zoneIcon }).addTo(map);
      }
    });

    return () => { cancelled = true; };
  }, [revealed, lat, lng, zoneRadius, mapContainerRef]); // Added mapContainerRef and zoneRadius to dependencies
                                                    // Removed eslint-disable-next-line as the issue is resolved by fixing deps
  const handleGetDirections = () => {
    if (!navigator.geolocation) {
      setRouteError("Location not available on this device.");
      return;
    }
    setRouteLoading(true);
    setRouteError(null);
    setRouteInfo(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Use OSRM (free routing) to get route info
        try {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${lng},${lat}?overview=false`
          );
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const km = (route.distance / 1000).toFixed(1);
            const mins = Math.ceil(route.duration / 60);
            setRouteInfo({ distance: `${km} km`, duration: mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min` });
          }
        } catch {
          // Fallback: open in Google Maps
        }

        // Draw route on map
        loadLeaflet().then(() => {
          const L = window.L;
          if (!mapRef.current) return;

          if (routeRef.current) {
            mapRef.current.removeLayer(routeRef.current);
          }

          const userIcon = L.divIcon({
            className: "",
            html: `<div style="width:14px;height:14px;background:#2563eb;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(37,99,235,0.3)"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });
          const userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(mapRef.current);
          routeRef.current = userMarker;

          // Fit bounds
          const bounds = L.latLngBounds([[userLat, userLng], [lat, lng]]);
          mapRef.current.fitBounds(bounds, { padding: [40, 40] });

          // Draw a straight line (OSRM polyline decode would be better but needs plugin)
          const line = L.polyline([[userLat, userLng], [lat, lng]], {
            color: "hsl(152,52%,22%)",
            weight: 3,
            opacity: 0.7,
            dashArray: "8 6",
          }).addTo(mapRef.current);

          // Group for cleanup
          const group = L.layerGroup([userMarker, line]);
          routeRef.current = group;
        });

        setRouteLoading(false);
      },
      () => {
        setRouteError("Could not get your location. Please allow location access.");
        setRouteLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="space-y-2">
      <div
        className="relative z-0 rounded-2xl overflow-hidden border border-[hsl(var(--border))]"
        style={{ isolation: "isolate" }}
      >
        <div ref={mapContainerRef} style={{ height: 260, width: "100%" }} />

        {/* Lock overlay */}
        {!revealed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/25 backdrop-blur-[2px] rounded-2xl">
            <div className="bg-white rounded-2xl shadow-lg px-5 py-3.5 flex items-center gap-3 border border-[hsl(var(--border))]">
              <div className="w-9 h-9 rounded-xl bg-[hsl(var(--brand-primary)/0.1)] flex items-center justify-center">
                <Lock className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Exact location locked</p>
                <p className="text-xs text-[hsl(var(--text-muted))]">Pay contact fee to reveal</p>
              </div>
            </div>
          </div>
        )}

        {/* Attribution */}
        <div className="absolute bottom-1 right-1 z-[500]">
          <span className="text-[10px] text-[hsl(var(--text-muted))] bg-white/80 px-1.5 py-0.5 rounded">© OpenStreetMap</span>
        </div>

        {revealed && (
          <div className="absolute top-2 left-2 z-[500] bg-[hsl(var(--brand-primary))] text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3" />
            Exact location
          </div>
        )}
      </div>

      {/* Routing controls — shown after payment */}
      {revealed && showRouting && (
        <div className="flex gap-2">
          <button
            onClick={handleGetDirections}
            disabled={routeLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--brand-primary))] text-white text-sm font-semibold hover:bg-[hsl(var(--brand-primary-dark))] transition-colors disabled:opacity-60 flex-1 justify-center"
          >
            <Navigation className="w-4 h-4" />
            {routeLoading ? "Getting location…" : "Get Directions"}
          </button>
          <button
            onClick={openGoogleMaps}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-white text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-2))] transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Open Maps
          </button>
        </div>
      )}

      {routeInfo && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
          <Navigation className="w-4 h-4 flex-shrink-0" />
          <span><strong>{routeInfo.distance}</strong> away · approx. <strong>{routeInfo.duration}</strong> drive</span>
        </div>
      )}

      {routeError && (
        <p className="text-xs text-red-500 px-1">{routeError}</p>
      )}
    </div>
  );
}
