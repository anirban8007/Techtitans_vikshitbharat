'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Complaint } from '@/lib/supabase'
import { getCategoryFallbackImage } from '@/lib/dataService'

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
  resolved: '#10b981',
}

const CATEGORY_ICON: Record<string, string> = {
  pothole: '🕳️',
  garbage: '🗑️',
  drain: '💧',
  streetlight: '💡',
}

export default function Map({ complaints }: { complaints: Complaint[] }) {
  const center: [number, number] =
    complaints.length > 0 ? [complaints[0].latitude, complaints[0].longitude] : [22.5286, 88.3580]

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      className="h-full w-full z-10"
      style={{ minHeight: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {complaints.map((c) => {
        const color = STATUS_COLOR[c.status] || '#6366f1'
        const iconHtml = `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5); transform: scale(1); transition: transform 0.2s;"></div>`

        return (
          <Marker
            key={c.id}
            position={[c.latitude, c.longitude]}
            icon={L.divIcon({
              html: iconHtml,
              className: 'custom-leaflet-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup className="custom-popup" minWidth={220} maxWidth={280}>
              <div className="text-slate-900 font-sans p-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1 text-slate-800">
                    <span>{CATEGORY_ICON[c.category] || '📍'}</span>
                    <span>{c.category}</span>
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: color }}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={c.image_url || getCategoryFallbackImage(c.category)}
                    alt={c.category}
                    onError={(e) => {
                      e.currentTarget.src = getCategoryFallbackImage(c.category)
                    }}
                    className="w-full h-24 object-cover"
                  />
                </div>

                <p className="text-xs text-slate-700 leading-snug line-clamp-3 mb-2 font-normal">
                  {c.description}
                </p>

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {c.department || 'Civic'}
                  </span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>

                {c.is_duplicate_of && (
                  <div className="mt-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded font-medium">
                    ⚡ Linked duplicate report
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
