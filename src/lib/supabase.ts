import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://qflgjlwfzfqspxvwoegs.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_cLH27uFwGi9_QFZwzPb7Ag_xuvtRbqW';

function resolveSupabaseUrl(): string {
  const raw = (import.meta.env.VITE_SUPABASE_URL || '')
    .trim()
    .replace(/^["']|["']$/g, '');
  if (!raw || raw.includes('your-project-id') || raw.includes('MY_')) {
    return DEFAULT_SUPABASE_URL;
  }
  const cleaned = raw.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  return cleaned.startsWith('https://') ? cleaned : DEFAULT_SUPABASE_URL;
}

function resolveSupabaseKey(): string {
  const raw = (import.meta.env.VITE_SUPABASE_ANON_KEY || '')
    .trim()
    .replace(/^["']|["']$/g, '');
  const looksValid =
    raw.startsWith('sb_publishable_') ||
    (raw.startsWith('eyJ') && raw.split('.').length === 3);
  if (!raw || !looksValid || raw.includes('YOUR_SUPABASE') || raw.includes('MY_')) {
    return DEFAULT_SUPABASE_KEY;
  }
  return raw;
}

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_PUBLISHABLE_KEY = resolveSupabaseKey();

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
