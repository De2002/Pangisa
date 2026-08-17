import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  /** District/area label to center map on */
  centerLabel?: string;
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

// Approximate center coords for Kampala areas
const AREA_CENTERS: Record<string, [number, number]> = {
  "Kira": [0.3661, 32.6354],
  "Ntinda": [0.3437, 32.6167],
  "Bukoto": [0.3325, 32.5968],
  "Kololo": [0.3220, 32.5881],
  "Naguru": [0.3330, 32.6053],
  "Muyenga": [0.2862, 32.6105],
  "Bugolobi": [0.3132, 32.6159],
  "Najjera": [0.3812, 32.6410],
  "Kyanja": [0.3902, 32.5902],
  "Kisaasi": [0.3656, 32.6140],
  "Bweyogerere": [0.3542, 32.6707],
  "Naalya": [0.3811, 32.6233],
  "Matugga": [0.4893, 32.6022],
  "Gayaza": [0.4476, 32.6395],
  "Namugongo": [0.3919, 32.6498],
  "Makindye": [0.2830, 32.5849],
  "Ggaba": [0.2660, 32.6170],
  "Munyonyo": [0.2724, 32.6219],
  "Katwe": [0.2982, 32.5760],
  "Kawempe": [0.3695, 32.5688],
  "Wandegeya": [0.3387, 32.5758],
  "Makerere": [0.3447, 32.5680],
  "Mulago": [0.3411, 32.5789],
  "Kamwokya": [0.3285, 32.5849],
  "Nakawa": [0.3268, 32.6159],
};

const DEFAULT_CENTER: [number, number] = [0.3476, 32.5825]; // Kampala center

export default function LocationPicker({ lat, lng, onChange, centerLabel }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [picked, setPicked] = useState(!!lat && !!lng);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet().then(() => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const L = window.L;

      const center: [number, number] = lat && lng
        ? [lat, lng]
        : (centerLabel && AREA_CENTERS[centerLabel]) ?? DEFAULT_CENTER;

      const map = L.map(containerRef.current, {
        center,
        zoom: lat && lng ? 16 : 14,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:36px;height:36px;
          background:#1f5c35;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      if (lat && lng) {
        const m = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
        markerRef.current = m;
        m.on("dragend", () => {
          const pos = m.getLatLng();
          onChange(pos.lat, pos.lng);
        });
      }

      map.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        onChange(clickLat, clickLng);
        setPicked(true);

        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          const m = L.marker([clickLat, clickLng], { icon: pinIcon, draggable: true }).addTo(map);
          markerRef.current = m;
          m.on("dragend", () => {
            const pos = m.getLatLng();
            onChange(pos.lat, pos.lng);
          });
        }
      });
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center when area label changes
  useEffect(() => {
    if (!mapRef.current || !centerLabel || (lat && lng)) return;
    const center = AREA_CENTERS[centerLabel];
    if (center) mapRef.current.setView(center, 14);
  }, [centerLabel, lat, lng]);

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-[hsl(var(--brand-primary)/0.4)] hover:border-[hsl(var(--brand-primary))] transition-colors">
        <div ref={containerRef} style={{ height: 280, width: "100%" }} />

        {!picked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-[hsl(var(--border))] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[hsl(var(--brand-primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--text-primary))]">Click on the map to drop your pin</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-1 right-1 z-[500]">
          <span className="text-[10px] text-[hsl(var(--text-muted))] bg-white/80 px-1.5 py-0.5 rounded">
            © OpenStreetMap
          </span>
        </div>
      </div>

      {picked && (
        <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
          <Navigation className="w-4 h-4" />
          <span>
            Location pinned: {lat?.toFixed(5)}, {lng?.toFixed(5)}
          </span>
          <button
            type="button"
            onClick={() => {
              if (markerRef.current && mapRef.current) {
                mapRef.current.removeLayer(markerRef.current);
                markerRef.current = null;
              }
              onChange(0, 0);
              setPicked(false);
            }}
            className="ml-auto text-xs text-red-400 hover:text-red-600 underline"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
