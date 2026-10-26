import React, { useState } from 'react';
import { LegalNavPills } from '../components/LegalNavPills';

interface KullaniciSozlesmesiScreenProps {
  onNavigate?: (path: string) => void;
}

export const KullaniciSozlesmesiScreen: React.FC<KullaniciSozlesmesiScreenProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="w-full pt-16 bg-surface flex-1"><div className="flex flex-col w-full">
{/*  Subtle decorative ambient glow container  */}
<div className="relative w-full overflow-hidden">
<div className="absolute -top-40 right-1/4 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-primary-container/15 via-tertiary-container/5 to-transparent blur-[120px] pointer-events-none -z-10"></div>
<div className="absolute top-1/2 -left-48 w-[400px] h-[400px] rounded-full bg-secondary-container/10 blur-[100px] pointer-events-none -z-10"></div>
{/*  Header Section with Metadata & Legal Navigation Tabs  */}
<div className="w-full px-margin-mobile md:px-margin pt-space-lg md:pt-space-2xl pb-space-lg">
<div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
{/*  Breadcrumb / Overline Info  */}
<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
<span className="material-symbols-outlined text-primary-container text-[18px]">gavel</span>
<span>Yasal Protokoller</span>
<span className="text-outline-variant">/</span>
<span className="text-primary font-bold">Kullanım Koşulları &amp; Sözleşme</span>
</div>
<div className="flex items-center gap-space-sm flex-wrap">
<div className="flex items-center gap-space-2xs bg-surface-container-low px-space-md py-space-2xs rounded-full">
<span className="material-symbols-outlined text-primary text-[14px]">history</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Son Güncelleme: <span className="text-on-surface font-semibold">14 Mayıs 2025</span></span>
</div>
<div className="flex items-center gap-space-2xs bg-secondary-container/40 px-space-md py-space-2xs rounded-full">
<span className="w-2 h-2 rounded-full bg-primary-container inline-block animate-pulse"></span>
<span className="font-label-sm text-label-sm text-primary tracking-wider font-bold">SÜRÜM v2.2</span>
</div>
</div>
</div>
{/*  Main Title & Editorial Deck  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div className="max-w-3xl flex flex-col gap-space-xs">
<h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
              Kullanıcı Sözleşmesi <span className="text-primary font-light">&amp;</span> Koşullar
            </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Duel Arena bünyesindeki <strong className="text-primary">Harfbaz</strong> ve <strong className="text-primary">Veto</strong> rekabet modlarına dahil olmadan önce tarafların haklarını, adil oyun kurallarını ve hukuki sınırları içeren resmi direktifler.
            </p>
</div>
{/*  Document Action Buttons  */}
<div className="flex items-center gap-space-xs self-start md:self-auto">
<button aria-label="Metni Yazdır" className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md px-space-md py-space-xs rounded-full transition-colors shadow-sm" id="printDocBtn" onClick={handlePrint} type="button">
<span className="material-symbols-outlined text-[18px]">print</span>
<span>Yazdır</span>
</button>
<button aria-label="Bağlantıyı Kopyala" className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md px-space-md py-space-xs rounded-full transition-colors shadow-sm" id="copyShareBtn" onClick={handleShare} type="button">
<span className="material-symbols-outlined text-[18px]">share</span>
<span id="copyBtnText">Paylaş</span>
</button>
</div>
</div>
{/*  Legal Navigation Tabs (Strictly Pill-Styled)  */}
<LegalNavPills activeTab="kullanici-sozlesmesi" onNavigate={onNavigate} />
</div>
</div>
{/*  Search / Interactive Filter Banner  */}
<div className="w-full px-margin-mobile md:px-margin mb-space-xl">
<div className="max-w-7xl mx-auto bg-surface-container p-space-md md:p-space-lg rounded-xl flex flex-col md:flex-row items-center justify-between gap-space-md shadow-md">
<div className="relative w-full md:max-w-lg">
<span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
<input className="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md pl-11 pr-space-md py-space-xs rounded-lg outline-none focus:ring-2 focus:ring-primary-container transition-all" id="termsSearchInput" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Maddelerde ara (örn: ban, elo cezası, bot, veto, tdk)..." type="text"/>
</div>
<div className="flex items-center gap-space-xs w-full md:w-auto overflow-x-auto">
<span className="font-label-sm text-label-sm text-outline whitespace-nowrap uppercase tracking-wider">Hızlı Filtre:</span>
<button className="filter-pill bg-primary text-on-primary font-label-sm text-label-sm px-space-md py-space-2xs rounded-full transition-colors whitespace-nowrap" data-filter="all" type="button">Tümü</button>
<button className="filter-pill bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm px-space-md py-space-2xs rounded-full transition-colors whitespace-nowrap" data-filter="fairplay" type="button">Fair-Play &amp; Ban</button>
<button className="filter-pill bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm px-space-md py-space-2xs rounded-full transition-colors whitespace-nowrap" data-filter="account" type="button">Hesap &amp; Güvenlik</button>
<button className="filter-pill bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm px-space-md py-space-2xs rounded-full transition-colors whitespace-nowrap" data-filter="intellectual" type="button">Fikri Mülkiyet</button>
</div>
</div>
</div>
{/*  Main Content Grid: Legal Content Body (8 cols) + Sticky Quick Index & Fair-Play Panel (4 cols)  */}
<div className="w-full px-margin-mobile md:px-margin pb-space-2xl">
<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
{/*  Left: Sticky Quick Navigation & Summary Box (LG: 4 Cols)  */}
<aside className="lg:col-span-4 flex flex-col gap-space-lg order-2 lg:order-1">
{/*  Summary Quick Index  */}
<div className="bg-surface-container-low p-space-lg rounded-xl shadow-md flex flex-col gap-space-md sticky top-20">
<div className="flex items-center justify-between pb-space-xs">
<span className="font-title-md text-title-md text-on-surface flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary-container text-[20px]">format_list_numbered</span>
                Madde Dizini
              </span>
<span className="font-label-sm text-label-sm bg-surface-container-highest px-space-xs py-space-2xs rounded text-primary">6 Madde</span>
</div>
<nav className="flex flex-col gap-space-2xs font-body-sm text-body-sm text-on-surface-variant">
<a className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container hover:text-primary transition-colors group" href="#madde-1">
<span className="flex items-center gap-space-xs min-w-0 truncate">
<span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-center leading-5 text-[10px] shrink-0">1</span>
<span className="truncate">Taraflar ve Konu</span>
</span>
<span className="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
</a>
<a className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container hover:text-primary transition-colors group" href="#madde-2">
<span className="flex items-center gap-space-xs min-w-0 truncate">
<span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-center leading-5 text-[10px] shrink-0">2</span>
<span className="truncate">Hesap Oluşturma &amp; Güvenlik</span>
</span>
<span className="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
</a>
<a className="flex items-center justify-between p-space-xs rounded-lg bg-secondary-container/20 text-primary font-semibold transition-colors group" href="#madde-3">
<span className="flex items-center gap-space-xs min-w-0 truncate">
<span className="w-5 h-5 rounded-full bg-primary-container text-on-primary-container font-bold text-center leading-5 text-[10px] shrink-0">3</span>
<span className="truncate">Fair-Play &amp; Ban Politikası</span>
</span>
<span className="material-symbols-outlined text-[16px] text-primary-container">shield</span>
</a>
<a className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container hover:text-primary transition-colors group" href="#madde-4">
<span className="flex items-center gap-space-xs min-w-0 truncate">
<span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-center leading-5 text-[10px] shrink-0">4</span>
<span className="truncate">Fikri Mülkiyet Hakları</span>
</span>
<span className="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
</a>
<a className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container hover:text-primary transition-colors group" href="#madde-5">
<span className="flex items-center gap-space-xs min-w-0 truncate">
<span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-center leading-5 text-[10px] shrink-0">5</span>
<span className="truncate">Kesinti, Bakım &amp; ELO Cezaları</span>
</span>
<span className="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
</a>
<a className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container hover:text-primary transition-colors group" href="#madde-6">
<span className="flex items-center gap-space-xs min-w-0 truncate">
<span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-center leading-5 text-[10px] shrink-0">6</span>
<span className="truncate">Fesih &amp; Hesap Kapatma</span>
</span>
<span className="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
</a>
</nav>
{/*  Quick Metrics Mini Chart: Sanctions Breakdown  */}
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs">
<span className="font-label-md text-label-md text-on-surface">Yaptırım İstatistikleri (Son 30 Gün)</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Otomatik anti-cheat ve kural ihlali aksiyonları:</p>
<div className="flex flex-col gap-space-2xs pt-space-xs">
<div className="flex justify-between font-label-sm text-label-sm">
<span className="text-on-surface-variant">API / Bot İhlalleri (IP Ban)</span>
<span className="text-primary font-bold">142</span>
</div>
<div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full" style={{"width": "72%"}}></div>
</div>
<div className="flex justify-between font-label-sm text-label-sm pt-space-2xs">
<span className="text-on-surface-variant">Haksız Veto Suistimali (-50 ELO)</span>
<span className="text-tertiary font-bold">319</span>
</div>
<div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full bg-tertiary-container rounded-full" style={{"width": "54%"}}></div>
</div>
<div className="flex justify-between font-label-sm text-label-sm pt-space-2xs">
<span className="text-on-surface-variant">Uygunsuz İsim Değişimi</span>
<span className="text-secondary font-bold">88</span>
</div>
<div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full bg-secondary-container rounded-full" style={{"width": "32%"}}></div>
</div>
</div>
</div>
{/*  Support / Legal Inquiries Contact  */}
<div className="bg-surface-container-lowest p-space-md rounded-xl flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary-container text-[24px]">support_agent</span>
<div className="flex flex-col gap-1 min-w-0">
<span className="font-title-md text-title-md text-on-surface">Hukuki İtirazlar</span>
<span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Yaptırım veya sözleşme itirazları için 7 gün içinde <span className="text-primary font-mono select-all">legal@duelarena.gg</span> adresine bilet açabilirsiniz.
                </span>
</div>
</div>
</div>
</aside>
{/*  Right: Legal Clauses Body (LG: 8 Cols)  */}
<main className="lg:col-span-8 flex flex-col gap-space-lg order-1 lg:order-2">
{/*  Section 1: Taraflar ve Konu  */}
<article className="clause-card bg-surface-container-low p-space-lg md:p-space-xl rounded-2xl flex flex-col gap-space-md transition-all shadow-md" data-category="account" id="madde-1">
<div className="flex items-center justify-between flex-wrap gap-space-xs">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold font-title-md text-title-md">
                  01
                </div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Taraflar ve Sözleşmenin Konusu</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-space-2xs rounded">Genel Hüküm</span>
</div>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              İşbu Kullanıcı Sözleşmesi (“Sözleşme”), <strong className="text-on-surface">Duel Arena Gaming Teknolojileri A.Ş.</strong> (“Duel Arena” veya “Platform”) ile Platform üzerinde hesap oluşturan, mobil veya web arayüzleri üzerinden oyun müsabakalarına iştirak eden bireysel oyuncu (“Kullanıcı” veya “Oyuncu”) arasında akdedilmiştir.
            </p>
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs">
<span className="font-title-md text-title-md text-on-surface">1.1. Sözleşmenin Kapsamı</span>
<p className="font-body-md text-body-md text-on-surface-variant">
                Platform tarafından sağlanan rekabetçi kelime oyunları olan <span className="text-primary font-semibold">Harfbaz</span> (hızlı harf türetme &amp; kural eşleşmesi) ve <span className="text-primary font-semibold">Veto</span> (kelime geçerlilik teyidi, stratejik eleme ve hakemlik mekanizması) ile bunlara bağlı ELO sıralama ligleri, lobi sohbetleri ve turnuva organizasyonlarını kapsar.
              </p>
</div>
</article>
{/*  Section 2: Hesap Oluşturma ve Güvenlik  */}
<article className="clause-card bg-surface-container-low p-space-lg md:p-space-xl rounded-2xl flex flex-col gap-space-md transition-all shadow-md" data-category="account" id="madde-2">
<div className="flex items-center justify-between flex-wrap gap-space-xs">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold font-title-md text-title-md">
                  02
                </div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Hesap Oluşturma ve Güvenlik</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-space-2xs rounded">Hesap Şartları</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs">
<span className="material-symbols-outlined text-primary-container text-[24px]">verified_user</span>
<span className="font-title-md text-title-md text-on-surface">13 Yaş Sınırı</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
                  Platformda rekabetçi hesap açmak için en az 13 yaşını doldurmuş olmak şarttır. 13-18 yaş arası kullanıcılar veli onayını beyan etmiş sayılır.
                </p>
</div>
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs">
<span className="material-symbols-outlined text-primary-container text-[24px]">alternate_email</span>
<span className="font-title-md text-title-md text-on-surface">Gerçek E-Posta</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
                  Tek kullanımlık (temp-mail) e-posta adresleriyle açılan hesaplar güvenlik algoritmaları tarafından tespit edilerek derhal pasife alınır.
                </p>
</div>
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs">
<span className="material-symbols-outlined text-primary-container text-[24px]">no_accounts</span>
<span className="font-title-md text-title-md text-on-surface">Hesap Devri Yasağı</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
                  Oyuncu hesabı ve ilişkili ELO puanı şahsa münhasırdır; üçüncü şahıslara kiralanamaz, satılamaz veya ortak kullanıma devredilemez.
                </p>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface-variant pt-space-xs leading-relaxed">
              Kullanıcı, giriş kimlik bilgilerinin gizliliğini korumaktan bizzat sorumludur. Hesabın yetkisiz kullanımı neticesinde doğabilecek ELO kayıpları veya veri ihlallerinde Duel Arena sorumluluk kabul etmez.
            </p>
</article>
{/*  Section 3: VURGULU KART - Davranış Kuralları, Fair-Play ve Hesap Kapatma/Ban Politikası  */}
<article className="clause-card relative bg-secondary-container/40 p-space-lg md:p-space-xl rounded-2xl flex flex-col gap-space-lg shadow-xl overflow-hidden" data-category="fairplay" id="madde-3">
{/*  Background Accent Visual  */}
<div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="flex items-center justify-between flex-wrap gap-space-sm relative z-10">
<div className="flex items-center gap-space-sm">
<div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-title-md text-title-md shadow-md">
                  03
                </div>
<div>
<div className="flex items-center gap-space-xs">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold">Davranış Kuralları, Fair-Play &amp; Ban Politikası</h2>
</div>
<span className="font-label-sm text-label-sm text-primary tracking-wider uppercase font-bold">Sıfır Tolerans &amp; İhlal Yönetmeliği</span>
</div>
</div>
<div className="flex items-center gap-space-xs bg-surface-container-lowest/80 px-space-md py-space-xs rounded-full shadow-sm">
<span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
<span className="font-label-sm text-label-sm text-primary font-bold">Anti-Cheat Aktif</span>
</div>
</div>
<p className="font-body-lg text-body-lg text-on-surface relative z-10 leading-relaxed">
              Duel Arena, zihinsel çeviklik ve dürüst kelime ustalığına dayanır. Platformdaki herhangi bir yapay müdahale veya etik dışı eylem, ekosistemin bütünlüğüne doğrudan saldırı kabul edilir.
            </p>
{/*  Detailed Sub-Rules in Warm Contrast Cards  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md relative z-10">
{/*  Sub 3.1: Toxic / Username  */}
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm">
<div className="flex items-center gap-space-2xs text-primary">
<span className="material-symbols-outlined text-[20px]">badge</span>
<span className="font-title-md text-title-md text-on-surface">3.1. Takma Ad &amp; Nefret Söylemi</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Argo, nefret söylemi, ırkçılık, cinsiyetçilik veya küfür içeren rumuzlar (nickname) sistem tarafından resen değiştirilir. Tekrarında hesap <strong className="text-on-surface font-semibold">süresiz olarak kapatılır</strong>.
                </p>
<div className="mt-auto pt-space-xs">
<span className="inline-block font-label-sm text-label-sm text-secondary bg-surface-container-high px-space-xs py-space-2xs rounded">Yaptırım: Zorunlu Renaming / Perma-Ban</span>
</div>
</div>
{/*  Sub 3.2: Bot & Automation  */}
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm">
<div className="flex items-center gap-space-2xs text-primary">
<span className="material-symbols-outlined text-[20px]">smart_toy</span>
<span className="font-title-md text-title-md text-on-surface">3.2. Bot, Script &amp; API Suistimali</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Harfbaz veya Veto oyunlarında sözlük arama botları, OCR araçları veya web soketlerine direkt müdahale eden yazılımlar kullanan oyuncuların <strong className="text-on-surface font-semibold">tüm ELO puanı sıfırlanır</strong> ve cihaz/IP engeli uygulanır.
                </p>
<div className="mt-auto pt-space-xs">
<span className="inline-block font-label-sm text-label-sm text-primary-container bg-surface-container-high px-space-xs py-space-2xs rounded">Yaptırım: ELO Sıfırlama + IP Ban</span>
</div>
</div>
{/*  Sub 3.3: Veto Abuse  */}
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm">
<div className="flex items-center gap-space-2xs text-primary">
<span className="material-symbols-outlined text-[20px]">rule</span>
<span className="font-title-md text-title-md text-on-surface">3.3. Kasti Haksız Veto İtirazı</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Veto modunda rakip oyuncunun TDK standartlarına tamamen uygun kelimesini sırf zaman kazanmak veya rakibi provoke etmek amacıyla kasıtlı olarak haksız yere veto eden oyunculara <strong className="text-on-surface font-semibold">-50 ELO ve 24 saat kısıtlama</strong> verilir.
                </p>
<div className="mt-auto pt-space-xs">
<span className="inline-block font-label-sm text-label-sm text-tertiary bg-surface-container-high px-space-xs py-space-2xs rounded">Yaptırım: -50 ELO &amp; Geçici Lobi Men</span>
</div>
</div>
</div>
{/*  Warning Notice Quote  */}
<div className="bg-surface-container-lowest/90 p-space-md rounded-xl flex items-start gap-space-sm relative z-10">
<span className="material-symbols-outlined text-primary-container text-[26px] shrink-0">warning</span>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
<strong className="text-on-surface">Önemli Hukuki İhtar:</strong> Otomasyon yazılımları geliştirerek platformun sunucu altyapısına DoS/DDoS riski oluşturan ya da sözlük veritabanını izinsiz çeken (scraping) bireyler hakkında Türk Ceza Kanunu Md. 243-244 uyarınca Bilişim Suçları kapsamında yasal işlem başlatılacaktır.
              </p>
</div>
</article>
{/*  Section 4: Fikri Mülkiyet Hakları  */}
<article className="clause-card bg-surface-container-low p-space-lg md:p-space-xl rounded-2xl flex flex-col gap-space-md transition-all shadow-md" data-category="intellectual" id="madde-4">
<div className="flex items-center justify-between flex-wrap gap-space-xs">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold font-title-md text-title-md">
                  04
                </div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Fikri Mülkiyet Hakları</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-space-2xs rounded">Telif &amp; Patent</span>
</div>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Duel Arena yazılımı, Harfbaz oyun mantığı, Veto strateji algoritması, grafik arayüzleri, ses tasarımları, animasyonlar ve derlenmiş kelime doğrulama veritabanı Duel Arena Gaming Teknolojileri A.Ş.'nin münhasır fikri mülkiyetindedir.
            </p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-2xs">
<div className="flex items-center gap-space-2xs">
<span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
<span className="font-title-md text-title-md text-on-surface">TDK Entegrasyonu &amp; Kelime Dizini</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Türk Dil Kurumu (TDK) Güncel Türkçe Sözlük standartları baz alınarak oluşturulan morfolojik kelime filtreleri ve puanlama ağırlıkları Duel Arena’ya aittir. Kısmen veya tamamen kopyalanamaz.
                </p>
</div>
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-2xs">
<div className="flex items-center gap-space-2xs">
<span className="material-symbols-outlined text-primary text-[20px]">code</span>
<span className="font-title-md text-title-md text-on-surface">Tersine Mühendislik Yasağı</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Kullanıcı, platform kaynak kodlarını kopyalayamaz, decompile edemez, klonlayamaz veya üçüncü taraf ticari oyun projelerinde türev ürün olarak kullanamaz.
                </p>
</div>
</div>
</article>
{/*  Section 5: Hizmet Kesintisi ve Sorumluluk Sınırları  */}
<article className="clause-card bg-surface-container-low p-space-lg md:p-space-xl rounded-2xl flex flex-col gap-space-md transition-all shadow-md" data-category="fairplay" id="madde-5">
<div className="flex items-center justify-between flex-wrap gap-space-xs">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold font-title-md text-title-md">
                  05
                </div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Hizmet Kesintisi ve Sorumluluk Sınırları</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-space-2xs rounded">Teknik Şartlar</span>
</div>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Duel Arena, rekabetçi sunucularının kesintisiz ve hatasız çalışması için azami özeni gösterir; ancak telekomünikasyon altyapısı, ISP sağlayıcıları veya mücbir sebeplerden ötürü kesintiler yaşanabilir.
            </p>
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary-container text-[20px]">timer_off</span>
<span className="font-title-md text-title-md text-on-surface">Müsabakadan Erken Ayrılma (Rage Quit) Kuralı</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Bir müsabaka başladıktan sonra oyuncunun kendi isteğiyle veya bireysel internet bağlantısının kesilmesi sebebiyle oyunu terk etmesi durumunda:
              </p>
<ul className="flex flex-col gap-space-2xs font-body-sm text-body-sm text-on-surface pl-space-md list-disc marker:text-primary">
<li>Oyuncuya anında <strong className="text-primary">-15 ELO puanı</strong> ceza olarak yansıtılır.</li>
<li>Müsabaka rakip oyuncu lehine "Hükmen Galibiyet" (+18 ELO) olarak tescil edilir.</li>
<li>Planlı sunucu bakımları en az 2 saat öncesinde sistem bildirim çubuğu üzerinden ilan edilir ve bu süre zarfında ranked lobiler kilitlenir.</li>
</ul>
</div>
</article>
{/*  Section 6: Fesih ve Hesap Kapatma  */}
<article className="clause-card bg-surface-container-low p-space-lg md:p-space-xl rounded-2xl flex flex-col gap-space-md transition-all shadow-md" data-category="account" id="madde-6">
<div className="flex items-center justify-between flex-wrap gap-space-xs">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold font-title-md text-title-md">
                  06
                </div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Fesih ve Hesap Kapatma</h2>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-space-2xs rounded">Hesap Sonu</span>
</div>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Kullanıcı dilediği an Platform içindeki <strong className="text-on-surface">Profil → Güvenlik → Hesabımı Sil</strong> menüsü aracılığıyla veya yazılı talep ile üyeliğini ve ilişkili oyun kayıtlarını sonlandırabilir.
            </p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-2xs">
<span className="font-title-md text-title-md text-on-surface">Veri Tasfiyesi</span>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Hesap kapatıldığında KVKK uyarınca kişisel kimlik verileri 30 gün içinde geri döndürülemez şekilde anonimleştirilir veya silinir.
                </p>
</div>
<div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-2xs">
<span className="font-title-md text-title-md text-on-surface">Turnuva Sıralamaları</span>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Tamamlanmış geçmiş turnuvaların ve maç arşivlerinin istatistiksel sonuçları lig bütünlüğü açısından "Anonim Oyuncu" sıfatıyla korunur.
                </p>
</div>
</div>
</article>
{/*  Acceptance Banner / Bottom Confirmation Box  */}
<div className="bg-surface-container p-space-lg md:p-space-xl rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-space-lg shadow-xl">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[28px]">handshake</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-title-md text-on-surface">Sözleşmeyi Kabul Etmiş Sayılırsınız</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Duel Arena lobilerine giriş yaptığınızda yukarıdaki tüm kuralları koşulsuz kabul edersiniz.</span>
</div>
</div>
<div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
<a className="bg-primary-container text-on-primary-container hover:bg-tertiary-container font-label-md text-label-md font-bold px-space-xl py-space-sm rounded-full transition-all shadow-[0_4px_16px_rgba(241,112,14,0.3)] whitespace-nowrap text-center" onClick={(e) => { e.preventDefault(); onNavigate?.("ortak-portal"); }} href="#">
                Arenaya Dön &amp; Oyna
              </a>
</div>
</div>
</main>
</div>
</div>
</div>
{/*  Interactive Search & Filtering Vanilla Script  */}

</div></main>
  );
};

export default KullaniciSozlesmesiScreen;
