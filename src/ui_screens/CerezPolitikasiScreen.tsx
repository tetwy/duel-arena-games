import React, { useState } from 'react';
import { LegalNavPills } from '../components/LegalNavPills';

interface CerezPolitikasiScreenProps {
  onNavigate?: (path: string) => void;
}

export const CerezPolitikasiScreen: React.FC<CerezPolitikasiScreenProps> = ({ onNavigate }) => {
  const [functionalActive, setFunctionalActive] = useState(true);
  const [historyActive, setHistoryActive] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleSavePreferences = () => {
    try {
      if (!functionalActive) {
        localStorage.removeItem('duel_sound_enabled');
      }
      if (!historyActive) {
        localStorage.removeItem('duel_room_history');
      }
    } catch (e) {}
    showToast('Çerez ve yerel depolama tercihleri kaydedildi.');
  };

  const handleClearStorage = () => {
    try {
      localStorage.removeItem('duel_sound_enabled');
      localStorage.removeItem('duel_room_history');
    } catch (e) {}
    showToast('Fonksiyonel istemci verileri ve oda geçmişi silindi.');
  };

  return (
    <main className="w-full pt-16 bg-surface flex-1"><div className="flex flex-col w-full">
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
<span className="text-primary font-bold">Çerez Politikası</span>
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
              Çerez Politikası <span className="text-primary font-light">&amp;</span> Yerel Depolama
            </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Duel Arena bünyesindeki Harfbaz ve Veto rekabet modlarında oturum bütünlüğü, anlık senkronizasyon ve kullanıcı tercihleri için kullanılan teknolojilerin resmi direktifleri.
            </p>
</div>
<div className="flex items-center gap-space-xs self-start md:self-auto">
<button aria-label="Metni Yazdır" className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md px-space-md py-space-xs rounded-full transition-colors shadow-sm cursor-pointer" onClick={() => window.print()} type="button">
<span className="material-symbols-outlined text-[18px]">print</span>
<span>Yazdır</span>
</button>
</div>
</div>

{/*  Legal Navigation Tabs (Strictly Pill-Styled)  */}
<LegalNavPills activeTab="cerez-politikasi" onNavigate={onNavigate} />
</div>
</div>
</div>

<div className="w-full px-margin-mobile md:px-margin max-w-7xl mx-auto py-space-xl flex flex-col gap-space-xl">
{/*  Quick Metrics / Trust Highlights (Bento Grid)  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<div className="bg-surface-container-low rounded-xl p-space-lg flex items-start gap-space-md shadow-md">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary-container">
<span className="material-symbols-outlined text-[24px]">block</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-title-md text-on-surface">Sıfır Reklam Takibi</span>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Platformumuzda reklam ağı, Google Ads veya cross-site pazarlama pikselleri yer almaz.</span>
</div>
</div>
<div className="bg-surface-container-low rounded-xl p-space-lg flex items-start gap-space-md shadow-md">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
<span className="material-symbols-outlined text-[24px]">encrypted</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-title-md text-on-surface">Uçtan Uca Oturum</span>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Token tabanlı, şifrelenmiş Supabase JWT doğrulamasıyla kesintisiz düello deneyimi.</span>
</div>
</div>
<div className="bg-surface-container-low rounded-xl p-space-lg flex items-start gap-space-md shadow-md">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-tertiary">
<span className="material-symbols-outlined text-[24px]">tune</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-title-md text-on-surface">Tam Kullanıcı Kontrolü</span>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-1">İstemci tarafındaki ses, tema ve oda geçmişi tercihlerini anında temizleyebilirsiniz.</span>
</div>
</div>
</div>
{/*  Section 1: Overview  */}
<section className="bg-surface-container-low rounded-xl p-space-xl flex flex-col md:flex-row items-center gap-space-xl shadow-md">
<div className="flex-1 flex flex-col gap-space-sm">
<div className="flex items-center gap-space-xs text-primary font-label-sm uppercase tracking-wider">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span>Bölüm 01</span>
</div>
<h2 className="font-headline-md text-headline-md text-on-surface">
            Çerez Nedir ve Neden Kullanıyoruz?
          </h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Çerezler (Cookies) ve modern HTML5 yerel depolama (<code className="text-primary font-mono text-body-sm bg-surface-container-lowest px-1.5 py-0.5 rounded">localStorage</code>), ziyaret ettiğiniz web uygulamalarının cihazınızda küçük bilgi kırıntıları saklamasını sağlayan endüstri standardı araçlardır.
          </p>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
<strong className="text-on-surface">Duel Arena</strong>, bu teknolojileri sadece eşzamanlı rekabet (Veto &amp; Harfbaz lobileri) akışını yürütmek, oturum kopmalarını önlemek ve ses/tema gibi arayüz tercihlerini sonraki ziyaretleriniz için muhafaza etmek maksadıyla kullanır. Hiçbir veriniz üçüncü taraf veri simsarlarına aktarılmaz.
          </p>
</div>
<div className="w-full md:w-80 shrink-0 bg-surface-container rounded-lg p-space-lg flex flex-col gap-space-md shadow-inner">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface">Depolama Dağılımı</span>
<span className="font-label-sm text-label-sm text-primary">100% Yerel</span>
</div>
<div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden flex">
<div className="bg-primary-container h-full w-[65%]" title="Zorunlu Çerezler"></div>
<div className="bg-tertiary-container h-full w-[25%]" title="Fonksiyonel Veriler"></div>
<div className="bg-outline h-full w-[10%]" title="Önbellek"></div>
</div>
<div className="flex flex-col gap-space-xs text-body-sm">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-container"></span> Zorunlu Oturum (JWT)</span>
<span className="font-mono text-on-surface">65%</span>
</div>
<div className="flex items-center justify-between text-on-surface-variant">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span> Fonksiyonel Tercihler</span>
<span className="font-mono text-on-surface">25%</span>
</div>
<div className="flex items-center justify-between text-on-surface-variant">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-outline"></span> Lobi Geçmişi</span>
<span className="font-mono text-on-surface">10%</span>
</div>
</div>
</div>
</section>
{/*  Section 2: Storage Inventory Table  */}
<section className="flex flex-col gap-space-md">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
<div>
<div className="flex items-center gap-space-xs text-primary font-label-sm uppercase tracking-wider">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span>Bölüm 02</span>
</div>
<h2 className="font-headline-md text-headline-md text-on-surface">
              Kullanılan Çerezler ve Depolama Envanteri
            </h2>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">
            Toplam 5 Aktif Parametre Tanımlı
          </span>
</div>
<div className="overflow-x-auto rounded-xl bg-surface-container-low shadow-md">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high text-on-surface font-label-md text-label-md">
<th className="p-space-md pl-space-lg">Anahtar / Çerez Adı</th>
<th className="p-space-md">İşlev ve Amaç</th>
<th className="p-space-md">Saklama Süresi</th>
<th className="p-space-md">Depolama Tipi</th>
<th className="p-space-md pr-space-lg">Sınıflandırma</th>
</tr>
</thead>
<tbody className="divide-y-0 text-body-sm text-on-surface-variant font-body-sm">
<tr className="hover:bg-surface-container transition-colors">
<td className="p-space-md pl-space-lg font-mono text-on-surface font-bold">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-primary">key</span>
<span>sb-access-token</span>
</div>
</td>
<td className="p-space-md">Supabase Auth JWT oturum kimlik doğrulama belirteci. Oyuncunun müsabaka odasındaki kimliğini garanti eder.</td>
<td className="p-space-md text-on-surface">Oturum Süresi / 1 Hafta</td>
<td className="p-space-md"><span className="bg-surface-container-highest px-2 py-0.5 rounded font-mono text-xs">Secure Cookie</span></td>
<td className="p-space-md pr-space-lg">
<span className="inline-flex items-center gap-1 bg-surface-container-highest text-primary font-label-sm px-space-xs py-space-2xs rounded-full">
<span className="material-symbols-outlined text-[12px]">lock</span> Zorunlu Teknik
                  </span>
</td>
</tr>
<tr className="bg-surface-container/30 hover:bg-surface-container transition-colors">
<td className="p-space-md pl-space-lg font-mono text-on-surface font-bold">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-primary">autorenew</span>
<span>sb-refresh-token</span>
</div>
</td>
<td className="p-space-md">JWT token süresi dolduğunda kesinti yaşanmadan oturumun güvenle yenilenmesini sağlayan kriptografik anahtar.</td>
<td className="p-space-md text-on-surface">30 Gün</td>
<td className="p-space-md"><span className="bg-surface-container-highest px-2 py-0.5 rounded font-mono text-xs">Secure Cookie</span></td>
<td className="p-space-md pr-space-lg">
<span className="inline-flex items-center gap-1 bg-surface-container-highest text-primary font-label-sm px-space-xs py-space-2xs rounded-full">
<span className="material-symbols-outlined text-[12px]">lock</span> Zorunlu Teknik
                  </span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors">
<td className="p-space-md pl-space-lg font-mono text-on-surface font-bold">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-tertiary">volume_up</span>
<span>duel_sound_enabled</span>
</div>
</td>
<td className="p-space-md">Geri sayım, zafer zili ve lobi bildirim ses efektlerinin kullanıcı bazlı durumunu (Mute / Unmute) saklar.</td>
<td className="p-space-md text-on-surface">Kalıcı (Sıfırlanana kadar)</td>
<td className="p-space-md"><span className="bg-surface-container-highest px-2 py-0.5 rounded font-mono text-xs">localStorage</span></td>
<td className="p-space-md pr-space-lg">
<span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container font-label-sm px-space-xs py-space-2xs rounded-full">
<span className="material-symbols-outlined text-[12px]">settings</span> Fonksiyonel
                  </span>
</td>
</tr>
<tr className="bg-surface-container/30 hover:bg-surface-container transition-colors">
<td className="p-space-md pl-space-lg font-mono text-on-surface font-bold">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-tertiary">palette</span>
<span>duel_active_theme</span>
</div>
</td>
<td className="p-space-md">Arayüz renk teması konfigürasyonunu (varsayılan Obsidian Amber) cihaz hafızasında tutar.</td>
<td className="p-space-md text-on-surface">Kalıcı</td>
<td className="p-space-md"><span className="bg-surface-container-highest px-2 py-0.5 rounded font-mono text-xs">localStorage</span></td>
<td className="p-space-md pr-space-lg">
<span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container font-label-sm px-space-xs py-space-2xs rounded-full">
<span className="material-symbols-outlined text-[12px]">settings</span> Fonksiyonel
                  </span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors">
<td className="p-space-md pl-space-lg font-mono text-on-surface font-bold">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-outline">history</span>
<span>duel_room_history</span>
</div>
</td>
<td className="p-space-md">Son katıldığınız 5 oda kodunun hızlı yeniden bağlanma amacıyla istemcide tutulan geçici önbelleği.</td>
<td className="p-space-md text-on-surface">24 Saat</td>
<td className="p-space-md"><span className="bg-surface-container-highest px-2 py-0.5 rounded font-mono text-xs">localStorage</span></td>
<td className="p-space-md pr-space-lg">
<span className="inline-flex items-center gap-1 bg-surface-container-highest text-on-surface-variant font-label-sm px-space-xs py-space-2xs rounded-full">
<span className="material-symbols-outlined text-[12px]">speed</span> Performans / Deneyim
                  </span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
{/*  Section 3: Third Party & Privacy Badge Banner  */}
<section className="bg-secondary-container rounded-xl p-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg relative overflow-hidden shadow-xl">
<div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex items-center gap-space-md relative z-10">
<div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 text-primary">
<span className="material-symbols-outlined text-[36px]">security</span>
</div>
<div className="flex flex-col">
<div className="inline-flex items-center gap-1 text-primary font-label-sm uppercase tracking-widest">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
              Sıfır Pazarlama Politikası
            </div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
              Duel Arena'da pazarlama, hedefleme veya 3. taraf reklam çerezi bulunmamaktadır.
            </h3>
<p className="font-body-sm text-body-sm text-on-secondary-container mt-1 max-w-xl">
              Platformumuz hiçbir sosyal medya izleyicisi, reklam ağı veya profil çıkarıcı analitik SDK'sı barındırmaz. Oyun deneyiminiz ve rekabet istatistikleriniz ticari reklam amacıyla kullanılmaz.
            </p>
</div>
</div>
<div className="bg-surface-container-lowest/80 px-space-lg py-space-md rounded-lg flex flex-col items-center text-center shrink-0 relative z-10 backdrop-blur-sm">
<span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">Gizlilik Standartı</span>
<span className="font-title-md text-title-md text-on-surface font-bold">KVKK &amp; GDPR Uyumlu</span>
<span className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Katı Gizlilik Modu</span>
</div>
</section>
{/*  Section 4: Management & Interactive Preferences  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Left: How to Manage in Browser  */}
<div className="lg:col-span-6 bg-surface-container-low rounded-xl p-space-xl flex flex-col justify-between gap-space-lg shadow-md">
<div className="flex flex-col gap-space-sm">
<div className="flex items-center gap-space-xs text-primary font-label-sm uppercase tracking-wider">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span>Bölüm 04</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">
              Çerezleri Nasıl Yönetebilirsiniz?
            </h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              İstediğiniz an tarayıcınızın ayarlar menüsünden (Chrome, Safari, Firefox, Edge vb.) depolanan tüm çerezleri silebilir veya yeni çerez kaydedilmesini engelleyebilirsiniz.
            </p>
<div className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-sm mt-space-2xs">
<span className="material-symbols-outlined text-primary-container text-[22px] shrink-0 mt-0.5">warning</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
<strong className="text-on-surface">Önemli Uyarı:</strong> Zorunlu teknik çerezler (<code className="text-primary font-mono">sb-access-token</code>) temizlendiğinde veya engellendiğinde, aktif maç bağlantınız kesilir ve platform oturumunuz anında sonlanır.
              </p>
</div>
</div>
<div className="flex flex-wrap gap-space-xs pt-space-xs">
<span className="bg-surface-container px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm text-on-surface-variant">Chrome: Ayarlar › Gizlilik</span>
<span className="bg-surface-container px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm text-on-surface-variant">Safari: Tercihler › Gizlilik</span>
<span className="bg-surface-container px-space-sm py-space-2xs rounded-full font-label-sm text-label-sm text-on-surface-variant">Firefox: Gizlilik ve Güvenlik</span>
</div>
</div>
{/*  Right: Interactive Preferences Panel  */}
<div className="lg:col-span-6 bg-surface-container-low rounded-xl p-space-xl flex flex-col justify-between gap-space-lg shadow-md">
<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Çerez Tercihleri Yönetimi</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">Bu cihazdaki istemci depolama anahtarlarını denetleyin.</p>
</div>
<span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">tune</span>
</span>
</div>
{/*  Item 1: Zorunlu (Locked)  */}
<div className="bg-surface-container p-space-md rounded-lg flex items-center justify-between gap-space-md">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<span className="font-title-md text-title-md text-on-surface">Zorunlu Oturum Çerezleri</span>
<span className="bg-surface-container-highest text-primary font-label-sm px-2 py-0.5 rounded-full">Kilitli</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Giriş yapma, oda senkronizasyonu ve hakem kontrolü için zorunludur.
                </span>
</div>
<div className="w-12 h-6 bg-primary-container rounded-full flex items-center justify-end px-1 opacity-60 cursor-not-allowed">
<div className="w-4 h-4 rounded-full bg-on-primary"></div>
</div>
</div>
{/*  Item 2: Fonksiyonel (Interactive)  */}
<div className="bg-surface-container p-space-md rounded-lg flex items-center justify-between gap-space-md">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<span className="font-title-md text-title-md text-on-surface">Fonksiyonel Tercihler (Ses &amp; Tema)</span>
<span className={`font-label-sm px-2 py-0.5 rounded-full ${functionalActive ? "bg-primary/20 text-primary" : "bg-surface-container text-on-surface-variant"}`} id="func-badge">{functionalActive ? "Etkin" : "Devre Dışı"}</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Ses efektleri durumu ve tema tercihlerini yerel hafızada tutar.
                </span>
</div>
<button aria-label="Fonksiyonel Çerezleri Aç/Kapat" className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${functionalActive ? "bg-primary-container justify-end" : "bg-surface-container-highest justify-start"}`} id="toggle-functional" onClick={() => setFunctionalActive(!functionalActive)} type="button">
<div className="w-4 h-4 rounded-full bg-on-primary transition-transform" id="toggle-thumb"></div>
</button>
</div>
{/*  Item 3: Oda Geçmişi (Interactive)  */}
<div className="bg-surface-container p-space-md rounded-lg flex items-center justify-between gap-space-md">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<span className="font-title-md text-title-md text-on-surface">Hızlı Oda Geçmişi Önbelleği</span>
<span className={`font-label-sm px-2 py-0.5 rounded-full ${historyActive ? "bg-primary/20 text-primary" : "bg-surface-container text-on-surface-variant"}`} id="history-badge">{historyActive ? "Etkin" : "Devre Dışı"}</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Katıldığınız son odaların kodlarını hızlı giriş alanında önerir.
                </span>
</div>
<button aria-label="Oda Geçmişini Aç/Kapat" className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${historyActive ? "bg-primary-container justify-end" : "bg-surface-container-highest justify-start"}`} id="toggle-history" onClick={() => setHistoryActive(!historyActive)} type="button">
<div className="w-4 h-4 rounded-full bg-on-primary transition-transform" id="toggle-thumb-history"></div>
</button>
</div>
</div>
<div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
<button className="w-full sm:w-auto font-label-md text-label-md bg-primary-container text-on-primary px-space-lg py-space-xs rounded-full hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-space-xs" id="btn-save-preferences" onClick={handleSavePreferences} type="button">
<span className="material-symbols-outlined text-[16px]">save</span>
<span>Tercihleri Kaydet</span>
</button>
<button className="w-full sm:w-auto font-label-md text-label-md bg-surface-container-high text-on-surface-variant hover:text-on-surface px-space-md py-space-xs rounded-full transition-colors flex items-center justify-center gap-space-xs" id="btn-clear-storage" onClick={handleClearStorage} type="button">
<span className="material-symbols-outlined text-[16px]">delete_sweep</span>
<span>İstemci Önbelleğini Sıfırla</span>
</button>
</div>
</div>
</div>
{/*  Toast Feedback Message  */}
<div className="hidden fixed bottom-6 right-6 z-50 bg-surface-container-highest text-on-surface px-space-lg py-space-sm rounded-lg shadow-xl flex items-center gap-space-sm" id="status-toast">
<span className="material-symbols-outlined text-primary-container">check_circle</span>
<span className="font-body-sm text-body-sm" id="status-text">Tercihleriniz başarıyla güncellendi.</span>
</div>
</div>
</div>

</main>
  );
};

export default CerezPolitikasiScreen;
