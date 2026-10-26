import React, { useState } from 'react';

interface VetoNasilOynanirScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  [key: string]: any;
}

export const VetoNasilOynanirScreen: React.FC<VetoNasilOynanirScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit 
}) => {
  const [activeTab, setActiveTab] = useState<'veto' | 'harfbaz'>('veto');
  return (
    <main className="w-full pt-20 bg-background"><div className="flex flex-col w-full relative min-w-0">
{/*  Subtle ambient glow in background  */}
<div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary-container/10 via-secondary-container/5 to-transparent blur-3xl -z-10"></div>
{/*  Background Layer: Simulated In-Game Arena Interface (Faded Context)  */}
<div className="w-full px-margin py-space-xl opacity-20 pointer-events-none select-none blur-[2px] transition-all duration-300">
<div className="max-w-7xl mx-auto grid grid-cols-12 gap-gutter">
{/*  Arena Stage Left  */}
<div className="col-span-12 lg:col-span-8 flex flex-col gap-space-lg">
<div className="bg-surface-container rounded-xl p-space-xl flex items-center justify-between">
<div className="flex items-center gap-space-md">
<span className="w-4 h-4 rounded-full bg-primary-container animate-ping"></span>
<div>
<p className="font-headline-md text-headline-md text-on-surface">Canlı Tur: 03 / 05</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">Takım A vs Takım B • Veto Modu</p>
</div>
</div>
<div className="px-space-md py-space-xs rounded-full bg-surface-container-high text-primary font-headline-sm text-headline-sm">
            00:42
          </div>
</div>
<div className="h-80 bg-surface-container-low rounded-xl flex items-center justify-center">
<div className="text-center">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">Hedef Kart</span>
<h2 className="font-display-lg text-display-lg text-primary mt-space-xs">KARDELEN</h2>
</div>
</div>
</div>
{/*  Arena Stage Right  */}
<div className="col-span-12 lg:col-span-4 flex flex-col gap-space-md">
<div className="bg-surface-container-low rounded-xl p-space-lg">
<p className="font-title-md text-title-md text-on-surface">Skor Tablosu</p>
<div className="mt-space-md flex flex-col gap-space-xs">
<div className="flex justify-between items-center bg-surface-container p-space-sm rounded-lg">
<span className="font-label-lg text-label-lg text-primary">Kızıl Tilkiler</span>
<span className="font-headline-sm text-headline-sm text-on-surface">14 P</span>
</div>
<div className="flex justify-between items-center bg-surface-container p-space-sm rounded-lg">
<span className="font-label-lg text-label-lg text-on-surface-variant">Gece Kartalları</span>
<span className="font-headline-sm text-headline-sm text-on-surface">11 P</span>
</div>
</div>
</div>
</div>
</div>
</div>
{/*  Knowledge Center / Rule Drawer Backdrop Modal  */}
<div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-space-sm sm:p-space-lg overflow-y-auto" id="ruleModal">
{/*  Drawer Panel Container  */}
<div className="relative w-full max-w-4xl bg-surface-container-low rounded-xl shadow-2xl flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
{/*  Top Glow Stripe  */}
<div className="h-1 w-full bg-gradient-to-r from-secondary-container via-primary-container to-secondary-container"></div>
{/*  Header Section  */}
<div className="px-space-lg sm:px-space-xl pt-space-xl pb-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container/60">
<div className="flex items-start gap-space-md">
<div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary-container shrink-0 shadow-lg shadow-primary-container/10">
<span className="material-symbols-outlined text-[28px]" style={{"fontVariationSettings":"'FILL' 1"}}>menu_book</span>
</div>
<div>
<div className="flex items-center gap-space-xs">
<span className="font-label-sm text-label-sm uppercase tracking-wider px-space-xs py-0.5 rounded-full bg-primary-container/15 text-primary">Kılavuz &amp; Standartlar</span>
<span className="text-outline text-label-sm font-label-sm">• v2.4</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-surface mt-1">Duel Arena Kılavuzu</h1>
</div>
</div>
{/*  Close Trigger  */}
<div className="flex items-center gap-space-sm self-end sm:self-center">
<span className="hidden sm:inline-block font-label-sm text-label-sm text-outline px-space-xs py-1 rounded bg-surface-container-high">ESC</span>
<button 
  className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all group" 
  onClick={() => onNavigate?.('ortak-portal')}
  title="Kapat"
  type="button"
>
<span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">close</span>
</button>
</div>
</div>
{/*  Segmented Pill Tab Switcher  */}
<div className="px-space-lg sm:px-space-xl py-space-md bg-surface-container-lowest/60 flex items-center justify-between flex-wrap gap-space-sm">
<div className="inline-flex p-1 bg-surface-container rounded-full" id="modeTabs">
<button 
  className={`px-space-lg py-space-xs rounded-full font-label-md text-label-md flex items-center gap-space-xs transition-all ${
    activeTab === 'veto'
      ? 'text-on-primary-container bg-primary-container shadow-md shadow-primary-container/25 font-bold'
      : 'text-on-surface-variant hover:text-on-surface'
  }`} 
  id="tabVetoBtn" 
  onClick={() => setActiveTab('veto')} 
  type="button"
>
<span className="material-symbols-outlined text-[16px]">swords</span>
  VETO (Tabu Düellosu)
</button>
<button 
  className={`px-space-lg py-space-xs rounded-full font-label-md text-label-md flex items-center gap-space-xs transition-all ${
    activeTab === 'harfbaz'
      ? 'text-on-primary-container bg-primary-container shadow-md shadow-primary-container/25 font-bold'
      : 'text-on-surface-variant hover:text-on-surface'
  }`} 
  id="tabHarfbazBtn" 
  onClick={() => setActiveTab('harfbaz')} 
  type="button"
>
<span className="material-symbols-outlined text-[16px]">text_fields</span>
  HARFBAZ (İsim-Şehir)
</button>
</div>
<div className="flex items-center gap-space-xs text-outline font-label-sm text-label-sm">
<span className="w-2 h-2 rounded-full bg-primary"></span>
          Resmi Turnuva Kuralları Aktif
        </div>
</div>
{/*  Dynamic Content Body  */}
<div className="p-space-lg sm:p-space-xl flex flex-col gap-space-xl h-[560px] max-h-[62vh] overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
{/*  ==================== VETO CONTENT ====================  */}
<div className={`${activeTab === 'veto' ? 'flex' : 'hidden'} flex-col gap-space-xl animate-in fade-in duration-150`} id="vetoSection">
{/*  Section 1: Temel Amaç & Roller  */}
<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">groups</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">1. Temel Amaç &amp; Saha Rolleri</h3>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">3 Aktif Görev</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
{/*  Anlatıcı  */}
<div className="bg-surface-container p-space-lg rounded-xl flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors">
<div className="flex items-center justify-between">
<span className="px-space-xs py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm">Rol #01</span>
<span className="material-symbols-outlined text-primary text-[20px]">record_voice_over</span>
</div>
<h4 className="font-title-md text-title-md text-on-surface mt-space-2xs">Anlatıcı</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Karttaki hedef terimi, altındaki 5 yasaklı kelimeyi veya köklerini telaffuz etmeden takım arkadaşına aktarır.
                </p>
<div className="mt-auto pt-space-xs flex items-center gap-1 text-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">timer</span>
                  Süre Baskısı
                </div>
</div>
{/*  Tahminci  */}
<div className="bg-surface-container p-space-lg rounded-xl flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors">
<div className="flex items-center justify-between">
<span className="px-space-xs py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-sm text-label-sm">Rol #02</span>
<span className="material-symbols-outlined text-secondary text-[20px]">psychology</span>
</div>
<h4 className="font-title-md text-title-md text-on-surface mt-space-2xs">Tahminci</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Anlatıcının ipuçlarını hızlıca çözerek doğru kelimeyi bulmaya çalışır. Hatalı tahminler için ceza puanı kesilmez.
                </p>
<div className="mt-auto pt-space-xs flex items-center gap-1 text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">all_inclusive</span>
                  Sınırsız Deneme
                </div>
</div>
{/*  Rakip Hakem  */}
<div className="bg-surface-container p-space-lg rounded-xl flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors">
<div className="flex items-center justify-between">
<span className="px-space-xs py-0.5 rounded-full bg-error-container/40 text-error font-label-sm text-label-sm">Rol #03</span>
<span className="material-symbols-outlined text-error text-[20px]">gavel</span>
</div>
<h4 className="font-title-md text-title-md text-on-surface mt-space-2xs">Rakip Hakem</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Ekranı anlık izler; yasaklı kelime, kök veya beden dili ihlalinde kırmızı butona basarak "Veto" ilan eder.
                </p>
<div className="mt-auto pt-space-xs flex items-center gap-1 text-error font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[14px]">block</span>
                  İhlal Denetimi
                </div>
</div>
</div>
</div>
{/*  Section 2: Puanlama Matrisi  */}
<div className="flex flex-col gap-space-md">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">equalizer</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">2. Puanlama Matrisi</h3>
</div>
<div className="bg-surface-container rounded-xl overflow-hidden">
<div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/20">
{/*  Doğru Tahmin  */}
<div className="p-space-lg flex items-start gap-space-md bg-gradient-to-b from-surface-container to-surface-container/60">
<div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">check_circle</span>
</div>
<div>
<span className="font-display-lg text-display-lg text-primary leading-none">+1</span>
<p className="font-title-md text-title-md text-on-surface mt-1">Doğru Tahmin</p>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Kelimeyi kurallara uygun tamamlayan takıma yazılır.</p>
</div>
</div>
{/*  Yasaklı Kelime İhlali  */}
<div className="p-space-lg flex items-start gap-space-md bg-gradient-to-b from-surface-container to-surface-container/60">
<div className="w-10 h-10 rounded-full bg-error-container/30 text-error flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">cancel</span>
</div>
<div>
<span className="font-display-lg text-display-lg text-error leading-none">-1</span>
<p className="font-title-md text-title-md text-on-surface mt-1">Veto İhlali</p>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Yasak kelime söylendiğinde tur puanından düşülür.</p>
</div>
</div>
{/*  Pas Hakkı  */}
<div className="p-space-lg flex items-start gap-space-md bg-gradient-to-b from-surface-container to-surface-container/60">
<div className="w-10 h-10 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">skip_next</span>
</div>
<div>
<span className="font-display-lg text-display-lg text-on-surface leading-none">3 Hak</span>
<p className="font-title-md text-title-md text-on-surface mt-1">Cezasız Pas</p>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Her tur 3 defa puan kaybetmeden kart atlanabilir.</p>
</div>
</div>
</div>
</div>
</div>
{/*  Section 3: İtiraz & Canlı Hakemlik Kuralı  */}
<div className="bg-gradient-to-r from-secondary-container/40 via-surface-container to-surface-container p-space-lg rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
<div className="flex items-start gap-space-md">
<div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-lg shadow-primary-container/20">
<span className="material-symbols-outlined text-[22px]">smart_toy</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<h4 className="font-title-md text-title-md text-on-surface">Yapay Zeka Destekli Hakem Sistemi</h4>
<span className="px-space-2xs py-0.5 rounded bg-primary-container/20 text-primary font-label-sm text-label-sm">Canlı</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xl">
                  Rakip hakemin butonuna basılmasıyla tur anlık duraklar. İtiraz durumunda sistem ses kaydı ve kök türetim analizini 3 saniye içinde TDK veri tabanı ile çapraz doğrulayarak kesin karara bağlar.
                </p>
</div>
</div>
<div className="px-space-md py-space-xs rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm whitespace-nowrap self-stretch md:self-auto text-center">
              %99.4 Doğruluk Güvencesi
            </div>
</div>
{/*  Section 4: Hızlı Kısayol Tuşları  */}
<div className="flex flex-col gap-space-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">keyboard</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">4. Hızlı Kısayol Tuşları (Anlatıcı / Hakem)</h3>
</div>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
<div className="bg-surface-container p-space-md rounded-xl flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<kbd className="px-space-sm py-1 rounded-lg bg-surface-container-high text-on-surface font-title-md text-title-md shadow-inner shadow-black/40">Enter ↵</kbd>
<span className="font-body-md text-body-md text-on-surface font-semibold">Doğru Bildir</span>
</div>
<span className="text-primary font-label-sm text-label-sm">+1 P</span>
</div>
<div className="bg-surface-container p-space-md rounded-xl flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<kbd className="px-space-sm py-1 rounded-lg bg-surface-container-high text-error font-title-md text-title-md shadow-inner shadow-black/40">X</kbd>
<span className="font-body-md text-body-md text-on-surface font-semibold">Veto / İhlal</span>
</div>
<span className="text-error font-label-sm text-label-sm">-1 P</span>
</div>
<div className="bg-surface-container p-space-md rounded-xl flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<kbd className="px-space-sm py-1 rounded-lg bg-surface-container-high text-on-surface font-title-md text-title-md shadow-inner shadow-black/40">Space ␣</kbd>
<span className="font-body-md text-body-md text-on-surface font-semibold">Pas Geç</span>
</div>
<span className="text-outline font-label-sm text-label-sm">3 Hak</span>
</div>
</div>
</div>
</div>
{/*  ==================== HARFBAZ CONTENT (Toggled) ====================  */}
<div className={`${activeTab === 'harfbaz' ? 'flex' : 'hidden'} flex-col gap-space-xl animate-in fade-in duration-150`} id="harfbazSection">
{/*  Harfbaz Intro  */}
<div className="flex flex-col gap-space-md">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">sort_by_alpha</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Harfbaz (İsim-Şehir-Hayvan) Standartları</h3>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div className="bg-surface-container p-space-lg rounded-xl flex flex-col gap-space-xs">
<span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Oyun Döngüsü</span>
<h4 className="font-title-md text-title-md text-on-surface">Rastgele Harf Seçimi</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Her tur başında çark döner ve ortak harf belirlenir. Oyuncular belirlenen süre içinde 10 kategoriyi bu harfle doldurmalıdır.
                </p>
</div>
<div className="bg-surface-container p-space-lg rounded-xl flex flex-col gap-space-xs">
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Erken Durdurma</span>
<h4 className="font-title-md text-title-md text-on-surface">"STOP!" Butonu</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Tüm kategorileri ilk tamamlayan oyuncu 'STOP!' basarak rakipler için 10 saniyelik geri sayımı başlatır. Süre bittiğinde cevaplar kilitlenir.
                </p>
</div>
</div>
</div>
{/*  Harfbaz Scoring  */}
<div className="bg-surface-container rounded-xl p-space-lg flex flex-col gap-space-md">
<h4 className="font-title-md text-title-md text-on-surface">Kategori Puan Dağılımı</h4>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm text-center">
<div className="p-space-md bg-surface-container-high rounded-lg">
<span className="font-display-lg text-display-lg text-primary block">10 P</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">Özgün Kelime</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Sadece sende olan geçerli yanıt.</p>
</div>
<div className="p-space-md bg-surface-container-high rounded-lg">
<span className="font-display-lg text-display-lg text-secondary block">5 P</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">Ortak Kelime</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Başka bir oyuncuyla aynı yanıt.</p>
</div>
<div className="p-space-md bg-surface-container-high rounded-lg">
<span className="font-display-lg text-display-lg text-outline block">0 P</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">Geçersiz / Veto</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Oylamayla reddedilen veya boş cevap.</p>
</div>
</div>
</div>
{/*  Harfbaz Oylama & İtiraz  */}
<div className="bg-surface-container rounded-xl p-space-lg flex flex-col gap-space-md">
<div className="flex items-center gap-space-xs text-primary">
<span className="material-symbols-outlined text-[20px]">how_to_vote</span>
<h4 className="font-title-md text-title-md text-on-surface">Canlı Oylama &amp; Veto Sistemi</h4>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Tur sonunda tüm kelimeler ekrana gelir. Şüpheli veya uydurma kelimeler oyuncular tarafından oylanır. Oy çoğunluğu ile reddedilen kelimeler 0 puan alır.
            </p>
</div>
</div>
</div>
{/*  Drawer Bottom Action Footer  */}
<div className="px-space-lg sm:px-space-xl py-space-lg bg-surface-container-lowest/90 flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-2xl">
<a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-space-xs group order-2 sm:order-1" href="https://sozluk.gov.tr" rel="noopener noreferrer" target="_blank">
<span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">open_in_new</span>
          TDK Güncel Türkçe Sözlük Kurallarını İncele
        </a>
<div className="flex items-center gap-space-sm w-full sm:w-auto order-1 sm:order-2">
<button 
  className="w-full sm:w-auto px-space-xl py-space-xs rounded-full bg-primary-container text-on-primary-container font-label-lg text-label-lg hover:bg-tertiary-container shadow-lg shadow-primary-container/20 transition-all flex items-center justify-center gap-space-xs" 
  onClick={() => onNavigate?.(activeTab === 'harfbaz' ? 'harfbaz-lobby' : 'veto-lobby')} 
  type="button"
>
<span>{activeTab === 'harfbaz' ? 'Anladım, Harfbaz\'a Dön' : 'Anladım, Veto\'ya Dön'}</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
</div>
</main>
  );
};

export default VetoNasilOynanirScreen;
