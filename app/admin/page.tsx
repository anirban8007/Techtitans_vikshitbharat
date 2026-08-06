'use client'

import { useEffect, useState } from 'react'
import { supabase, Complaint } from '@/lib/supabase'

const CATEGORY_ICON: Record<string, string> = {
  pothole: '🕳️',
  garbage: '🗑️',
  drain: '💧',
  streetlight: '💡',
}

// NOTE: No real auth for 6hr MVP timeline — a simple shared passcode gate is enough for demo credibility.
// If you have time later, swap this for Supabase Auth.
const ADMIN_PASSCODE = 'techtitans2026'

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [complaints, setComplaints] = useState<Complaint[]>([])

  useEffect(() => {
    if (authed) fetchComplaints()
  }, [authed])

  async function fetchComplaints() {
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false })
    setComplaints(data || [])
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('complaints').update({ status }).eq('id', id)
    fetchComplaints()
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (passInput === ADMIN_PASSCODE) setAuthed(true)
            else alert('Wrong passcode')
          }}
          className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-xs"
        >
          <h1 className="text-lg font-semibold mb-4">Department Login</h1>
          <input
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="Passcode"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3"
          />
          <button className="w-full bg-slate-900 text-white text-sm py-2.5 rounded-lg">Login</button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-6">
      <h1 className="text-lg font-bold text-slate-900 mb-4">Admin — Manage Complaints</h1>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Issue</th>
              <th className="text-left px-4 py-2">Department</th>
              <th className="text-left px-4 py-2">Reported</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  {CATEGORY_ICON[c.category]} {c.description || c.category}
                  {c.is_duplicate_of && <span className="ml-2 text-xs text-amber-600">⚠ duplicate</span>}
                </td>
                <td className="px-4 py-2 text-slate-500">{c.department}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <select
                    value={c.status}
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
