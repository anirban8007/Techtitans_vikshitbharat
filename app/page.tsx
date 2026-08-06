'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CATEGORY_DEPARTMENT, Complaint } from '@/lib/supabase'
import { createComplaint, getCitizenProfile, CitizenProfile, getCategoryFallbackImage } from '@/lib/dataService'

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
  const [citizen, setCitizen] = useState<CitizenProfile | null>(null)
  const [submittedComplaint, setSubmittedComplaint] = useState<{
    complaint: Complaint
    duplicateCount: number
    creditsEarned: number
    updatedCitizen: CitizenProfile
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const profile = getCitizenProfile()
    setCitizen(profile)
    setName(profile.name)

    const handleCitizenUpdate = () => setCitizen(getCitizenProfile())
    window.addEventListener('civic_citizen_updated', handleCitizenUpdate)
    return () => window.removeEventListener('civic_citizen_updated', handleCitizenUpdate)
  }, [])

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
    await new Promise((r) => setTimeout(r, 650))

    try {
      const result = await createComplaint({
        category,
        description: description.trim() || `${CATEGORY_DEPARTMENT[category]} issue reported near current coordinates`,
        latitude: coords.lat,
        longitude: coords.lng,
        image_url: imagePreview,
        reporter_name: name.trim() || citizen?.name || 'Citizen (Anonymous)',
      })

      setSubmittedComplaint(result)
      setCitizen(result.updatedCitizen)
      setDescription('')
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* 30% Secondary: Dark Navy Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-md text-white">
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

          <div className="flex items-center gap-2.5">
            {/* Citizen Karma Points Pill */}
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

            <Link
              href="/dashboard"
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin"
              className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-lg transition"
            >
              🔒 Admin
            </Link>
          </div>
        </div>
      </header>

      {/* 60% Dominant: Clean Off-White Main Content */}
      <main className="max-w-xl w-full mx-auto px-4 py-8 flex-1">
        {/* Civic Reward Callout */}
        {citizen && (
          <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl text-amber-600">
                🎁
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Earn Civic Rewards</span>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                    +75 Credits per report
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Submit verified issues to level up your community rank!
                </div>
              </div>
            </div>
            <div className="text-right pl-2 border-l border-slate-100">
              <div className="text-xs font-extrabold text-amber-600">⭐ {citizen.credits} pts</div>
              <div className="text-[10px] text-slate-400">{citizen.level.split('·')[0]}</div>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a Civic Issue
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-md mx-auto">
            Direct AI triage to municipal departments. Track repairs in real-time on our public map.
          </p>
        </div>

        {/* Form Card (White with crisp shadow) */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-lg space-y-5"
        >
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
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
                    className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-sm ring-2 ring-blue-600/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-lg">{cat.icon}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat.dept}
                      </span>
                    </div>
                    <span className="font-bold text-sm leading-snug">{cat.label.replace(/^[^\s]+\s/, '')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Describe the Problem
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Deep crater on main road near crossing, causing heavy traffic and risk for two-wheelers..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Photo Upload with Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Attach Photo Evidence
              </label>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                +25 Bonus Credits
              </span>
            </div>
            
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-blue-300 bg-blue-50/50 p-2.5 flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Issue preview"
                  onError={(e) => {
                    e.currentTarget.src = getCategoryFallbackImage(category)
                  }}
                  className="w-20 h-20 object-cover rounded-lg border border-slate-300 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span>✓</span> Photo ready (+25 bonus credits)
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                    {imageFile?.name || 'Uploaded evidence photo'}
                  </p>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-1.5 text-xs text-red-600 hover:text-red-700 font-semibold underline"
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-4 text-center transition group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="text-2xl mb-1 group-hover:scale-105 transition-transform">📸</div>
                <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600">
                  Click to upload evidence photo
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">JPG, PNG or Mobile Camera photo</div>
              </div>
            )}
          </div>

          {/* Location & Name Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location Pin
              </label>
              <button
                type="button"
                onClick={getLocation}
                className="w-full bg-slate-50 border border-slate-300 hover:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-slate-800 flex items-center justify-between transition font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-blue-600">📍</span>
                  {locating
                    ? 'Capturing GPS...'
                    : coords
                    ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                    : 'Get GPS Location'}
                </span>
                <span className="text-[10px] text-blue-600 font-bold underline">
                  {locating ? '...' : 'Refresh'}
                </span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Citizen Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Citizen Name"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* 10% Accent: Vibrant Blue Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Routing to Department & Awarding Credits...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Submit Complaint & Claim Rewards</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition inline-flex items-center gap-1"
          >
            <span>View public complaints & live map</span>
            <span>→</span>
          </Link>
        </div>
      </main>

      {/* Confirmation Modal Popup */}
      {submittedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left relative overflow-hidden animate-scaleUp">
            {/* Reward Notification Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="text-xs font-extrabold text-amber-800">
                    +{submittedComplaint.creditsEarned} Civic Karma Credits Awarded!
                  </div>
                  <div className="text-[11px] text-amber-700">
                    New Balance: <span className="font-extrabold text-slate-900">⭐ {submittedComplaint.updatedCitizen.credits} pts</span> ({submittedComplaint.updatedCitizen.level.split('·')[0]})
                  </div>
                </div>
              </div>
              <span className="text-lg">{submittedComplaint.updatedCitizen.badge.split(' ')[0]}</span>
            </div>

            {/* Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Complaint Registered</h3>
                  <p className="text-[11px] text-blue-600 font-mono font-bold">
                    Ticket ID: {submittedComplaint.complaint.id.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubmittedComplaint(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Duplicate Notice if nearby report exists */}
            {submittedComplaint.duplicateCount > 0 && (
              <div className="my-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <span className="text-lg">⚡</span>
                <div className="text-xs text-amber-800">
                  <span className="font-bold">Nearby match detected: </span>
                  {submittedComplaint.duplicateCount} similar report in this zone. Linked to priority cluster for municipal dispatch.
                </div>
              </div>
            )}

            {/* Details Box */}
            <div className="my-3.5 space-y-2 text-xs bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-900 capitalize">
                  {submittedComplaint.complaint.category}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Assigned Department:</span>
                <span className="font-bold text-blue-700">
                  {submittedComplaint.complaint.department}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Live Status:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Pending Verification
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Citizen Reporter:</span>
                <span className="text-slate-800 font-bold">
                  {submittedComplaint.complaint.reporter_name}
                </span>
              </div>
            </div>

            {/* Photo attached */}
            {submittedComplaint.complaint.image_url && (
              <div className="mb-4">
                <div className="text-[11px] text-slate-500 font-semibold mb-1">Evidence Photo:</div>
                <img
                  src={submittedComplaint.complaint.image_url}
                  alt="Submitted evidence"
                  onError={(e) => {
                    e.currentTarget.src = getCategoryFallbackImage(submittedComplaint.complaint.category)
                  }}
                  className="w-full h-28 object-cover rounded-lg border border-slate-200 bg-white"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href="/dashboard"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-center block text-xs shadow-md transition"
              >
                📍 View Issue On Live Map & Dashboard →
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedComplaint(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs transition border border-slate-200"
              >
                Submit Another Report (+75 Credits)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 30% Secondary: Dark Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 bg-slate-900 border-t border-slate-800">
        Civic Complaint & Transparency Platform · Hackathon 2026 Edition
      </footer>
    </div>
  )
}
