import { createClient } from '@supabase/supabase-js';

import { IS_MOCK_MODE, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/constants/config';
import { ExpoSecureStoreAdapter } from './storage';
import type { Database } from './types';

// In mock mode we still create a client so TypeScript types work everywhere,
// but we point it at a placeholder URL — no real network calls are made
// because services check IS_MOCK_MODE before touching the client.
const url = IS_MOCK_MODE ? 'https://placeholder.supabase.co' : SUPABASE_URL;
const key = IS_MOCK_MODE ? 'placeholder' : SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: !IS_MOCK_MODE,
    persistSession: !IS_MOCK_MODE,
    // Critical for React Native — URL-based session detection breaks on native.
    detectSessionInUrl: false,
  },
});
