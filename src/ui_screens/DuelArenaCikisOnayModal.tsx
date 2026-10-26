import React from 'react';

interface DuelArenaCikisOnayModalProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  [key: string]: any;
}

export const DuelArenaCikisOnayModal: React.FC<DuelArenaCikisOnayModalProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit 
}) => {
  return (
    <main className="w-full pt-20 bg-background"><div className="flex flex-col w-full relative min-h-[calc(100vh-5rem)]">
{/*  DORMANT ACTIVE DUEL ARENA STATE (Background Simulation behind Exit Intent)  */}
<div className="w-full px-margin py-space-lg pointer-events-none select-none filter blur-sm brightness-[0.35] opacity-50 transition-all duration-500">
{/*  Arena Header Bar / Match Dashboard  */}
<div className="grid grid-cols-12 gap-gutter mb-space-lg items-center">
<div className="col-span-12 lg:col-span-8 flex items-center justify-between bg-surface-container-low rounded-xl px-space-lg py-space-md shadow-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[26px]">gavel</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-on-surface">Veto Aşaması // 3. Tur</span>
<span className="font-body-sm text-body-sm text-outline">Kelime Havuzu: Türkçe Edebiyat &amp; Terimler</span>
</div>
</div>
<div className="flex items-center gap-space-sm px-space-md py-space-xs bg-surface-container rounded-full">
<span className="material-symbols-outlined text-primary-container text-[18px]">timer</span>
<span className="font-title-md text-title-md text-primary tracking-wider">00:36</span>
</div>
</div>
<div className="col-span-12 lg:col-span-4 flex items-center justify-end gap-space-md bg-surface-container-low rounded-xl px-space-lg py-space-md">
<div className="flex flex-col text-right">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Müsabaka Derecesi</span>
<span className="font-title-md text-title-md text-primary-container">Elit Kademe · ELO 1,840</span>
</div>
<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined">military_tech</span>
</div>
</div>
</div>
{/*  Live Duel Board Grids  */}
<div className="grid grid-cols-12 gap-gutter">
{/*  Left Clan / Red Team  */}
<div className="col-span-12 md:col-span-6 bg-surface-container-low rounded-xl p-space-xl flex flex-col gap-space-md shadow-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-3 h-3 rounded-full bg-error-container"></span>
<span className="font-title-md text-title-md text-on-surface">Kırmızı Takım (Siz)</span>
</div>
<span className="font-headline-lg text-headline-lg text-primary">18 Puan</span>
</div>
<div className="h-32 bg-surface-container rounded-lg flex items-center justify-center">
<span className="font-body-md text-body-md text-outline">Harf Dizilimi: [K] [A] [R] [A] [M] [B] [O] [L]</span>
</div>
</div>
{/*  Right Clan / Blue Team  */}
<div className="col-span-12 md:col-span-6 bg-surface-container-low rounded-xl p-space-xl flex flex-col gap-space-md shadow-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
<span className="font-title-md text-title-md text-on-surface">Mavi Takım (Rakip)</span>
</div>
<span className="font-headline-lg text-headline-lg text-on-surface-variant">14 Puan</span>
</div>
<div className="h-32 bg-surface-container rounded-lg flex items-center justify-center">
<span className="font-body-md text-body-md text-outline">Kelime Koruması Aktif (2 Veto Hakkı)</span>
</div>
</div>
</div>
</div>
{/*  MODAL BACKDROP (Obsidian atmospheric gradient overlay)  */}
<div className="fixed inset-0 top-20 z-40 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center px-margin-mobile md:px-margin transition-opacity duration-300">
{/*  CENTRAL CONFIRM EXIT DIALOG MODAL  */}
<div aria-labelledby="dialog-title" aria-modal="true" className="relative w-full max-w-xl bg-surface-container-low rounded-2xl p-space-xl md:p-space-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col gap-space-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200" role="dialog">
{/*  Ambient amber warning bloom in modal top corner  */}
<div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
<div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
{/*  MODAL HEADER: Typography  */}
<div className="flex flex-col items-center text-center gap-space-md relative z-10">
{/*  Headline & Impact Description  */}
<div className="flex flex-col gap-space-xs max-w-md">
<span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">Müsabaka Terk Uyarısı</span>
<h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-surface" id="dialog-title">
            Müsabakadan Ayrılmak İstiyor Musunuz?
          </h2>
<p className="font-body-md text-body-md text-outline mt-1 leading-relaxed">
            Devam eden bir maç veya lobiden ayrılmak takımınızın eksik kalmasına ve mevcut tur puanlarınızın silinmesine neden olabilir. Lobi lideriyseniz liderlik sıradaki oyuncuya devredilecektir.
          </p>
</div>
</div>
{/*  MATCH IMPACT SUMMARY CONTAINER  */}
<div className="bg-surface-container rounded-xl p-space-lg flex flex-col gap-space-md relative z-10 shadow-inner">
{/*  Time Remaining Metric (Full Width)  */}
<div className="w-full flex items-center justify-between bg-surface-container-high/60 rounded-lg p-space-md">
<div className="flex items-center gap-space-xs text-outline">
<span className="material-symbols-outlined text-[18px] text-primary-container">hourglass_bottom</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Tur Kalan Süresi</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-wider font-mono">00:36</span>
<span className="w-2 h-2 rounded-full bg-primary-container animate-ping ml-1"></span>
</div>
</div>
</div>
{/*  ACTION BUTTONS (Stacked desktop-focused high-contrast pills)  */}
<div className="flex flex-col sm:flex-row-reverse items-center justify-between gap-space-sm pt-space-xs relative z-10 w-full">
{/*  Primary Button: Stay & Continue Battle (Warm Amber Bloom)  */}
<button 
  className="w-full sm:flex-1 h-12 px-space-md sm:px-space-lg bg-primary-container hover:bg-tertiary-container text-on-primary font-label-lg text-label-lg rounded-full flex items-center justify-center gap-space-xs shadow-[0_4px_20px_rgba(241,112,14,0.35)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap" 
  id="btn-stay-match" 
  onClick={onCancelExit}
  type="button"
>
<span className="material-symbols-outlined text-[20px] shrink-0">sports_esports</span>
<span className="whitespace-nowrap">Mücadeleye Devam Et</span>
</button>
{/*  Secondary Button: Confirm & Leave Lobby (Ghost Obsidian / Hover Red)  */}
<button 
  className="w-full sm:w-auto px-space-md sm:px-space-lg h-12 bg-surface-container-high/40 hover:bg-error-container/30 text-on-surface-variant hover:text-error font-label-md text-label-md rounded-full flex items-center justify-center gap-space-xs transition-colors duration-200 whitespace-nowrap shrink-0" 
  id="btn-confirm-exit" 
  onClick={onConfirmExit}
  type="button"
>
<span className="material-symbols-outlined text-[18px] shrink-0">close</span>
<span className="whitespace-nowrap">Yine de Ayrıl (Lobiyi Terk Et)</span>
</button>
</div>
</div>
</div>
{/*  INTERACTION LOGIC (Escape key, return to arena, or trigger exit)  */}

</div></main>
  );
};

export default DuelArenaCikisOnayModal;
