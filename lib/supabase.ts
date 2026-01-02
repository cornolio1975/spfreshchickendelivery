import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Removed top-level throw to prevent build failures
if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables are missing. Some features may not work.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
