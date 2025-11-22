import { createClient } from '@supabase/supabase-js';

// ========================================
// Supabase Client Configuration
// ========================================
// ⚠️ This is for local development only in Cursor
// Keys are hardcoded here, NOT stored as environment variables

// TODO: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; // e.g., sb_publishable_...

// Create and export the Supabase client
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // For server-side usage
  },
});

