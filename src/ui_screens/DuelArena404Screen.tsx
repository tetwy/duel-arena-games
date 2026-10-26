import React, { useState, useRef } from 'react';

interface DuelArena404ScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  [key: string]: any;
}

export const DuelArena404Screen: React.FC<DuelArena404ScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit 
}) => {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!clean) {
      inputRef.current?.focus();
      return;
    }

    sessionStorage.setItem('duel_arena_room_code', `#${clean}`);
    if (clean.startsWith('VT')) {
      onNavigate?.('veto-takim-lobisi');
    } else if (clean.startsWith('HB')) {
      onNavigate?.('harfbaz-bekleme-odasi');
    } else {
      onNavigate?.('ortak-portal');
    }
  };

  const focusInput = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => inputRef.current?.focus(), 200);
  };
  return (
    <main className="w-full pt-20 bg-background"><div className="flex flex-col w-full px-margin py-space-xl items-center relative overflow-hidden">
<div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[620px] h-[340px] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
<div className="absolute top-1/3 -left-48 w-96 h-96 bg-secondary-container/15 rounded-full blur-[100px] pointer-events-none"></div>
<div className="w-full max-w-5xl flex flex-col items-center text-center relative z-10 pt-space-md">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-secondary-container/40 text-primary-container mb-space-lg shadow-sm">
<span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary">Hata Kodu: Arena Dışı Bağlantı</span>
</div>
<div className="relative flex items-center justify-center my-space-xs select-none">
<span className="font-display-lg text-[130px] md:text-[180px] font-extrabold leading-none tracking-tighter text-surface-container-highest/40">
        404
      </span>

</div>
<h1 className="font-display-lg text-display-lg text-on-surface mt-space-md tracking-tight">
      Kelime Bulunamadı! <span className="text-primary-container">(404 - Sayfa Kayıp)</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-sm">
      Aradığınız arena odası kapatılmış, süresi dolmuş veya harfler arasına karışmış olabilir. Arenaya geri dönüp mücadeleye kaldığın yerden devam et.
    </p>
<div className="flex flex-wrap items-center justify-center gap-space-md mt-space-xl">
<a className="inline-flex items-center gap-space-xs px-space-xl py-space-sm rounded-full bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[0_4px_20px_rgba(241,112,14,0.35)] hover:bg-tertiary-container transition-all hover:scale-[1.02] active:scale-[0.98]" data-path="ortak-portal" onClick={(e) => { e.preventDefault(); onNavigate?.('ortak-portal'); }} href="#">
<span className="material-symbols-outlined text-[20px]">home</span>
<span className="">Ana Sayfaya / Portala Dön</span>
</a>
<button 
  onClick={focusInput}
  className="inline-flex items-center gap-space-xs px-space-xl py-space-sm rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg transition-all shadow-sm cursor-pointer" 
  id="focusRoomInput" 
  type="button"
>
<span className="material-symbols-outlined text-primary text-[20px]">vpn_key</span>
<span className="">Oda Kodunu Tekrar Gir</span>
</button>
</div>
<div className="w-full max-w-xl mt-space-2xl p-space-md rounded-2xl bg-surface-container-low shadow-xl">
<div className="flex items-center justify-between gap-space-xs mb-space-sm px-space-xs">
<div className="flex items-center gap-space-xs text-outline">
<span className="material-symbols-outlined text-primary-container text-[18px]">bolt</span>
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">Hızlı Oda Kurtarma</span>
</div>
<span className="font-label-sm text-label-sm text-outline">Örnek: #DA-7429</span>
</div>
<form className="flex flex-col sm:flex-row items-center gap-space-xs" id="quickJoinForm" onSubmit={handleQuickJoin}>
<div className="relative w-full flex-1">
<span className="absolute left-space-md top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-[20px]">tag</span>
<input 
  ref={inputRef}
  value={code}
  onChange={(e) => setCode(e.target.value.toUpperCase())}
  className="w-full h-12 pl-11 pr-space-md bg-surface-container rounded-xl font-label-lg text-label-lg text-on-surface placeholder:text-outline/60 focus:outline-none focus:bg-surface-container-high transition-all uppercase tracking-widest" 
  id="roomCodeInput" 
  maxLength={8} 
  placeholder="#DA-0000" 
  type="text" 
/>
</div>
<button className="w-full sm:w-auto h-12 px-space-xl rounded-xl bg-secondary-container hover:bg-tertiary-container text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-space-xs transition-colors shrink-0 cursor-pointer" type="submit">
<span className="">Hızlı Katıl</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</form>
<div className="hidden mt-space-xs text-left px-space-xs font-body-sm text-body-sm text-primary transition-opacity" id="joinFeedback"></div>
</div>
<div className="w-full mt-space-2xl text-left">
<div className="flex items-center justify-between mb-space-md px-space-xs">
<h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
          Hızlı Varış Noktaları
        </h2>
<span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">Canlı Arenalar</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg md:gap-space-xl w-full">
<a className="group p-space-xl rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-md hover:-translate-y-1" data-path="ortak-portal" onClick={(e) => { e.preventDefault(); onNavigate?.('ortak-portal'); }} href="#">
<div>
<div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-primary-container mb-space-md group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">hub</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-2xs">
              Ortak Giriş Portalı
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
              Veto &amp; Harfbaz arasında dilediğin modu seç, özel oda kur veya arkadaşının lobisine geç.
            </p>
</div>
<div className="flex items-center justify-between mt-space-lg pt-space-md">
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Arenaya Git</span>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">chevron_right</span>
</div>
</a>
<a className="group p-space-xl rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-md hover:-translate-y-1" data-path="veto-arena" onClick={(e) => { e.preventDefault(); onNavigate?.('veto-arena'); }} href="#">
<div>
<div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-primary mb-space-md group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">record_voice_over</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-2xs">
              Veto (Tabu Düellosu)
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
              Yasaklı kelimelere takılmadan takımına anlat, rakipleri veto ederek süreye karşı üstünlük kur.
            </p>
</div>
<div className="flex items-center justify-between mt-space-lg pt-space-md">
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Takım Maçına Gir</span>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">chevron_right</span>
</div>
</a>
<a className="group p-space-xl rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-md hover:-translate-y-1" data-path="harfbaz-arena" onClick={(e) => { e.preventDefault(); onNavigate?.('harfbaz-arena'); }} href="#">
<div>
<div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-tertiary mb-space-md group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">spellcheck</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-2xs">
              Harfbaz (İsim-Şehir)
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
              10 kategoride tek harfle hızını göster. Akıl dolu sözcüklerle puan topla, turları domine et.
            </p>
</div>
<div className="flex items-center justify-between mt-space-lg pt-space-md">
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Düelloya Başla</span>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">chevron_right</span>
</div>
</a>
</div>
</div>
<div className="mt-space-2xl w-full flex items-center justify-center">
<div className="px-space-lg py-space-xs rounded-full bg-surface-container-lowest flex items-center gap-space-sm text-outline shadow-sm">
<div className="flex items-center gap-space-2xs">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Sunucu Durumu: <strong className="text-on-surface font-semibold">Aktif (Central EU - Frankfurt)</strong></span>
</div>
<span className="text-outline-variant">•</span>
<div className="flex items-center gap-space-2xs">
<span className="material-symbols-outlined text-[14px] text-primary">groups</span>
<span className="font-label-sm text-label-sm text-on-surface-variant"><strong className="text-on-surface font-semibold">1.480</strong> Oyuncu Canlı</span>
</div>
</div>
</div>
</div>
</div>
</main>
  );
};

export default DuelArena404Screen;
