import React, { useState } from 'react';
import { LegalNavPills } from '../components/LegalNavPills';

interface KvkkAydinlatmaScreenProps {
  onNavigate?: (path: string) => void;
}

export const KvkkAydinlatmaScreen: React.FC<KvkkAydinlatmaScreenProps> = ({ onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadPdf = () => {
    alert('KVKK Aydınlatma Metni (Rev 2.4.0) PDF formatında hazırlanıyor. İndirme kısa süre içinde başlayacaktır.');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('KVKK Veri Sahibi Başvuru Formu başarıyla iletildi. Talebiniz en geç 30 gün içinde yanıtlanacaktır.');
    setIsModalOpen(false);
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
<span className="text-primary font-bold">KVKK Aydınlatma Metni</span>
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
              KVKK Aydınlatma Metni <span className="text-primary font-light">&amp;</span> Veri Güvenliği
            </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Duel Arena rekabetçi ekosisteminde kişisel verilerinizin toplanması, saklanması ve korunmasına ilişkin yasal çerçeve ve ilgili kişi hakları.
            </p>
</div>
{/*  Document Action Buttons  */}
<div className="flex items-center gap-space-xs self-start md:self-auto">
<button aria-label="PDF İndir" className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md px-space-md py-space-xs rounded-full transition-colors shadow-sm cursor-pointer" id="downloadPdfBtn" onClick={handleDownloadPdf} type="button">
<span className="material-symbols-outlined text-[18px] text-primary">download</span>
<span>PDF Olarak İndir</span>
</button>
</div>
</div>

{/*  Legal Navigation Tabs (Strictly Pill-Styled)  */}
<LegalNavPills activeTab="kvkk" onNavigate={onNavigate} />
</div>
</div>
</div>
<div className="w-full px-margin-mobile md:px-margin max-w-7xl mx-auto py-space-2xl">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<div className="lg:col-span-8 flex flex-col gap-space-2xl">
<section className="flex flex-col gap-space-md scroll-mt-28" id="veri-sorumlusu">
<div className="flex items-center gap-space-xs">
<span className="w-8 h-8 rounded-full bg-surface-container-low text-primary flex items-center justify-center font-label-md">01</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Veri Sorumlusu ve Kapsam</h2>
</div>
<div className="bg-surface-container-low p-space-xl rounded-xl shadow-sm flex flex-col gap-space-md">
<p className="font-body-lg text-body-lg text-on-surface-variant">
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Kanunu uyarınca, <strong className="text-on-surface">Duel Arena Platformu</strong> ("Şirket" veya "Veri Sorumlusu") olarak; Veto ve Harfbaz modülleri üzerinden oyuncu topluluğumuza adil, şeffaf ve güvenli bir dijital rekabet alanı tesis ederken kişisel verilerinizin gizliliğini korumayı asli görev kabul ediyoruz.
            </p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
<div className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary-container text-[24px]">verified_user</span>
<div>
<h4 className="font-title-md text-title-md text-on-surface">6698 Sayılı KVKK</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">Açık rıza protokolleri, aydınlatma yükümlülüğü ve ilgili kişi hakları mekanizmaları tam uyumludur.</p>
</div>
</div>
<div className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary-container text-[24px]">router</span>
<div>
<h4 className="font-title-md text-title-md text-on-surface">5651 Sayılı Kanun</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">Erişim sağlayıcı ve yer sağlayıcı sıfatıyla trafik ve bağlantı kayıtları şifreli olarak saklanır.</p>
</div>
</div>
</div>
</div>
</section>
<section className="flex flex-col gap-space-md scroll-mt-28" id="veri-kategorileri">
<div className="flex items-center gap-space-xs">
<span className="w-8 h-8 rounded-full bg-surface-container-low text-primary flex items-center justify-center font-label-md">02</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">İşlenen Kişisel Veri Kategorileri</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">Platform genelinde yalnızca rekabet deneyimini yürütmek, hesap güvenliğini temin etmek ve hile/manipülasyonu engellemek için zaruri olan veriler işlenir:</p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div className="bg-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex flex-col gap-space-sm">
<div className="w-12 h-12 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">badge</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Kimlik Verileri</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">Oyuncu profilinizin kurulması ve tekil oyuncu kimliğinin sistemde eşleşmesi amacıyla kullanılır.</p>
</div>
<div className="mt-space-md pt-space-md bg-surface-container/60 p-space-sm rounded-lg flex flex-wrap gap-space-2xs">
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">Kullanıcı Adı</span>
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">Oyuncu Takma Adı (Tag)</span>
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">Benzersiz UID</span>
</div>
</div>
<div className="bg-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex flex-col gap-space-sm">
<div className="w-12 h-12 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">alternate_email</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">İletişim Verileri</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">Oturum kurtarma, çift faktörlü onaylama, resmi bildirim ve itiraz yanıtlarının iletimi için kullanılır.</p>
</div>
<div className="mt-space-md pt-space-md bg-surface-container/60 p-space-sm rounded-lg flex flex-wrap gap-space-2xs">
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">E-posta Adresi</span>
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">Bildirim Tercihleri</span>
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">İletişim Kayıtları</span>
</div>
</div>
<div className="bg-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex flex-col gap-space-sm">
<div className="w-12 h-12 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">security</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">İşlem Güvenliği</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">Hesap yetkisiz erişimlerinin tespiti, DDOS koruması ve yasal log kayıt zorunlulukları gereğidir.</p>
</div>
<div className="mt-space-md pt-space-md bg-surface-container/60 p-space-sm rounded-lg flex flex-wrap gap-space-2xs">
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">IP Adresi &amp; Port</span>
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">Oturum Logları</span>
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">Bcrypt Hash Özeti</span>
</div>
</div>
<div className="bg-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col justify-between group hover:bg-surface-container transition-colors">
<div className="flex flex-col gap-space-sm">
<div className="w-12 h-12 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">sports_esports</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Oyun &amp; Rekabet Verileri</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">Liderlik tablosu hesaplamaları, eşleştirme algoritmaları ve hakem kararlarının yürütülmesi.</p>
</div>
<div className="mt-space-md pt-space-md bg-surface-container/60 p-space-sm rounded-lg flex flex-wrap gap-space-2xs">
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">ELO Sıralama Skoru</span>
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">Harfbaz Kelime Girdileri</span>
<span className="px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-label-sm">Veto İtiraz Geçmişi</span>
</div>
</div>
</div>
</section>
<section className="flex flex-col gap-space-md scroll-mt-28" id="isleme-amaclari">
<div className="flex items-center gap-space-xs">
<span className="w-8 h-8 rounded-full bg-surface-container-low text-primary flex items-center justify-center font-label-md">03</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Veri İşleme Amaçları ve Hukuki Sebepler</h2>
</div>
<div className="bg-surface-container-low p-space-xl rounded-xl space-y-space-lg shadow-sm">
<div className="flex items-start gap-space-md">
<span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
</span>
<div className="flex flex-col gap-space-2xs">
<h3 className="font-title-md text-title-md text-on-surface">Sözleşmenin Kurulması ve İfası (KVKK m.5/2-c)</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Duel Arena kullanıcı üyeliğinin oluşturulması, Veto ve Harfbaz turnuvalarına katılımın sağlanması ve maç sonuçlarının derecelendirilmesi için veriler zorunlu olarak işlenir.</p>
</div>
</div>
<div className="flex items-start gap-space-md">
<span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">policy</span>
</span>
<div className="flex flex-col gap-space-2xs">
<h3 className="font-title-md text-title-md text-on-surface">Meşru Menfaat ve Rekabet Adaleti (KVKK m.5/2-f)</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Hile, bot yazılımları, argo veya hakaret içeren kelime girdilerinin gerçek zamanlı filtresi, oyuncu raporlarının incelenmesi ve topluluk huzurunun korunması meşru menfaatimiz kapsamındadır.</p>
</div>
</div>
<div className="flex items-start gap-space-md">
<span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">balance</span>
</span>
<div className="flex flex-col gap-space-2xs">
<h3 className="font-title-md text-title-md text-on-surface">Hukuki Yükümlülüğün Yerine Getirilmesi (KVKK m.5/2-ç)</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Yetkili adli veya idari mercilerin talepleri doğrultusunda bilgi verilmesi, 5651 sayılı kanun kapsamındaki erişim kayıtlarının saklanması ve siber suçlarla mücadele operasyonları.</p>
</div>
</div>
</div>
</section>
<section className="scroll-mt-28" id="yurtdisi-aktarim">
<div className="bg-gradient-to-br from-secondary-container/80 to-surface-container-low p-space-xl rounded-xl shadow-xl relative overflow-hidden">
<div className="flex items-center gap-space-xs text-primary mb-space-sm">
<span className="material-symbols-outlined text-[26px]">public</span>
<span className="font-label-lg text-label-lg uppercase tracking-wider text-primary">Kritik Bilgilendirme: Sınır Ötesi Veri Aktarımı</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-space-sm">Yurtdışı Veri Aktarımı ve Supabase Frankfurt Altyapısı</h3>
<p className="font-body-lg text-body-lg text-on-surface leading-relaxed mb-space-md">
              Kullanıcı kimlik doğrulama, oturum yönetimi ve veritabanı altyapımız <strong className="text-primary font-bold">AB Genel Veri Koruma Tüzüğü (GDPR)</strong> uyumlu <strong className="text-on-surface underline decoration-primary">Supabase Frankfurt (Almanya)</strong> güvenli veri merkezlerinde barındırılmaktadır. 
            </p>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
              6698 sayılı Kanun'un 9. maddesi gereğince, platformumuza kaydolurken ve hizmet şartlarını onaylarken Frankfurt lokasyonundaki şifrelenmiş sunucularda veri barındırma işlemine ilişkin <strong className="text-on-surface">açık rızanız</strong> talep edilmektedir. Tüm veri akışı TLS 1.3 ve istirahat halindeki veriler AES-256 kriptografisiyle korunur.
            </p>
<div className="flex flex-wrap items-center gap-space-md bg-surface-container-lowest/80 p-space-md rounded-lg">
<div className="flex items-center gap-space-2xs text-on-surface font-label-md">
<span className="material-symbols-outlined text-primary text-[18px]">cloud_done</span>
<span>Sunucu Bölgesi: eu-central-1 (Frankfurt)</span>
</div>
<div className="flex items-center gap-space-2xs text-on-surface font-label-md">
<span className="material-symbols-outlined text-primary text-[18px]">lock</span>
<span>SOC 2 Type II Sertifikalı</span>
</div>
<div className="flex items-center gap-space-2xs text-on-surface font-label-md">
<span className="material-symbols-outlined text-primary text-[18px]">verified</span>
<span>GDPR / DPA Garantili</span>
</div>
</div>
</div>
</section>
<section className="flex flex-col gap-space-md scroll-mt-28" id="saklama-sureleri">
<div className="flex items-center gap-space-xs">
<span className="w-8 h-8 rounded-full bg-surface-container-low text-primary flex items-center justify-center font-label-md">05</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Veri Saklama ve İmha Süreleri</h2>
</div>
<div className="bg-surface-container-low p-space-xl rounded-xl shadow-sm space-y-space-md">
<p className="font-body-md text-body-md text-on-surface-variant">Toplanan kişisel veriler, ilgili yasal mevzuatta öngörülen süreler boyunca veya işleme amacının devamı süresince saklanır:</p>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
<div className="bg-surface-container p-space-md rounded-lg flex flex-col justify-between">
<div>
<span className="font-display-lg text-display-lg text-primary tracking-tight">2 Yıl</span>
<h4 className="font-title-md text-title-md text-on-surface mt-space-2xs">Bağlantı &amp; Trafik Logları</h4>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">5651 sayılı mevzuat uyarınca IP, port, zaman damgası bilgileri sürenin bitiminde otomatik imha edilir.</p>
</div>
<div className="bg-surface-container p-space-md rounded-lg flex flex-col justify-between">
<div>
<span className="font-display-lg text-display-lg text-primary tracking-tight">Süresiz</span>
<h4 className="font-title-md text-title-md text-on-surface mt-space-2xs">Profil &amp; ELO Geçmişi</h4>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">Kullanıcı hesabını silme talebinde bulunana veya üyelik kapatılana kadar aktif kalır.</p>
</div>
<div className="bg-surface-container p-space-md rounded-lg flex flex-col justify-between">
<div>
<span className="font-display-lg text-display-lg text-primary tracking-tight">90 Gün</span>
<h4 className="font-title-md text-title-md text-on-surface mt-space-2xs">Veto &amp; Harfbaz İtirazları</h4>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">Maç içi kelime itiraz logları ve inceleme ses/metin kayıtları karara bağlandıktan sonra tasfiye edilir.</p>
</div>
</div>
</div>
</section>
<section className="flex flex-col gap-space-md scroll-mt-28" id="ilgili-kisi-haklari">
<div className="flex items-center gap-space-xs">
<span className="w-8 h-8 rounded-full bg-surface-container-low text-primary flex items-center justify-center font-label-md">06</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">KVKK Madde 11 Kapsamındaki Haklarınız</h2>
</div>
<div className="bg-surface-container-low p-space-xl rounded-xl shadow-sm space-y-space-lg">
<p className="font-body-md text-body-md text-on-surface-variant">
              KVKK'nın 11. maddesi kapsamında dilediğiniz zaman Veri Sorumlumuza başvurarak aşağıdaki haklarınızı kullanabilirsiniz:
            </p>
<ul className="grid grid-cols-1 sm:grid-cols-2 gap-space-md list-none p-0 m-0">
<li className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
</li>
<li className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">İşlenmişse buna ilişkin ayrıntılı bilgi talep etme</span>
</li>
<li className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Eksik veya yanlış işlenen verilerin düzeltilmesini isteme</span>
</li>
<li className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Kanun şartlarına binaen verilerin silinmesini (hesap imhası) isteme</span>
</li>
<li className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Yurtiçinde/yurtdışında aktarıldığı 3. kişileri bilme</span>
</li>
<li className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Münhasıran otomatik sistem analizlerine itiraz etme</span>
</li>
</ul>
<div className="bg-surface-container p-space-lg rounded-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">mail</span>
</div>
<div>
<h4 className="font-title-md text-title-md text-on-surface">Resmi Başvuru Kanalı</h4>
<a className="font-body-md text-body-md text-primary hover:underline" href="mailto:iletisim@duelarena.com">iletisim@duelarena.com</a>
</div>
</div>
<button className="px-space-lg py-space-sm rounded-full bg-primary-container text-on-primary-container font-label-md hover:bg-tertiary-container transition-colors shadow-sm shrink-0" id="modalTriggerBtn" onClick={() => setIsModalOpen(true)} type="button">
                Veri Sorumlusuna Başvuru Formu
              </button>
</div>
</div>
</section>
</div>
<div className="lg:col-span-4 sticky top-36 flex flex-col gap-space-lg">
<div className="bg-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-title-md text-title-md text-on-surface flex items-center gap-space-2xs">
<span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
              İçindekiler
            </span>
<span className="font-label-sm text-label-sm text-outline">6 Bölüm</span>
</div>
<nav className="flex flex-col gap-space-2xs">
<a className="px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md transition-colors flex items-center justify-between" href="#veri-sorumlusu">
<span>1. Veri Sorumlusu &amp; Kapsam</span>
<span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
</a>
<a className="px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md transition-colors flex items-center justify-between" href="#veri-kategorileri">
<span>2. İşlenen Veri Kategorileri</span>
<span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
</a>
<a className="px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md transition-colors flex items-center justify-between" href="#isleme-amaclari">
<span>3. Amaçlar &amp; Hukuki Sebepler</span>
<span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
</a>
<a className="px-space-sm py-space-xs rounded-lg text-primary hover:bg-surface-container font-label-md transition-colors flex items-center justify-between" href="#yurtdisi-aktarim">
<span className="flex items-center gap-space-2xs">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                4. Supabase Frankfurt Aktarımı
              </span>
<span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
</a>
<a className="px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md transition-colors flex items-center justify-between" href="#saklama-sureleri">
<span>5. Veri Saklama Süreleri</span>
<span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
</a>
<a className="px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md transition-colors flex items-center justify-between" href="#ilgili-kisi-haklari">
<span>6. Madde 11 Haklarınız</span>
<span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
</a>
</nav>
<div className="pt-space-sm flex flex-col gap-space-xs">
<button className="w-full py-space-xs px-space-md rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md flex items-center justify-center gap-space-xs" id="sidebarDownloadBtn" onClick={handleDownloadPdf} type="button">
<span className="material-symbols-outlined text-[18px] text-primary">file_download</span>
<span>Dokümanı İndir (.PDF)</span>
</button>
<button className="w-full py-space-xs px-space-md rounded-full bg-primary text-on-primary hover:bg-tertiary transition-colors font-label-md flex items-center justify-center gap-space-xs" id="sidebarApplyBtn" onClick={() => setIsModalOpen(true)} type="button">
<span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
<span>Hak Talebinde Bulun</span>
</button>
</div>
</div>
<div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex items-center gap-space-md">
<div className="w-10 h-10 rounded-full bg-surface-container text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">vpn_key</span>
</div>
<div>
<h5 className="font-title-md text-title-md text-on-surface">Uçtan Uca Şifreleme</h5>
<p className="font-body-sm text-body-sm text-on-surface-variant">Tüm şifreler salted bcrypt hash olarak tutulmakta, açık metin asla saklanmamaktadır.</p>
</div>
</div>
</div>
</div>
</div>
<div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md hidden items-center justify-center p-margin" id="applicationModal">
<div className="bg-surface-container-low w-full max-w-xl rounded-xl shadow-2xl p-space-xl relative flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs text-primary">
<span className="material-symbols-outlined text-[24px]">contact_support</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">KVKK Başvuru Talebi</h3>
</div>
<button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface" id="closeModalBtn" onClick={() => setIsModalOpen(false)} type="button">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">
        6698 sayılı Kanun'un 11. maddesi kapsamındaki talebinizi aşağıdaki form üzerinden iletebilirsiniz. Başvurunuz en geç 30 gün içinde yanıtlanacaktır.
      </p>
<form className="flex flex-col gap-space-sm" id="kvkkForm" >
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1">Oyuncu / Kullanıcı Adı</label>
<input className="w-full bg-surface-container px-space-md py-space-xs rounded-lg text-on-surface font-body-md focus:outline-none focus:bg-surface-container-high transition-colors" placeholder="örn. shadow_blade" required type="text"/>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1">Kayıtlı E-Posta Adresi</label>
<input className="w-full bg-surface-container px-space-md py-space-xs rounded-lg text-on-surface font-body-md focus:outline-none focus:bg-surface-container-high transition-colors" placeholder="oyuncu@duelarena.com" required type="email"/>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1">Talep Türü</label>
<select className="w-full bg-surface-container px-space-md py-space-xs rounded-lg text-on-surface font-body-md focus:outline-none focus:bg-surface-container-high transition-colors">
<option>Kişisel Verilerimin Dökümünü Talep Ediyorum (GDPR Export)</option>
<option>Kişisel Verilerimin ve Hesabımın Silinmesini İstiyorum</option>
<option>Hatalı Profil / Log Verisinin Düzeltilmesini İstiyorum</option>
<option>Sınır Ötesi Veri Aktarımı Rıza Geri Çekme</option>
<option>Diğer İtiraz &amp; Şikayetler</option>
</select>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1">Açıklama / Detay</label>
<textarea className="w-full bg-surface-container px-space-md py-space-xs rounded-lg text-on-surface font-body-md focus:outline-none focus:bg-surface-container-high transition-colors" placeholder="Talebinizin detaylarını belirtiniz..." rows={3}></textarea>
</div>
<div className="flex items-center justify-end gap-space-sm pt-space-xs">
<button className="px-space-md py-space-xs rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md transition-colors" id="cancelModalBtn" onClick={() => setIsModalOpen(false)} type="button">Vazgeç</button>
<button className="px-space-lg py-space-xs rounded-full bg-primary-container text-on-primary-container hover:bg-tertiary-container font-label-md transition-colors shadow-sm" type="submit">Talebi İlet</button>
</div>
</form>
</div>
</div>

</div></main>
  );
};

export default KvkkAydinlatmaScreen;
