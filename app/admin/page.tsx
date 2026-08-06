'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Complaint } from '@/lib/supabase'
import { getStoredComplaints, updateComplaintStatus, resetToSeedData, getCategoryFallbackImage, getCitizenProfile, CitizenProfile } from '@/lib/dataService'

const CATEGORY_ICON: Record<string, string> = {
  pothole: '🕳️',
  garbage: '🗑️',
  drain: '💧',
  streetlight: '💡',
}

const ADMIN_PASSCODE = 'techtitans2026'

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [citizen, setCitizen] = useState<CitizenProfile | null>(null)

  const reloadData = () => {
    setComplaints(getStoredComplaints())
    setCitizen(getCitizenProfile())
  }

  useEffect(() => {
    if (authed) {
      reloadData()
    }
  }, [authed])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'in_progress' | 'resolved') => {
    await updateComplaintStatus(id, newStatus)
    reloadData()
    showToast(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()} successfully!`)
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
        <div className="max-w-sm w-full bg-white border border-slate-200 rounded-3xl p-7 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl shadow-sm text-blue-600">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Civic Authority Portal</h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized municipal officer & triage console
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (passInput === ADMIN_PASSCODE) setAuthed(true)
              else alert('Invalid passcode! Use: techtitans2026')
            }}
            className="space-y-3"
          >
            <input
              type="password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="Enter Officer Passcode"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 text-center focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md"
            >
              Sign In to Console
            </button>
          </form>

          {/* Quick Demo One-Click Access for judges / video */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setPassInput(ADMIN_PASSCODE)
                setAuthed(true)
              }}
              className="text-xs text-blue-600 hover:text-blue-700 underline font-bold"
            >
              ⚡ 1-Click Demo Fast Login (techtitans2026)
            </button>
          </div>

          <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-800 block font-medium">
            ← Back to Public Dashboard
          </Link>
        </div>
      </main>
    )
  }

  const filtered = complaints.filter((c) => {
    const matchesDept = departmentFilter === 'all' || c.department === departmentFilter
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesDept && matchesStatus
  })

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl animate-bounce flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 30% Secondary: Dark Navy Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg text-white">
            🛡️
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              Municipal Officer Triage Console
              <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-md font-bold">
                Admin Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Department Status Updates & Field Dispatch</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {citizen && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs">
              <span className="text-amber-400">⭐</span>
              <span className="text-white font-bold">{citizen.name}</span>
              <span className="text-amber-400 font-bold">({citizen.credits} pts)</span>
            </div>
          )}

          <button
            onClick={() => {
              resetToSeedData()
              reloadData()
              showToast('Reset data successfully')
            }}
            className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            ↺ Reset Data
          </button>
          <Link
            href="/dashboard"
            className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            📊 View Public Map
          </Link>
          <Link
            href="/"
            className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition shadow-sm"
          >
            + New Complaint
          </Link>
        </div>
      </header>

      {/* 60% Dominant: Main Content Off-White */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4 flex-1">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Workload</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-red-600 uppercase tracking-wider">Pending Triage</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">In Progress</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{stats.in_progress}</div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resolved Fixed</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{stats.resolved}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Filter Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Departments</option>
              <option value="PWD">PWD (Roads & Potholes)</option>
              <option value="Solid Waste Mgmt">Solid Waste Mgmt (Garbage)</option>
              <option value="KMC Drainage">KMC Drainage (Flooding)</option>
              <option value="CESC">CESC (Lighting & Power)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID & Evidence</th>
                  <th className="px-4 py-3">Category & Description</th>
                  <th className="px-4 py-3">Assigned Department</th>
                  <th className="px-4 py-3">Citizen Reporter & Karma</th>
                  <th className="px-4 py-3">Current Status (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.image_url || getCategoryFallbackImage(c.category)}
                          alt={c.category}
                          onError={(e) => {
                            e.currentTarget.src = getCategoryFallbackImage(c.category)
                          }}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-100"
                        />
                        <div>
                          <div className="font-mono text-slate-900 font-bold">{c.id.toUpperCase()}</div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {new Date(c.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-sm">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 capitalize">
                        <span>{CATEGORY_ICON[c.category] || '📍'}</span>
                        <span>{c.category}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 line-clamp-2 leading-relaxed font-medium">
                        {c.description}
                      </p>
                      {c.is_duplicate_of && (
                        <span className="inline-block mt-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-1.5 py-0.2 rounded font-bold">
                          ⚡ Duplicate Cluster #{c.is_duplicate_of.toUpperCase()}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md">
                        {c.department}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        👤 {c.reporter_name || 'Citizen'}
                      </div>
                      <div className="text-[10px] font-bold text-amber-700 mt-0.5">
                        ⭐ 450 Civic Credits
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={c.status}
                        onChange={(e) =>
                          handleStatusChange(
                            c.id,
                            e.target.value as 'pending' | 'in_progress' | 'resolved'
                          )
                        }
                        className={`font-bold rounded-lg px-2.5 py-1.5 text-xs border focus:outline-none transition cursor-pointer ${
                          c.status === 'resolved'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : c.status === 'in_progress'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="in_progress">🚧 In Progress</option>
                        <option value="resolved">✅ Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
