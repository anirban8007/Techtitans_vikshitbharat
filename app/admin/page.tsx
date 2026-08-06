'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Complaint } from '@/lib/supabase'
import { getStoredComplaints, updateComplaintStatus, resetToSeedData } from '@/lib/dataService'

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

  const reloadData = () => {
    setComplaints(getStoredComplaints())
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
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl shadow-inner">
            🛡️
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Civic Authority Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
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
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30"
            >
              Sign In to Console
            </button>
          </form>

          {/* Quick Demo One-Click Access for judges / video */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setPassInput(ADMIN_PASSCODE)
                setAuthed(true)
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              ⚡ 1-Click Demo Fast Login (techtitans2026)
            </button>
          </div>

          <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-400 block">
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-bounce flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg">
            🛡️
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              Municipal Officer Triage Console
              <span className="text-[10px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-md">
                Admin Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Department Status Updates & Field Dispatch</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetToSeedData()
              reloadData()
              showToast('Reset data successfully')
            }}
            className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            ↺ Reset Data
          </button>
          <Link
            href="/dashboard"
            className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            📊 View Public Map
          </Link>
          <Link
            href="/"
            className="text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition"
          >
            + New Complaint
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4 flex-1">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Total Workload</div>
            <div className="text-2xl font-bold text-white mt-0.5">{stats.total}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-red-400">Pending Triage</div>
            <div className="text-2xl font-bold text-red-400 mt-0.5">{stats.pending}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-amber-400">In Progress</div>
            <div className="text-2xl font-bold text-amber-400 mt-0.5">{stats.in_progress}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-emerald-400">Resolved Fixed</div>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">{stats.resolved}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filter Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
            >
              <option value="all">All Departments</option>
              <option value="PWD">PWD (Roads & Potholes)</option>
              <option value="Solid Waste Mgmt">Solid Waste Mgmt (Garbage)</option>
              <option value="KMC Drainage">KMC Drainage (Flooding)</option>
              <option value="CESC">CESC (Lighting & Power)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID & Evidence</th>
                  <th className="px-4 py-3">Category & Description</th>
                  <th className="px-4 py-3">Assigned Department</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Current Status (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {c.image_url ? (
                          <img
                            src={c.image_url}
                            alt="Evidence"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                            No Pic
                          </div>
                        )}
                        <div>
                          <div className="font-mono text-slate-300 font-bold">{c.id.toUpperCase()}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(c.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-sm">
                      <div className="flex items-center gap-1.5 font-bold text-slate-100 capitalize">
                        <span>{CATEGORY_ICON[c.category] || '📍'}</span>
                        <span>{c.category}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                      {c.is_duplicate_of && (
                        <span className="inline-block mt-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.2 rounded">
                          ⚡ Duplicate Cluster #{c.is_duplicate_of.toUpperCase()}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2 py-1 rounded-md">
                        {c.department}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {c.reporter_name || 'Anonymous'}
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
                        className={`font-semibold rounded-lg px-2.5 py-1.5 text-xs border focus:outline-none transition cursor-pointer ${
                          c.status === 'resolved'
                            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                            : c.status === 'in_progress'
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                            : 'bg-red-950/80 border-red-500/50 text-red-300'
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
