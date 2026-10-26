import React from 'react';
import { Gamepad2 } from 'lucide-react';

interface NavbarProps {
  onPlayClick?: () => void;
  onNavigateSection?: (section: string) => void;
}

/**
 * Supaste Tarzı Notch / Ada Navbar
 * - Üst kenara (top: 0) tam oturan siyah ada gövdesi
 * - Sol ve sağda mükemmel içbükey (inverted radius) SVG geçiş kavisleri
 * - Alt köşelerde pürüzsüz border-radius (rounded-b-[20px])
 * - Zamansız, oyun sayısından bağımsız macOS tarzı 3D parlak Arena amblemi
 * - Minimal gri menü linkleri ve kontrast saf beyaz hap buton
 */
export const Navbar: React.FC<NavbarProps> = ({ onPlayClick, onNavigateSection }) => {
  const scrollToFooter = () => {
    if (onNavigateSection) {
      onNavigateSection('footer');
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none select-none">
      {/* Siyah Ada Gövdesi */}
      <nav className="relative pointer-events-auto bg-[#000000] text-white flex items-center justify-between px-5 sm:px-6 py-2.5 rounded-b-[20px] shadow-[0_14px_40px_rgba(0,0,0,0.9),0_0_28px_rgba(59,130,246,0.18)] border-b border-white/15 sm:border-x sm:border-b">
        
        {/* SOL İÇBÜKEY (INVERTED FILLET) KAVİS SVG */}
        <div className="absolute top-0 right-full w-5 h-5 pointer-events-none overflow-hidden">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20 0 L 0 0 C 11.046 0 20 8.954 20 20 Z" fill="#000000" />
          </svg>
        </div>

        {/* SAĞ İÇBÜKEY (INVERTED FILLET) KAVİS SVG */}
        <div className="absolute top-0 left-full w-5 h-5 pointer-events-none overflow-hidden">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z" fill="#000000" />
          </svg>
        </div>

        {/* 1. SOL: ZAMANSIZ MAC/APP İKONU + MARKA ADI */}
        <div className="flex items-center gap-2.5 pr-6 sm:pr-8">
          {/* macOS Tarzı 3D Parlak Squircle İkon */}
          <div className="relative w-7 h-7 rounded-[8px] overflow-hidden shadow-md flex items-center justify-center shrink-0 bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e40af] border border-white/20">
            {/* Üst Cam Parlama Efekti */}
            <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
            
            {/* Minimalist Beyaz "Arena Delta" Amblemi */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 3L21 20H16.5L12 11.5L7.5 20H3L12 3Z"
                fill="#ffffff"
              />
              <circle cx="12" cy="16.5" r="1.8" fill="#ffffff" />
            </svg>
          </div>

          {/* Marka Adı (Supaste font ağırlığı ve aralığıyla) */}
          <span className="text-[15px] font-bold text-white tracking-tight font-sans">
            Arena
          </span>
        </div>

        {/* 2. ORTA: MİNİMAL MENÜ LİNKLERİ (Masaüstü) */}
        <div className="hidden md:flex items-center gap-6 px-2 text-[13px] font-medium text-[#8f8f94]">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-white font-semibold hover:text-white transition-colors cursor-pointer"
          >
            Oyunlar
          </button>
          <button
            onClick={scrollToFooter}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Topluluk
          </button>
        </div>

        {/* 3. SAĞ: YÜKSEK KONTRASTLI BEYAZ HAP BUTON (Discord Topluluk Linki) */}
        <div className="pl-6 sm:pl-8">
          <a
            href="https://discord.gg/Ta4jQWpfGk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-white hover:bg-slate-100 text-black text-[13px] font-bold tracking-tight transition-all shadow-sm active:scale-95 cursor-pointer no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black shrink-0">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Discord</span>
          </a>
        </div>

      </nav>
    </header>
  );
};
