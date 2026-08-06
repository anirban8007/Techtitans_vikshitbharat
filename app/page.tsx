'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { CATEGORY_DEPARTMENT, Complaint } from '@/lib/supabase'
import { createComplaint } from '@/lib/dataService'

const CATEGORIES = [
  { value: 'pothole', label: '🕳️ Pothole', icon: '🕳️', desc: 'Road craters, tarmac cracks', dept: 'PWD' },
  { value: 'garbage', label: '🗑️ Garbage Waste', icon: '🗑️', desc: 'Overflowing bins, dumping', dept: 'Solid Waste Mgmt' },
  { value: 'drain', label: '💧 Drain Overflow', icon: '💧', desc: 'Sewage, waterlogging', dept: 'KMC Drainage' },
  { value: 'streetlight', label: '💡 Streetlight Fault', icon: '💡', desc: 'Dark street, flickering LED', dept: 'CESC Power' },
] as const

type CategoryType = typeof CATEGORIES[number]['value']

export default function ComplaintForm() {
  const [category, setCategory] = useState<CategoryType>('pothole')
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({ lat: 22.5186, lng: 88.3655 })
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedComplaint, setSubmittedComplaint] = useState<{ complaint: Complaint; duplicateCount: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getLocation = () => {
    setLocating(true)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setLocating(false)
        },
        () => {
          // Reliable fallback: Kolkata Central coordinates
          setCoords({ lat: 22.5186, lng: 88.3655 })
          setLocating(false)
        },
        { timeout: 6000 }
      )
    } else {
      setCoords({ lat: 22.5186, lng: 88.3655 })
      setLocating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coords) {
      alert('Please select or capture location')
      return
    }

    setSubmitting(true)

    // Simulate quick intelligent AI triage delay (600ms) for realistic UX
    await new Promise((r) => setTimeout(r, 650))

    try {
      const result = await createComplaint({
        category,
        description: description.trim() || `${CATEGORY_DEPARTMENT[category]} issue reported near current coordinates`,
        latitude: coords.lat,
        longitude: coords.lng,
        image_url: imagePreview,
        reporter_name: name.trim() || 'Citizen (Anonymous)',
      })

      setSubmittedComplaint(result)
      setDescription('')
      setName('')
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
              🏛️
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                CivicConnect
                <span className="text-[10px] uppercase font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live System
                </span>
              </div>
              <p className="text-xs text-slate-400">Citizen Transparency & Smart Redressal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/60 px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <span>📊</span>
              <span>Live Dashboard</span>
            </Link>
            <Link
              href="/admin"
              className="text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-lg transition"
            >
              🔒 Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="max-w-xl w-full mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Report a Civic Issue
          </h1>
          <p className="text-sm text-slate-300 mt-1.5 max-w-md mx-auto">
            Instant AI routing directly to the responsible civic department. Track live resolution on our public map.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6"
        >
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Select Issue Category
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value
                return (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-400/40'
                        : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-lg">{cat.icon}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-indigo-900/60 text-indigo-200' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {cat.dept}
                      </span>
                    </div>
                    <span className="font-semibold text-sm leading-snug">{cat.label.replace(/^[^\s]+\s/, '')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              2. Describe the Problem
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Deep crater on main lane near marketplace, causing traffic slowdown and safety risk..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Photo Upload with Live Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              3. Attach Photo (Optional)
            </label>
            
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-indigo-500/40 bg-slate-900 p-2 flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Issue preview"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <span>✓</span> Photo ready for submission
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {imageFile?.name || 'Uploaded photo'}
                  </p>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-1.5 text-xs text-red-400 hover:text-red-300 font-medium underline"
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-900/80 rounded-xl p-4 text-center transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">📸</div>
                <div className="text-xs font-medium text-slate-300 group-hover:text-indigo-300">
                  Click to upload evidence photo
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">JPG, PNG or Mobile Camera capture</div>
              </div>
            )}
          </div>

          {/* Location & Name Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Location Pin
              </label>
              <button
                type="button"
                onClick={getLocation}
                className="w-full bg-slate-900/80 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2.5 text-xs text-slate-200 flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-400">📍</span>
                  {locating
                    ? 'Capturing GPS...'
                    : coords
                    ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                    : 'Get GPS Location'}
                </span>
                <span className="text-[10px] text-indigo-400 underline font-medium">
                  {locating ? '...' : 'Refresh'}
                </span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonymous Citizen"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Routing to Department & Checking Duplicates...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-xs text-slate-400 hover:text-slate-200 transition inline-flex items-center gap-1"
          >
            <span>View all public complaints & live map</span>
            <span>→</span>
          </Link>
        </div>
      </main>

      {/* Confirmation Modal Popup */}
      {submittedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left relative overflow-hidden animate-scaleUp">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-bold text-white text-base">Complaint Registered</h3>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    Ticket ID: {submittedComplaint.complaint.id.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubmittedComplaint(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Duplicate Notice if nearby report exists */}
            {submittedComplaint.duplicateCount > 0 && (
              <div className="my-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                <span className="text-lg">⚡</span>
                <div className="text-xs text-amber-200">
                  <span className="font-semibold text-amber-300">Nearby match detected: </span>
                  {submittedComplaint.duplicateCount} similar report in this zone. Linked to priority cluster for faster crew dispatch.
                </div>
              </div>
            )}

            {/* Details Box */}
            <div className="my-3.5 space-y-2 text-xs bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
              <div className="flex justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-white capitalize">
                  {submittedComplaint.complaint.category}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Assigned Department:</span>
                <span className="font-semibold text-indigo-300">
                  {submittedComplaint.complaint.department}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Live Status:</span>
                <span className="font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  Pending Verification
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Reporter:</span>
                <span className="text-slate-300">{submittedComplaint.complaint.reporter_name}</span>
              </div>
            </div>

            {/* Photo attached if any */}
            {submittedComplaint.complaint.image_url && (
              <div className="mb-4">
                <div className="text-[11px] text-slate-400 mb-1">Evidence Photo Attached:</div>
                <img
                  src={submittedComplaint.complaint.image_url}
                  alt="Submitted evidence"
                  className="w-full h-28 object-cover rounded-lg border border-slate-700"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href="/dashboard"
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-2.5 px-4 rounded-xl text-center block text-xs shadow-md transition"
              >
                📍 View Issue On Live Map & Dashboard →
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedComplaint(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-4 rounded-xl text-xs transition"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        Civic Complaint & Transparency Platform · Hackathon 2026 Edition
      </footer>
    </div>
  )
}
