import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://qflgjlwfzfqspxvwoegs.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_cLH27uFwGi9_QFZwzPb7Ag_xuvtRbqW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
