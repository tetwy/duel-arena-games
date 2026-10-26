import React from 'react';

interface DuelArenaFooterProps {
  onNavigate?: (path: string) => void;
}

export const DuelArenaFooter: React.FC<DuelArenaFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-surface-container-lowest mt-space-2xl">
      <div className="w-full px-margin py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-xs text-outline">
          <span className="material-symbols-outlined text-primary-container text-[18px]">sports_esports</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            © 2025 Duel Arena. Rekabetçi Sözcük &amp; Veto Platformu.
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-space-lg gap-y-space-xs">
          <button
            type="button"
            onClick={() => onNavigate?.('veto-rules')}
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Kurallar
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('veto-rules')}
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Nasıl Oynanır?
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('terms-of-service')}
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Kullanıcı Sözleşmesi
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('privacy-notice')}
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            KVKK
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('cookie-policy')}
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Çerez Politikası
          </button>
        </div>
      </div>
    </footer>
  );
};

export default DuelArenaFooter;
