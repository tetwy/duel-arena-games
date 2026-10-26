import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DuelArenaHeader } from './components/DuelArenaHeader';
import { DuelArenaFooter } from './components/DuelArenaFooter';

// 12 Stitch UI Screens
import { OrtakGiriPortalScreen } from './ui_screens/OrtakGiriPortalScreen';
import { VetoNasilOynanirScreen } from './ui_screens/VetoNasilOynanirScreen';
import { VetoTakimLobisiScreen } from './ui_screens/VetoTakimLobisiScreen';
import { VetoCanliDuelloScreen } from './ui_screens/VetoCanliDuelloScreen';
import { VetoSampiyonlukScreen } from './ui_screens/VetoSampiyonlukScreen';
import { HarfbazProfilLobiScreen } from './ui_screens/HarfbazProfilLobiScreen';
import { HarfbazBeklemeOdasiScreen } from './ui_screens/HarfbazBeklemeOdasiScreen';
import { HarfbazCanliOyunScreen } from './ui_screens/HarfbazCanliOyunScreen';
import { HarfbazOylamaVetoScreen } from './ui_screens/HarfbazOylamaVetoScreen';
import { HarfbazLiderlikPodyumScreen } from './ui_screens/HarfbazLiderlikPodyumScreen';
import { DuelArenaCikisOnayModal } from './ui_screens/DuelArenaCikisOnayModal';
import { DuelArena404Screen } from './ui_screens/DuelArena404Screen';

// Legal & Auth Screens
import { KvkkAydinlatmaScreen } from './ui_screens/KvkkAydinlatmaScreen';
import { KullaniciSozlesmesiScreen } from './ui_screens/KullaniciSozlesmesiScreen';
import { CerezPolitikasiScreen } from './ui_screens/CerezPolitikasiScreen';
import { KayitVeCerezBildirimiScreen } from './ui_screens/KayitVeCerezBildirimiScreen';

// Canonical English Routes & Backwards-Compatible Aliases
const ROUTE_ALIASES: Record<string, string> = {
  // English canonical routes
  'portal': 'portal',
  'veto-rules': 'veto-rules',
  'veto-lobby': 'veto-lobby',
  'veto-match': 'veto-match',
  'veto-victory': 'veto-victory',
  'veto-leaderboard': 'veto-leaderboard',
  'harfbaz-profile': 'harfbaz-profile',
  'harfbaz-lobby': 'harfbaz-lobby',
  'harfbaz-game': 'harfbaz-game',
  'harfbaz-veto': 'harfbaz-veto',
  'harfbaz-leaderboard': 'harfbaz-leaderboard',
  'leaderboard': 'leaderboard',
  'exit-confirm': 'exit-confirm',
  'privacy-notice': 'privacy-notice',
  'terms-of-service': 'terms-of-service',
  'cookie-policy': 'cookie-policy',
  'register': 'register',
  '404': '404',

  // Turkish & legacy aliases
  '': 'portal',
  'ortak-portal': 'portal',
  'veto-kurallar': 'veto-rules',
  'nasil-oynanir': 'veto-rules',
  'kurallar': 'veto-rules',
  'veto_nas_l_oynan_r_kural_k_lavuzu': 'veto-rules',
  'veto-takim-lobisi': 'veto-lobby',
  'veto-arena': 'veto-lobby',
  'veto': 'veto-lobby',
  'veto_tak_m_d_ello_lobisi_sade_modern': 'veto-lobby',
  'veto-canli-duello': 'veto-match',
  'veto_canl_d_ello_alan_sade_modern': 'veto-match',
  'veto-sampiyonluk': 'veto-victory',
  'veto_ampiyonluk_zafer_sade_modern': 'veto-victory',
  'veto-liderlik-tablosu': 'veto-leaderboard',
  'veto-liderlik': 'veto-leaderboard',
  'harfbaz-profil-lobi': 'harfbaz-profile',
  'harfbaz_profil_lobi_kat_lma': 'harfbaz-profile',
  'harfbaz-bekleme-odasi': 'harfbaz-lobby',
  'harfbaz-arena': 'harfbaz-lobby',
  'harfbaz': 'harfbaz-lobby',
  'harfbaz_bekleme_odas': 'harfbaz-lobby',
  'harfbaz-canli-oyun': 'harfbaz-game',
  'harfbaz_canl_oyun_ekran': 'harfbaz-game',
  'harfbaz-oylama-veto': 'harfbaz-veto',
  'harfbaz_oylama_veto_ekran': 'harfbaz-veto',
  'harfbaz-liderlik-tablosu': 'harfbaz-leaderboard',
  'harfbaz_liderlik_tablosu_podyum': 'harfbaz-leaderboard',
  'liderlik-tablosu': 'leaderboard',
  'liderlik': 'leaderboard',
  'cikis-onay-modal': 'exit-confirm',
  'duel_arena_k_onay_penceresi': 'exit-confirm',
  'kvkk': 'privacy-notice',
  'kvkk-aydinlatma': 'privacy-notice',
  'duel_arena_kvkk_ayd_nlatma_metni': 'privacy-notice',
  'kullanici-sozlesmesi': 'terms-of-service',
  'sozlesme': 'terms-of-service',
  'terms': 'terms-of-service',
  'duel_arena_kullan_c_s_zle_mesi': 'terms-of-service',
  'cerez-politikasi': 'cookie-policy',
  'cerezler': 'cookie-policy',
  'cookies': 'cookie-policy',
  'duel_arena_erez_politikas': 'cookie-policy',
  'kayit-ol': 'register',
  'kayit': 'register',
  'auth': 'register',
  'kayit-cerez-bildirimi': 'register',
  'duel_arena_kay_t_erez_bildirimi_supabase_auth': 'register',
  'duel_arena_404_sayfa_bulunamad': '404'
};

const resolveRoute = (inputPath: string): string => {
  const clean = inputPath.toLowerCase().trim();
  return ROUTE_ALIASES[clean] || (ROUTE_ALIASES[clean.replace(/_/g, '-')] || inputPath);
};

const AppContent: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('portal');
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>(() => {
    return sessionStorage.getItem('duel_arena_room_code') || '#VT-8492';
  });

  const handleSetRoomCode = (newCode: string) => {
    setRoomCode(newCode);
    sessionStorage.setItem('duel_arena_room_code', newCode);
  };

  // Synchronize path with URL Hash
  const syncPathFromHash = useCallback(() => {
    const raw = window.location.hash.replace('#/', '').replace('#', '').trim();
    const [hash, queryStr] = raw.split('?');
    if (queryStr) {
      const params = new URLSearchParams(queryStr);
      const roomParam = params.get('room');
      if (roomParam) {
        const fullCode = roomParam.startsWith('#') ? roomParam : `#${roomParam}`;
        handleSetRoomCode(fullCode);
      }
    }
    const resolved = resolveRoute(hash || 'portal');
    setCurrentPath(resolved);

    // If navigated via legacy alias, sync window hash to clean English path
    if (hash && hash !== resolved) {
      const newHash = queryStr ? `#/${resolved}?${queryStr}` : `#/${resolved}`;
      window.history.replaceState(null, '', newHash);
    }
  }, []);

  useEffect(() => {
    syncPathFromHash();
    window.addEventListener('hashchange', syncPathFromHash);
    window.addEventListener('popstate', syncPathFromHash);
    return () => {
      window.removeEventListener('hashchange', syncPathFromHash);
      window.removeEventListener('popstate', syncPathFromHash);
    };
  }, [syncPathFromHash]);

  const navigateTo = (path: string) => {
    const [basePath, queryStr] = path.split('?');
    const target = resolveRoute(basePath);

    if (queryStr) {
      const params = new URLSearchParams(queryStr);
      const roomParam = params.get('room');
      if (roomParam) {
        const fullCode = roomParam.startsWith('#') ? roomParam : `#${roomParam}`;
        handleSetRoomCode(fullCode);
      }
    }

    const fullTarget = queryStr ? `${target}?${queryStr}` : target;
    window.location.hash = `#/${fullTarget}`;
    setCurrentPath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOutClick = async () => {
    await signOut();
    navigateTo('portal');
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigateTo('portal');
  };

  // Render the requested Stitch screen
  const renderScreen = () => {
    switch (currentPath) {
      case 'portal':
        return <OrtakGiriPortalScreen onNavigate={navigateTo} onSetRoomCode={handleSetRoomCode} />;

      case 'veto-rules':
        return <VetoNasilOynanirScreen onNavigate={navigateTo} />;

      case 'veto-lobby':
        return <VetoTakimLobisiScreen onNavigate={navigateTo} roomCode={roomCode} onSetRoomCode={handleSetRoomCode} />;

      case 'veto-match':
        return <VetoCanliDuelloScreen onNavigate={navigateTo} roomCode={roomCode} />;

      case 'veto-victory':
        return <VetoSampiyonlukScreen onNavigate={navigateTo} roomCode={roomCode} />;

      case 'harfbaz-profile':
        return <HarfbazProfilLobiScreen onNavigate={navigateTo} roomCode={roomCode} onSetRoomCode={handleSetRoomCode} />;

      case 'harfbaz-lobby':
        return <HarfbazBeklemeOdasiScreen onNavigate={navigateTo} roomCode={roomCode} onSetRoomCode={handleSetRoomCode} />;

      case 'harfbaz-game':
        return <HarfbazCanliOyunScreen onNavigate={navigateTo} roomCode={roomCode} />;

      case 'harfbaz-veto':
        return <HarfbazOylamaVetoScreen onNavigate={navigateTo} roomCode={roomCode} />;

      case 'veto-leaderboard':
      case 'harfbaz-leaderboard':
      case 'leaderboard':
        return <HarfbazLiderlikPodyumScreen onNavigate={navigateTo} roomCode={roomCode} />;

      case 'exit-confirm':
        return (
          <DuelArenaCikisOnayModal 
            onNavigate={navigateTo}
            onCancelExit={handleCancelExit}
            onConfirmExit={handleConfirmExit}
          />
        );

      case 'privacy-notice':
        return <KvkkAydinlatmaScreen onNavigate={navigateTo} />;

      case 'terms-of-service':
        return <KullaniciSozlesmesiScreen onNavigate={navigateTo} />;

      case 'cookie-policy':
        return <CerezPolitikasiScreen onNavigate={navigateTo} />;

      case 'register':
        return <KayitVeCerezBildirimiScreen onNavigate={navigateTo} />;

      case '404':
      default:
        return <DuelArena404Screen onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col justify-between selection:bg-primary-container selection:text-on-primary">
      {/* Top Fixed Header */}
      <DuelArenaHeader
        currentPath={currentPath}
        onNavigate={navigateTo}
        playerName={profile.username}
        onProfileClick={() => navigateTo('register')}
        onExitClick={handleSignOutClick}
      />

      {/* Main Content Area */}
      <div className="w-full flex-1">
        {renderScreen()}
      </div>

      {/* Bottom Footer */}
      <DuelArenaFooter onNavigate={navigateTo} />

      {/* Exit Confirmation Modal Overlay if triggered from Header */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg">
            <DuelArenaCikisOnayModal 
              onNavigate={navigateTo}
              onCancelExit={handleCancelExit}
              onConfirmExit={handleConfirmExit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
