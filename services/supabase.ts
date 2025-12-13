import { createClient } from '@supabase/supabase-js';

// 1. Go to https://supabase.com/dashboard/projects
// 2. Create a new project (No credit card required)
// 3. Go to Project Settings -> API
// 4. Paste the 'URL' and 'anon' public key below

const SUPABASE_URL = ''; // e.g. https://xyz.supabase.co
const SUPABASE_KEY = ''; // e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// If keys are missing, the app will fall back to LocalStorage automatically.
export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;