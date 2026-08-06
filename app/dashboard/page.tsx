'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Complaint } from '@/lib/supabase'
import { getStoredComplaints, resetToSeedData, getCitizenProfile, CitizenProfile, getCategoryFallbackImage } from '@/lib/dataService'

// Dynamic import with SSR disabled for Leaflet map
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
      <span className="text-xs font-medium">Loading GIS OpenStreetMap...</span>
    </div>
  ),
})

const CATEGORY_ICON: Record<string, string> = {
  pothole: '🕳️',
  garbage: '🗑️',
  drain: '💧',
  streetlight: '💡',
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Issues',
  pothole: 'Potholes',
  garbage: 'Waste & Garbage',
  drain: 'Drainage & Sewage',
  streetlight: 'Streetlights',
}

export default function Dashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null)
  const [citizen, setCitizen] = useState<CitizenProfile | null>(null)

  const reloadData = () => {
    const data = getStoredComplaints()
    setComplaints(data)
    setCitizen(getCitizenProfile())
    setLoading(false)
  }

  useEffect(() => {
    reloadData()

    const handleUpdate = () => reloadData()
    window.addEventListener('civic_complaints_updated', handleUpdate)
    window.addEventListener('civic_citizen_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('civic_complaints_updated', handleUpdate)
      window.removeEventListener('civic_citizen_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Filter complaints based on Category, Status, and Search text
  const filtered = complaints.filter((c) => {
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    const matchesSearch =
      searchQuery === '' ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reporter_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesStatus && matchesSearch
  })

  // Calculate live stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  }

  // Calculate counts per category
  const categoryCounts: Record<string, number> = {
    all: complaints.length,
    pothole: complaints.filter((c) => c.category === 'pothole').length,
    garbage: complaints.filter((c) => c.category === 'garbage').length,
    drain: complaints.filter((c) => c.category === 'drain').length,
    streetlight: complaints.filter((c) => c.category === 'streetlight').length,
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 30% Secondary: Dark Navy Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg text-white shadow-sm">
              🏛️
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                Civic Dashboard
                <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Public Infrastructure Transparency Feed</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Citizen Rewards Pill */}
          {citizen && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-sm">
              <span className="text-sm">👤</span>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-none">{citizen.name}</div>
                <div className="text-[10px] font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                  <span>⭐ {citizen.credits} Credits</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-emerald-400">{citizen.badge}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              resetToSeedData()
              reloadData()
            }}
            title="Reset to 14 standard complaints for demo rehearsal"
            className="text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg transition"
          >
            ↺ Reset Data
          </button>
          <Link
            href="/"
            className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1"
          >
            <span>+</span>
            <span>Report Issue</span>
          </Link>
          <Link
            href="/admin"
            className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            🔒 Admin
          </Link>
        </div>
      </header>

      {/* 60% Dominant: Clean Off-White Main Container */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 flex-1 flex flex-col space-y-4">
        {/* Metric Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <StatCard
            label="Total Reports"
            value={stats.total}
            accentColor="border-slate-200 bg-white text-blue-600"
            subtext="All citizen submissions"
            icon="📋"
          />
          <StatCard
            label="Pending Action"
            value={stats.pending}
            accentColor="border-red-200 bg-red-50/50 text-red-600"
            subtext="Awaiting crew dispatch"
            icon="⏳"
          />
          <StatCard
            label="In Progress"
            value={stats.in_progress}
            accentColor="border-amber-200 bg-amber-50/50 text-amber-600"
            subtext="Repairs underway"
            icon="🚧"
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            accentColor="border-emerald-200 bg-emerald-50/50 text-emerald-600"
            subtext="Verified fixed"
            icon="✅"
          />
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          {/* Category Pill Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'pothole', 'garbage', 'drain', 'streetlight'].map((cat) => {
              const active = categoryFilter === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat !== 'all' && <span>{CATEGORY_ICON[cat]}</span>}
                  <span>{CATEGORY_LABELS[cat]}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Input & Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Map & Live Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[560px]">
          {/* Leaflet Map Box (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden relative shadow-md min-h-[350px] lg:min-h-[560px]">
            {!loading && <Map complaints={filtered} />}
            
            {/* Overlay Map Badge */}
            <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] font-bold text-slate-700 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Showing {filtered.length} Geo-Locations</span>
            </div>
          </div>

          {/* Complaint Feed (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Live Incident Feed ({filtered.length})
              </span>
              <span className="text-[11px] text-slate-400">Sorted by newest</span>
            </div>

            <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[540px] custom-scrollbar flex-1">
              {filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm font-bold text-slate-700">No matching issues found</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing filters or search keywords.</p>
                </div>
              ) : (
                filtered.map((c) => {
                  const isSelected = selectedComplaintId === c.id

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedComplaintId(isSelected ? null : c.id)}
                      className={`bg-white hover:bg-slate-50 border rounded-2xl p-4 transition cursor-pointer shadow-sm ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: Icon, Category & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{CATEGORY_ICON[c.category] || '📍'}</span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 capitalize">
                              {c.category}
                            </span>
                            <span className="ml-2 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                              {c.department || 'Civic Services'}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>

                      {/* Photo Thumbnail with Safe Fallback */}
                      <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 max-h-32 bg-slate-100">
                        <img
                          src={c.image_url || getCategoryFallbackImage(c.category)}
                          alt={c.category}
                          onError={(e) => {
                            e.currentTarget.src = getCategoryFallbackImage(c.category)
                          }}
                          className="w-full h-24 object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-700 mt-2 leading-relaxed line-clamp-2 font-medium">
                        {c.description}
                      </p>

                      {/* Duplicate Alert Tag */}
                      {c.is_duplicate_of && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                          <span>⚡</span>
                          <span>Linked Duplicate (Clustered with nearby report)</span>
                        </div>
                      )}

                      {/* Bottom Info: Reporter with Citizen Karma points & Timestamp */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                          <span className="text-slate-800 font-bold truncate">
                            👤 {c.reporter_name || 'Citizen'}
                          </span>
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            ⭐ 450 pts
                          </span>
                        </div>
                        <span className="text-slate-400 font-medium">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 30% Secondary: Dark Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 bg-slate-900 border-t border-slate-800">
        Civic Complaint & Transparency Platform · Hackathon 2026 Edition
      </footer>
    </div>
  )
}

function StatCard({
  label,
  value,
  accentColor,
  subtext,
  icon,
}: {
  label: string
  value: number
  accentColor: string
  subtext: string
  icon: string
}) {
  return (
    <div className={`border rounded-2xl p-4 shadow-sm transition hover:shadow-md ${accentColor}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="text-base">{icon}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="text-[11px] text-slate-500 mt-1 truncate font-medium">{subtext}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Pending' },
    in_progress: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'In Progress' },
    resolved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Resolved' },
  }

  const current = styles[status] || styles.pending

  return (
    <span
      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${current.bg} ${current.text}`}
    >
      {current.label}
    </span>
  )
}
