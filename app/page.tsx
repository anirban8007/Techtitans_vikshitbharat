'use client'

import { useState } from 'react'
import { supabase, CATEGORY_DEPARTMENT, isSupabaseConfigured } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'pothole', label: '🕳️ Pothole' },
  { value: 'garbage', label: '🗑️ Garbage' },
  { value: 'drain', label: '💧 Drain Overflow' },
  { value: 'streetlight', label: '💡 Streetlight Fault' },
]

export default function ComplaintForm() {
  const [category, setCategory] = useState('pothole')
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<number>(0)
  const [success, setSuccess] = useState(false)

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        // Fallback for demo if geolocation is denied — center of Kolkata
        setCoords({ lat: 22.5726, lng: 88.3639 })
        setLocating(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coords) {
      alert('Please capture location first')
      return
    }
    if (!isSupabaseConfigured()) {
      alert('⚠️ Missing Supabase configuration.\n\nPlease check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel Project Settings > Environment Variables, and that you trigger a Redeploy on Vercel.')
      return
    }
    setSubmitting(true)

    try {
      // Rule-based duplicate check before inserting
      let dupes: any[] | null = null
      try {
        const { data } = await supabase.rpc('find_duplicates', {
          p_category: category,
          p_lat: coords.lat,
          p_lng: coords.lng,
        })
        dupes = data
      } catch (e) {
        console.warn('Duplicate check error:', e)
      }
      setDuplicateWarning(dupes?.length || 0)

      let image_url: string | null = null
      if (image) {
        try {
          const cleanFileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('complaint-images')
            .upload(cleanFileName, image)
          if (!uploadErr && uploadData) {
            image_url = supabase.storage.from('complaint-images').getPublicUrl(uploadData.path).data.publicUrl
          } else if (uploadErr) {
            console.warn('Storage upload warning:', uploadErr.message)
          }
        } catch (imgErr) {
          console.warn('Storage upload error:', imgErr)
        }
      }

      const { error } = await supabase.from('complaints').insert({
        category,
        description,
        latitude: coords.lat,
        longitude: coords.lng,
        image_url,
        department: CATEGORY_DEPARTMENT[category],
        reporter_name: name || 'Anonymous',
        is_duplicate_of: dupes && dupes.length > 0 ? dupes[0].id : null,
      })

      setSubmitting(false)
      if (!error) {
        setSuccess(true)
        setDescription('')
        setName('')
        setImage(null)
        setCoords(null)
      } else {
        alert('Error submitting: ' + error.message)
      }
    } catch (err: any) {
      setSubmitting(false)
      alert('Error submitting: ' + (err?.message || 'Network error'))
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Complaint submitted</h1>
          {duplicateWarning > 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-4">
              Heads up — {duplicateWarning} similar report{duplicateWarning > 1 ? 's' : ''} nearby, so this was linked as a possible duplicate for faster resolution.
            </p>
          )}
          <p className="text-sm text-slate-500 mb-6">The relevant department has been notified. Track its status on the public dashboard.</p>
          <a href="/dashboard" className="inline-block bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-800">
            View Dashboard
          </a>
          <button onClick={() => setSuccess(false)} className="block w-full mt-3 text-sm text-slate-500 hover:text-slate-700">
            Submit another
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Report a Civic Issue</h1>
          <p className="text-sm text-slate-500 mt-1">Help improve your neighborhood — takes under a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`text-sm px-3 py-2.5 rounded-lg border text-left transition ${
                    category === c.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What's the issue?"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Your name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={getLocation}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 hover:border-slate-300 flex items-center justify-center gap-2"
            >
              {locating ? 'Locating…' : coords ? `📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '📍 Capture my location'}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 text-white text-sm font-medium py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </form>

        <a href="/dashboard" className="block text-center text-sm text-slate-500 hover:text-slate-700 mt-4">
          View public dashboard →
        </a>
      </div>
    </main>
  )
}
