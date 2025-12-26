
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars:', { supabaseUrl, supabaseKey })
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Testing connection to shops table...')
    console.log('URL:', supabaseUrl)

    const { data, error } = await supabase.from('shops').select('*').limit(1)

    if (error) {
        console.error('Error fetching shops:', error)
        console.error('Message:', error.message)
        console.error('Details:', error.details)
        console.error('Hint:', error.hint)
        console.error('Code:', error.code)
    } else {
        console.log('Success! Found shops:', data)
    }
}

test()
