import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder'
  )
}

export type Complaint = {
  id: string
  category: 'pothole' | 'garbage' | 'drain' | 'streetlight'
  description: string | null
  latitude: number
  longitude: number
  image_url: string | null
  status: 'pending' | 'in_progress' | 'resolved'
  department: string | null
  is_duplicate_of: string | null
  reporter_name: string | null
  created_at: string
}

export const CATEGORY_DEPARTMENT: Record<string, string> = {
  pothole: 'PWD',
  garbage: 'Solid Waste Mgmt',
  drain: 'KMC Drainage',
  streetlight: 'CESC',
}
