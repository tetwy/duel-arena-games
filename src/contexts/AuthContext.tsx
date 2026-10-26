import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  eloRating: number;
  totalMatches: number;
  wins: number;
  isGuest: boolean;
  email?: string;
}

interface AuthContextType {
  isSupabaseConfigured: boolean;
  user: User | null;
  session: Session | null;
  profile: UserProfile;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'discord') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<boolean>;
  updateAvatar: (newAvatar: string) => Promise<boolean>;
}

const GUEST_STORAGE_KEY = 'duel_arena_guest_profile';

export function generateUniqueGuest(): UserProfile {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const uniqueId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? `guest_${crypto.randomUUID()}`
    : `guest_${Date.now()}_${randomNum}`;

  const defaultGuest: UserProfile = {
    id: uniqueId,
    username: `Misafir_${randomNum}`,
    avatar: '🎭',
    eloRating: 1200,
    totalMatches: 0,
    wins: 0,
    isGuest: true,
  };

  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(defaultGuest));
  } catch {
    // ignore
  }

  return defaultGuest;
}

export function getInitialGuestProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(GUEST_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Eski formatları otomatik Misafir_ formatına geçir
      if (parsed && parsed.isGuest && (parsed.username?.startsWith('Gladiator#') || parsed.username === 'Oyuncu' || !parsed.username)) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        parsed.username = `Misafir_${randomNum}`;
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch {
    // ignore
  }

  return generateUniqueGuest();
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile>(getInitialGuestProfile);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Profil verisini yükle veya metadata'dan üret
  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      if (!isSupabaseConfigured) {
        return;
      }

      // 1. Önce public.profiles tablosundan çekmeyi dene
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data && !profileErr) {
        setProfile({
          id: data.id,
          username: data.username || currentUser.user_metadata?.username || 'Oyuncu',
          avatar: data.avatar || currentUser.user_metadata?.avatar || '⚔️',
          eloRating: data.elo_rating ?? 1200,
          totalMatches: data.total_matches ?? 0,
          wins: data.wins ?? 0,
          isGuest: false,
          email: currentUser.email,
        });
        return;
      }

      // 2. Tablo henüz yoksa veya satır yoksa metadata'dan al
      const meta = currentUser.user_metadata || {};
      const fallbackProfile: UserProfile = {
        id: currentUser.id,
        username: meta.username || currentUser.email?.split('@')[0] || 'Oyuncu',
        avatar: meta.avatar || '⚔️',
        eloRating: 1200,
        totalMatches: 0,
        wins: 0,
        isGuest: false,
        email: currentUser.email,
      };

      setProfile(fallbackProfile);

      // 3. Tablo varsa profili oluşturmayı dene (arka planda)
      try {
        await supabase.from('profiles').upsert({
          id: currentUser.id,
          username: fallbackProfile.username,
          avatar: fallbackProfile.avatar,
          elo_rating: 1200,
        });
      } catch {
        // Tablo henüz SQL editörde çalıştırılmadıysa sessizce geç
      }
    } catch (err: any) {
      console.warn('[AuthContext] Profil yükleme hatası:', err.message);
    }
  }, []);

  // İlk yükleme ve oturum dinleyici
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured) {
          setLoading(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user);
        }
      } catch (err: any) {
        console.error('[AuthContext] Başlatma hatası:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Dinleyici
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user);
      } else {
        // Çıkış yapıldığında misafir profiline dön
        setProfile(getInitialGuestProfile());
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Kayıt Ol
  const signUp = async (email: string, password: string, username: string, avatar: string = '⚔️') => {
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        // Demo offline kayıt
        const demoUser: UserProfile = {
          id: `demo_${Date.now()}`,
          username: username.trim(),
          avatar,
          eloRating: 1200,
          totalMatches: 0,
          wins: 0,
          isGuest: false,
          email,
        };
        setProfile(demoUser);
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(demoUser));
        return { success: true };
      }

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
            avatar,
          },
        },
      });

      if (signUpErr) {
        setError(signUpErr.message);
        return { success: false, error: signUpErr.message };
      }

      if (data.user) {
        if (!data.session) {
          const { data: signData } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signData?.user) {
            await fetchProfile(signData.user);
            return { success: true };
          }
        }
        await fetchProfile(data.user);
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Kayıt sırasında beklenmeyen bir hata oluştu.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Giriş Yap
  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        const demoUser: UserProfile = {
          id: `demo_${Date.now()}`,
          username: email.split('@')[0] || 'Oyuncu',
          avatar: '⚔️',
          eloRating: 1200,
          totalMatches: 0,
          wins: 0,
          isGuest: false,
          email,
        };
        setProfile(demoUser);
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(demoUser));
        return { success: true };
      }

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr) {
        setError(signInErr.message);
        return { success: false, error: signInErr.message };
      }

      if (data.user) {
        await fetchProfile(data.user);
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Giriş sırasında bir hata oluştu.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // OAuth ile Giriş Yap (Google / Discord)
  const signInWithOAuth = async (provider: 'google' | 'discord') => {
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase bağlantısı yapılandırılmamış' };
      }
      const redirectTo = `${window.location.origin}/`;
      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
      if (oauthErr) throw oauthErr;
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Çıkış Yap (Oturumu Kapat & Yeni Benzersiz Misafir Ata)
  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AuthContext] Çıkış hatası:', err);
    } finally {
      try {
        localStorage.removeItem(GUEST_STORAGE_KEY);
        sessionStorage.removeItem('duel_arena_room_code');
        sessionStorage.removeItem('duel_arena_game_type');
        sessionStorage.removeItem('duel_arena_is_host');
      } catch {
        // ignore
      }
      setUser(null);
      setSession(null);
      const freshGuest = generateUniqueGuest();
      setProfile(freshGuest);
    }
  };

  // Kullanıcı Adı Güncelleme
  const updateUsername = async (newUsername: string) => {
    const trimmed = newUsername.trim();
    if (!trimmed) return false;

    setProfile(prev => {
      const updated = { ...prev, username: trimmed };
      if (prev.isGuest) {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    if (user && isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({
          data: { username: trimmed },
        });
        await supabase.from('profiles').update({ username: trimmed }).eq('id', user.id);
      } catch (err) {
        console.warn('[AuthContext] Username update warning:', err);
      }
    }

    return true;
  };

  // Avatar Güncelleme
  const updateAvatar = async (newAvatar: string) => {
    setProfile(prev => {
      const updated = { ...prev, avatar: newAvatar };
      if (prev.isGuest) {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    if (user && isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({
          data: { avatar: newAvatar },
        });
        await supabase.from('profiles').update({ avatar: newAvatar }).eq('id', user.id);
      } catch (err) {
        console.warn('[AuthContext] Avatar update warning:', err);
      }
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        isSupabaseConfigured,
        user,
        session,
        profile,
        loading,
        error,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        updateUsername,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
