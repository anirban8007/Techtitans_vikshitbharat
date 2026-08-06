'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase, Complaint } from '@/lib/supabase'

const Map = dynamic(() => import('./Map'), { ssr: false })

const CATEGORY_ICON: Record<string, string> = {
  pothole: '🕳️',
  garbage: '🗑️',
  drain: '💧',
  streetlight: '💡',
}

export default function Dashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplaints()
    // Live updates — new complaints appear without refresh, good for demo drama
    const channel = supabase
      .channel('complaints-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, fetchComplaints)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchComplaints() {
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false })
    setComplaints(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.category === filter)

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Civic Issues Dashboard</h1>
          <p className="text-xs text-slate-500">Live public transparency view</p>
        </div>
        <a href="/" className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800">
          + Report Issue
        </a>
      </header>

      <div className="grid grid-cols-4 gap-3 px-6 py-4">
        <StatCard label="Total Reports" value={stats.total} color="text-slate-900" />
        <StatCard label="Pending" value={stats.pending} color="text-red-600" />
        <StatCard label="In Progress" value={stats.in_progress} color="text-amber-600" />
        <StatCard label="Resolved" value={stats.resolved} color="text-green-600" />
      </div>

      <div className="px-6 pb-2 flex gap-2">
        {['all', 'pothole', 'garbage', 'drain', 'streetlight'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              filter === cat ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600'
            }`}
          >
            {cat === 'all' ? 'All' : `${CATEGORY_ICON[cat]} ${cat}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 px-6 pb-6 h-[600px]">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {!loading && <Map complaints={filtered} />}
        </div>
        <div className="overflow-y-auto space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{CATEGORY_ICON[c.category]} {c.category}</span>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
              <p className="text-xs text-slate-400 mt-1">{c.department} · {new Date(c.created_at).toLocaleDateString()}</p>
              {c.is_duplicate_of && (
                <p className="text-xs text-amber-600 mt-1">⚠ Duplicate of nearby report</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-red-50 text-red-700',
    in_progress: 'bg-amber-50 text-amber-700',
    resolved: 'bg-green-50 text-green-700',
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>{status.replace('_', ' ')}</span>
}
