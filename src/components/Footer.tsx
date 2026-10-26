import React from 'react';
import { BrandLogo } from './BrandLogo';

const DiscordIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

/**
 * Supaste Tarzı Minimal & Prestijli Footer
 * - Sol: Marka logosu, güçlü slogan, açıklama ve Discord CTA butonu
 * - Sağ: Sade ve net 3 sütunlu navigasyon (Oyunlar, Platform, Topluluk)
 * - Alt Zemin: Sayfanın en altında dev soluk "ARENA" watermark tipografisi
 */
export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-[#050609] text-slate-300 pt-20 pb-8 px-6 sm:px-12 md:px-16 border-t border-white/10 select-none overflow-hidden">
      
      {/* ATMOSFERİK IŞIK & DOKU KATMANLARI */}
      {/* 1. Üst Kenar İnce Işık Hattı */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />
      
      {/* 2. Yumuşak Merkez Difüzyon */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59, 130, 246, 0.12), transparent 75%)',
        }}
      />

      {/* 3. Mikro Stüdyo Izgara Deseni */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 80%)',
        }}
      />

      {/* ÜST İÇERİK IZGARASI */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 relative z-10">
        
        {/* SOL BLOK: Marka, Slogan, Açıklama, Discord CTA ve Telif Hakkı (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-8">
          {/* Logo & Platform Rozeti */}
          <div className="flex items-center gap-3">
            <BrandLogo size={32} showText={true} />
            <span className="text-[11px] font-semibold text-slate-300 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 tracking-tight">
              Web & Mobil
            </span>
          </div>

          {/* Tipografik Başlık */}
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mt-6 leading-tight">
            Birlikte oyna.
            <span className="block italic font-serif text-slate-300 font-normal mt-0.5">
              Kazan ya da elen.
            </span>
          </h3>

          {/* Açıklama Metni */}
          <p className="text-sm text-slate-400 mt-4 leading-relaxed max-w-md">
            Arena, arkadaşlarınızla tarayıcı üzerinden kurulumsuz ve tek linkle anında katılabileceğiniz gerçek zamanlı parti ve kelime düelloları platformudur.
          </p>

          {/* Discord CTA Butonu ve Yanında Aynı Hizada Telif Hakkı */}
          <div className="flex flex-wrap items-center gap-6 mt-8">
            <a
              href="https://discord.gg/Ta4jQWpfGk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-black font-bold text-xs tracking-tight transition-all shadow-md active:scale-95 no-underline shrink-0"
            >
              <DiscordIcon size={16} />
              <span>Discord Topluluğuna Katıl</span>
            </a>

            <div className="text-xs text-slate-400">
              © 2026 Arena — Tüm hakları saklıdır.
            </div>
          </div>
        </div>

        {/* SAĞ BLOK: 2 Sade Menü Sütunu (Oyunlar & Topluluk) (lg:col-span-5) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-8 sm:gap-12 pt-2 lg:pl-10">
          
          {/* 1. Sütun: Oyunlar */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white tracking-tight uppercase">
              Oyunlar
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-400 p-0 m-0 list-none">
              <li>
                <button onClick={scrollToTop} className="hover:text-white transition-colors cursor-pointer text-left">
                  Veto <span className="text-[10px] text-fuchsia-400 font-mono">(Tabu)</span>
                </button>
              </li>
              <li>
                <button onClick={scrollToTop} className="hover:text-white transition-colors cursor-pointer text-left">
                  Harfbaz <span className="text-[10px] text-cyan-400 font-mono">(Kelime)</span>
                </button>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] italic">
                  3. Oyun (Yakında)
                </span>
              </li>
            </ul>
          </div>

          {/* 2. Sütun: Topluluk */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-white tracking-tight uppercase">
              Topluluk
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-400 p-0 m-0 list-none">
              <li>
                <a
                  href="https://discord.gg/Ta4jQWpfGk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-slate-400 no-underline"
                >
                  Discord Sunucusu
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/Ta4jQWpfGk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-slate-400 no-underline"
                >
                  Geri Bildirim Bildir
                </a>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </footer>
  );
};
