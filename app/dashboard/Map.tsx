'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Complaint } from '@/lib/supabase'

// Fix default marker icons breaking in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_COLOR: Record<string, string> = {
  pending: '#ef4444',
  in_progress: '#f59e0b',
  resolved: '#22c55e',
}

const CATEGORY_ICON: Record<string, string> = {
  pothole: '🕳️',
  garbage: '🗑️',
  drain: '💧',
  streetlight: '💡',
}

export default function Map({ complaints }: { complaints: Complaint[] }) {
  const center: [number, number] =
    complaints.length > 0 ? [complaints[0].latitude, complaints[0].longitude] : [22.5726, 88.3639]

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {complaints.map((c) => (
        <Marker
          key={c.id}
          position={[c.latitude, c.longitude]}
          icon={L.divIcon({
            html: `<div style="background:${STATUS_COLOR[c.status]};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
            className: '',
            iconSize: [14, 14],
          })}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{CATEGORY_ICON[c.category]} {c.category}</div>
              <div className="text-slate-600">{c.description}</div>
              <div className="mt-1 text-xs uppercase tracking-wide" style={{ color: STATUS_COLOR[c.status] }}>
                {c.status.replace('_', ' ')}
              </div>
              {c.is_duplicate_of && <div className="text-xs text-amber-600 mt-1">Flagged as duplicate</div>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
