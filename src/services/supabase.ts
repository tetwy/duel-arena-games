import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_HARFBAZ_SUPABASE_URL || import.meta.env.VITE_VETO_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_HARFBAZ_SUPABASE_ANON_KEY || import.meta.env.VITE_VETO_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('your-supabase-project') &&
  rawKey &&
  !rawKey.includes('placeholder') &&
  !rawKey.includes('your-supabase-anon-key')
);

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co';
const supabaseKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key';

if (!isSupabaseConfigured) {
  console.info('[SUPABASE] Kimlik bilgileri yapılandırılmamış veya placeholder kullanılıyor. Çevrimdışı/Yerel demo modu aktif.');
}

const safeStorage = {
  getItem: (key: string) => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: (key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

// Tekil Supabase İstemcisi
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: isSupabaseConfigured,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    heartbeatIntervalMs: 5000,
  },
  global: {
    headers: { 'x-client-info': 'unified-arena-games' },
  },
});
