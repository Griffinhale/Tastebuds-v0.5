import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ipnapqmthbujbenodphz.supabase.co' // Replace with your Supabase project URL
const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

export default supabase;