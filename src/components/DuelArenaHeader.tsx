import React, { useState } from 'react';

interface DuelArenaHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  roomCode?: string;
  playerName?: string;
  onExitClick?: () => void;
  onProfileClick?: () => void;
}

export const DuelArenaHeader: React.FC<DuelArenaHeaderProps> = ({
  currentPath,
  onNavigate,
  playerName = 'Misafir',
  onExitClick,
  onProfileClick,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const isNavActive = (key: string) => {
    const isLeaderboard =
      currentPath.includes('leaderboard') ||
      currentPath.includes('liderlik') ||
      currentPath.includes('podyum') ||
      currentPath.includes('sampiyon') ||
      currentPath.includes('victory');

    if (key === 'leaderboard') {
      return isLeaderboard;
    }
    if (isLeaderboard) {
      return false;
    }
    if (key === 'portal') return currentPath === 'portal' || currentPath === 'ortak-portal' || currentPath === '';
    if (key === 'veto') return currentPath.startsWith('veto');
    if (key === 'harfbaz') return currentPath.startsWith('harfbaz');
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-20 w-full px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg">
          <a 
            className="flex items-center gap-space-xs group cursor-pointer" 
            onClick={(e) => { e.preventDefault(); onNavigate('portal'); }}
            href="#/portal"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_16px_rgba(241,112,14,0.25)]">
              <span className="material-symbols-outlined text-primary text-[22px]">swords</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
                DUEL<span className="text-primary-container ml-1">ARENA</span>
              </span>
              <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase">
                Veto &amp; Harfbaz
              </span>
            </div>
          </a>

          <div className="hidden lg:flex items-center px-space-xs py-space-2xs bg-surface-container rounded-full p-1">
            <nav className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigate('portal')}
                className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                  isNavActive('portal')
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(241,112,14,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
              >
                Ortak Portal
              </button>
              <button
                type="button"
                onClick={() => onNavigate('veto-lobby')}
                className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                  isNavActive('veto')
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(241,112,14,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
              >
                Veto
              </button>
              <button
                type="button"
                onClick={() => onNavigate('harfbaz-lobby')}
                className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                  isNavActive('harfbaz')
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(241,112,14,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
              >
                Harfbaz
              </button>
              <button
                type="button"
                onClick={() => onNavigate('leaderboard')}
                className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                  isNavActive('leaderboard')
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(241,112,14,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
              >
                Liderlik Tablosu
              </button>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
            title="Sesi Aç / Kapat"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          <div 
            onClick={() => onProfileClick ? onProfileClick() : onNavigate('kayit-ol')}
            className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container hover:bg-surface-container-high transition-colors rounded-full cursor-pointer"
            title="Profil & Oturum"
          >
            <span className="font-label-md text-label-md text-on-surface font-semibold max-w-[130px] truncate">
              {playerName}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>

          <button
            onClick={onExitClick}
            className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-error-container/30 text-on-surface-variant hover:text-error flex items-center justify-center transition-colors"
            title="Oturumu Kapat"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DuelArenaHeader;
