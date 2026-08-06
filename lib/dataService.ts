import { Complaint, supabase, isSupabaseConfigured, CATEGORY_DEPARTMENT } from './supabase'

// Real photographic civic evidence images bundled locally in /public/images/
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  pothole: '/images/pothole1.jpg',
  garbage: '/images/garbage1.jpg',
  drain: '/images/drain1.jpg',
  streetlight: '/images/streetlight1.jpg',
}

export function getCategoryFallbackImage(category: string): string {
  return CATEGORY_FALLBACK_IMAGES[category] || '/images/pothole1.jpg'
}

// Citizen Rewards / Credit System
export interface CitizenProfile {
  name: string
  credits: number
  level: string
  reportsCount: number
  badge: string
}

const CITIZEN_KEY = 'civic_citizen_profile_v3'

export const DEFAULT_CITIZEN: CitizenProfile = {
  name: 'Diya Ghosh',
  credits: 450,
  level: 'Level 3 · Civic Champion',
  reportsCount: 8,
  badge: '🏅 Star Citizen',
}

export function getCitizenProfile(): CitizenProfile {
  if (typeof window === 'undefined') return DEFAULT_CITIZEN
  try {
    const saved = localStorage.getItem(CITIZEN_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed.credits === 'number') return parsed
    }
  } catch (e) {}
  try {
    localStorage.setItem(CITIZEN_KEY, JSON.stringify(DEFAULT_CITIZEN))
  } catch (e) {}
  return DEFAULT_CITIZEN
}

export function addCitizenCredits(amount: number): CitizenProfile {
  const current = getCitizenProfile()
  const newCredits = current.credits + amount
  const newReports = current.reportsCount + 1
  
  let newLevel = 'Level 1 · Active Citizen'
  let newBadge = '🌱 Contributor'
  if (newCredits >= 500) {
    newLevel = 'Level 4 · Prime Guardian'
    newBadge = '👑 Civic Leader'
  } else if (newCredits >= 400) {
    newLevel = 'Level 3 · Civic Champion'
    newBadge = '🏅 Star Citizen'
  } else if (newCredits >= 200) {
    newLevel = 'Level 2 · Ward Scout'
    newBadge = '⭐ Verified Reporter'
  }

  const updated: CitizenProfile = {
    ...current,
    credits: newCredits,
    reportsCount: newReports,
    level: newLevel,
    badge: newBadge,
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CITIZEN_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('civic_citizen_updated'))
    } catch (e) {}
  }
  return updated
}

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    category: 'pothole',
    description: 'Large pothole near Gariahat crossing, causing major traffic slowdown during rush hour',
    latitude: 22.5185,
    longitude: 88.3654,
    image_url: '/images/pothole1.jpg',
    status: 'pending',
    department: 'PWD',
    is_duplicate_of: null,
    reporter_name: 'Ritwik Sen',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'c2',
    category: 'pothole',
    description: 'Deep pothole on AJC Bose Road flyover ramp dangerous for two-wheelers',
    latitude: 22.5390,
    longitude: 88.3540,
    image_url: '/images/pothole2.jpg',
    status: 'in_progress',
    department: 'PWD',
    is_duplicate_of: null,
    reporter_name: 'Diya Ghosh',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'c3',
    category: 'garbage',
    description: 'Garbage pile not collected for a week near Lake Market, creating severe stench',
    latitude: 22.5170,
    longitude: 88.3600,
    image_url: '/images/garbage1.jpg',
    status: 'pending',
    department: 'Solid Waste Mgmt',
    is_duplicate_of: null,
    reporter_name: 'Sourav Ghosh',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'c4',
    category: 'garbage',
    description: 'Overflowing bin outside New Market entrance cleared and disinfected',
    latitude: 22.5620,
    longitude: 88.3520,
    image_url: '/images/garbage2.jpg',
    status: 'resolved',
    department: 'Solid Waste Mgmt',
    is_duplicate_of: null,
    reporter_name: 'Priya Das',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
  {
    id: 'c5',
    category: 'drain',
    description: 'Drain overflow flooding pedestrian footpath near Park Circus 7-point crossing',
    latitude: 22.5390,
    longitude: 88.3720,
    image_url: '/images/drain1.jpg',
    status: 'pending',
    department: 'KMC Drainage',
    is_duplicate_of: null,
    reporter_name: 'Arjun Mukherjee',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'c6',
    category: 'drain',
    description: 'Blocked stormwater drain causing waterlogging in Ballygunge Circular Rd',
    latitude: 22.5245,
    longitude: 88.3650,
    image_url: '/images/drain2.jpg',
    status: 'in_progress',
    department: 'KMC Drainage',
    is_duplicate_of: null,
    reporter_name: 'Tanmoy Bose',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'c7',
    category: 'streetlight',
    description: 'Streetlight not functioning outside Rabindra Sadan cultural complex',
    latitude: 22.5430,
    longitude: 88.3520,
    image_url: '/images/streetlight1.jpg',
    status: 'pending',
    department: 'CESC',
    is_duplicate_of: null,
    reporter_name: 'Sneha Chatterjee',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: 'c8',
    category: 'streetlight',
    description: 'Three consecutive high-mast streetlights out near Gol Park rotary',
    latitude: 22.5165,
    longitude: 88.3670,
    image_url: '/images/streetlight2.jpg',
    status: 'pending',
    department: 'CESC',
    is_duplicate_of: null,
    reporter_name: 'Rahul Banerjee',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'c9',
    category: 'pothole',
    description: 'Pothole widening after recent rain near Gariahat crossing',
    latitude: 22.5187,
    longitude: 88.3656,
    image_url: '/images/pothole3.jpg',
    status: 'pending',
    department: 'PWD',
    is_duplicate_of: 'c1',
    reporter_name: 'Debjani Sarkar',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'c10',
    category: 'garbage',
    description: 'Construction debris dumped illegally near Jadavpur 8B bus stand',
    latitude: 22.4990,
    longitude: 88.3710,
    image_url: '/images/garbage3.jpg',
    status: 'pending',
    department: 'Solid Waste Mgmt',
    is_duplicate_of: null,
    reporter_name: 'Kabir Ahmed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'c11',
    category: 'drain',
    description: 'Sewage smell and overflow resolved near Kalighat temple road',
    latitude: 22.5200,
    longitude: 88.3420,
    image_url: '/images/drain3.jpg',
    status: 'resolved',
    department: 'KMC Drainage',
    is_duplicate_of: null,
    reporter_name: 'Moumita Dutta',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
  },
  {
    id: 'c12',
    category: 'streetlight',
    description: 'Flickering LED streetlight pole repaired in Southern Avenue',
    latitude: 22.5090,
    longitude: 88.3550,
    image_url: '/images/streetlight3.jpg',
    status: 'resolved',
    department: 'CESC',
    is_duplicate_of: null,
    reporter_name: 'Vikram Nair',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    id: 'c13',
    category: 'pothole',
    description: 'Multiple road surface craters near Tollygunge metro station exit gate 2',
    latitude: 22.4990,
    longitude: 88.3480,
    image_url: '/images/pothole4.jpg',
    status: 'in_progress',
    department: 'PWD',
    is_duplicate_of: null,
    reporter_name: 'Ishita Chakraborty',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: 'c14',
    category: 'garbage',
    description: 'Garbage accumulation cleared near Behala Tram Depot market area',
    latitude: 22.4930,
    longitude: 88.3140,
    image_url: '/images/garbage4.jpg',
    status: 'resolved',
    department: 'Solid Waste Mgmt',
    is_duplicate_of: null,
    reporter_name: 'Amit Roy',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
]

const STORAGE_KEY = 'civic_complaints_db_v10'

export function getStoredComplaints(): Complaint[] {
  if (typeof window === 'undefined') return INITIAL_COMPLAINTS
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.warn('LocalStorage error:', e)
  }
  // Initialize with seed data
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS))
  } catch (e) {}
  return INITIAL_COMPLAINTS
}

export function saveStoredComplaints(complaints: Complaint[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints))
    // Dispatch custom event for real-time tab updates
    window.dispatchEvent(new Event('civic_complaints_updated'))
  } catch (e) {
    console.warn('LocalStorage save error:', e)
  }
}

// Rule-based geographical duplicate finder (~200 meters)
export function findLocalDuplicates(category: string, lat: number, lng: number): Complaint[] {
  const all = getStoredComplaints()
  return all.filter((c) => {
    if (c.category !== category) return false
    const latDiff = Math.abs(c.latitude - lat)
    const lngDiff = Math.abs(c.longitude - lng)
    return latDiff < 0.002 && lngDiff < 0.002
  })
}

// Add a new complaint + award citizen credits!
export async function createComplaint(data: {
  category: 'pothole' | 'garbage' | 'drain' | 'streetlight'
  description: string
  latitude: number
  longitude: number
  image_url: string | null
  reporter_name?: string
}): Promise<{ complaint: Complaint; duplicateCount: number; creditsEarned: number; updatedCitizen: CitizenProfile }> {
  const current = getStoredComplaints()
  const dupes = findLocalDuplicates(data.category, data.latitude, data.longitude)

  const finalImageUrl = data.image_url || getCategoryFallbackImage(data.category)

  const newComplaint: Complaint = {
    id: 'civic-' + Math.random().toString(36).substring(2, 9),
    category: data.category,
    description: data.description || `${CATEGORY_DEPARTMENT[data.category]} Issue reported`,
    latitude: data.latitude,
    longitude: data.longitude,
    image_url: finalImageUrl,
    status: 'pending',
    department: CATEGORY_DEPARTMENT[data.category] || 'Civic Services',
    is_duplicate_of: dupes.length > 0 ? dupes[0].id : null,
    reporter_name: data.reporter_name || 'Diya Ghosh',
    created_at: new Date().toISOString(),
  }

  // Prepend to local storage so it immediately shows at top of feed & map
  saveStoredComplaints([newComplaint, ...current])

  // Award credits: +50 base + 25 bonus if photo attached
  const creditsEarned = data.image_url ? 75 : 50
  const updatedCitizen = addCitizenCredits(creditsEarned)

  // Try optional Supabase sync in background (never throws or blocks)
  if (isSupabaseConfigured()) {
    try {
      supabase.from('complaints').insert({
        category: newComplaint.category,
        description: newComplaint.description,
        latitude: newComplaint.latitude,
        longitude: newComplaint.longitude,
        image_url: newComplaint.image_url,
        department: newComplaint.department,
        reporter_name: newComplaint.reporter_name,
        is_duplicate_of: newComplaint.is_duplicate_of,
      }).then(() => {})
    } catch (e) {}
  }

  return { complaint: newComplaint, duplicateCount: dupes.length, creditsEarned, updatedCitizen }
}

// Update complaint status (Admin)
export async function updateComplaintStatus(id: string, status: 'pending' | 'in_progress' | 'resolved'): Promise<void> {
  const current = getStoredComplaints()
  const updated = current.map((c) => (c.id === id ? { ...c, status } : c))
  saveStoredComplaints(updated)

  if (isSupabaseConfigured()) {
    try {
      supabase.from('complaints').update({ status }).eq('id', id).then(() => {})
    } catch (e) {}
  }
}

// Reset store to fresh seed data
export function resetToSeedData(): Complaint[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS))
    localStorage.setItem(CITIZEN_KEY, JSON.stringify(DEFAULT_CITIZEN))
    window.dispatchEvent(new Event('civic_complaints_updated'))
    window.dispatchEvent(new Event('civic_citizen_updated'))
  }
  return INITIAL_COMPLAINTS
}
