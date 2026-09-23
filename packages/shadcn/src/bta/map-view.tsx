import * as React from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '../lib/utils';

// Leaflet mất icon mặc định khi bundler đổi đường dẫn → dùng divIcon.
function pinIcon(tone: 'primary' | 'accent' | 'warning' | 'danger' | 'neutral') {
  const color = { primary: '#0F766E', accent: '#2563EB', warning: '#B45309', danger: '#B91C1C', neutral: '#66717D' }[tone];
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(23,32,42,.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: React.ReactNode;
  status?: 'primary' | 'accent' | 'warning' | 'danger' | 'neutral';
  onClick?: () => void;
}

export interface MapViewProps {
  pins: MapPin[];
  /** Lộ trình GPS */
  path?: { lat: number; lng: number }[];
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  className?: string;
}

/** Bản đồ OSM (react-leaflet). Nếu không có pin → mặc định TP.HCM. */
export function MapView({ pins, path, center, zoom = 11, height = 360, className }: MapViewProps) {
  const c: [number, number] = center ?? (pins[0] ? [pins[0].lat, pins[0].lng] : [10.7769, 106.7009]);
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)} style={{ height }}>
      <MapContainer center={c} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {path?.length ? <Polyline positions={path.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#2563EB', weight: 3 }} /> : null}
        {pins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(p.status ?? 'primary')} eventHandlers={p.onClick ? { click: p.onClick } : undefined}>
            <Popup>{p.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export interface LocationRow {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  at?: React.ReactNode;
  stale?: boolean;
  onClick?: () => void;
}

export function LocationList({ items, className }: { items: LocationRow[]; className?: string }) {
  return (
    <ul className={cn('divide-y divide-border rounded-lg border border-border bg-surface', className)}>
      {items.map((it) => (
        <li key={it.id}>
          <button type="button" onClick={it.onClick} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-muted">
            <span className={cn('size-2.5 shrink-0 rounded-full', it.stale ? 'bg-border-strong' : 'bg-success')} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body">{it.title}</span>
              {it.subtitle ? <span className="truncate text-body-sm text-text-muted">{it.subtitle}</span> : null}
            </span>
            {it.at ? <span className="shrink-0 text-caption text-text-subtle tabular-nums">{it.at}</span> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
