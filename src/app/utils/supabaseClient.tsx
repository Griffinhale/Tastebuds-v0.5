import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ipnapqmthbujbenodphz.supabase.co' 
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
if (!supabaseKey) {
  throw new Error("Missing supabase key")
}
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

export default supabase;