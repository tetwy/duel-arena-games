# 🎮 Çoklu Oyun Portalı (Game Hub)

Bu proje, **[VETO](https://github.com/tetwy/veto-game)** ve **[HARFBAZ](https://github.com/tetwy/harfbaz-online)** oyunlarını tek bir çatı altında toplayan, modüler ve dinamik olarak eşit bölünen (split-screen) modern bir oyun başlatıcı / portal sistemidir.

---

## ✨ Özellikler

- **📐 Dinamik Eşit Bölünme (Auto Split-Screen):**
  - Görseldeki tasarıma uygun olarak ekran mevcut oyun sayısına göre otomatik olarak **tam eşit parçalara** bölünür.
  - **2 oyun** olduğunda: **%50 / %50** bölünür.
  - **3 oyun** olduğunda: **%33.3 / %33.3 / %33.3** bölünür.
  - **4 oyun** olduğunda: **%25 / %25 / %25 / %25** bölünür.
  - Mobil cihazlarda dikey eşit bölünme ile tam responsive destek.
- **🚀 Kesintisiz Oyun Akışı (Isolated Runtime):**
  - Kullanıcı istediği oyuna tıkladığında akıcı bir geçişle o oyun tam ekran açılır.
  - Oyun kendi doğal akışında (oda kurma, katılma, oylama, tur süresi vb.) hiçbir kısıtlama olmadan çalışır.
- **🧭 Kolay Menüye Dönüş (Floating Navigation Bar):**
  - Oyun ekranının üstünde şık, yarı saydam bir kontrol paneli bulunur:
    - `⬅ Oyunlar Menüsü`: Tek tıkla oyun seçim ekranına geri döner.
    - `🔄 Yenile`: Oyunu sıfırlar / yeniden yükler.
    - `⛶ Tam Ekran`: Tarayıcı tam ekran modunu açıp kapatır.
    - `↗ Ayrı Sekme`: Oyunu doğrudan ayrı sekmede açar.
- **🔗 URL ve Derin Bağlantı (Deep Linking):**
  - `/#/` -> Oyun Portalı (Eşit bölünmüş vitrin)
  - `/#/veto` -> Doğrudan VETO oyunu
  - `/#/harfbaz` -> Doğrudan HARFBAZ oyunu
  - Tarayıcının ileri/geri tuşları kusursuz çalışır.
- **🛡️ Sıfır CSS ve Çakışma Riski (Full Isolation):**
  - VETO (Tailwind v3) ve HARFBAZ (Tailwind v4) birbirlerinin stillerini, global değişkenlerini veya JavaScript durumlarını asla etkilemez.

---

## 🚀 Hızlı Başlangıç

### 1. Geliştirme Modunda Çalıştırma (Dev Mode)

Tüm platformu ve altındaki iki oyunu tek bir komutla başlatın:

```bash
npm run dev
```

Tarayıcınızda şu adresi açın:
👉 **`http://localhost:3000`**

- Portala `http://localhost:3000` adresinden ulaşırsınız.
- VETO `/games/veto/` alt yolunda çalışır.
- HARFBAZ `/games/harfbaz/` alt yolunda çalışır.

### 2. Canlı Yayına Alma / Üretim Paketi (Production Build)

Tüm projeyi tek bir `dist` klasörüne derleyin:

```bash
npm run build
```

Derleme tamamlandığında `dist` klasörünü Vercel, Netlify, Cloudflare Pages veya kendi sunucunuza tek bir site olarak yükleyebilirsiniz.

Yapıyı test etmek için:
```bash
npm run preview
```

---

## ➕ Yeni Bir Oyun Nasıl Eklenir?

Yeni bir oyun eklemek sadece birkaç saniye sürer:

1. Projeyi bir alt klasöre (örneğin `games/yeni-oyun`) koyun.
2. `src/games.ts` dosyasına yeni bir obje ekleyin:

```typescript
{
  id: 'yeni-oyun',
  title: 'YENİ OYUN',
  subtitle: 'Oyun Açıklaması',
  description: 'Oyunun detaylı tanıtımı...',
  tag: 'Strateji',
  players: '2-6 Oyuncu',
  badge: 'Yeni',
  accentColor: '#10b981',
  glowColor: 'rgba(16, 185, 129, 0.35)',
  bgGradient: 'from-emerald-950/80 via-slate-900/90 to-[#0b0d14]',
  banner: '/banners/yeni-oyun.png',
  route: '/games/yeni-oyun/',
  iconName: 'gamepad',
  features: ['Özellik 1', 'Özellik 2']
}
```

Kaydettiğiniz anda portal ekranı otomatik olarak **3 eşit sütuna** (%33.3) bölünecektir!

---

## ⚙️ Supabase / Canlı Multiplayer Yapılandırması

Kendi Supabase veritabanınızı bağlamak için kök dizindeki `.env` dosyasını düzenleyin:

```env
# Ortak Supabase:
VITE_SUPABASE_URL=https://sizin-projeniz.supabase.co
VITE_SUPABASE_ANON_KEY=sizin-anon-keyiniz

# Veya oyun bazlı ayrı veritabanları:
# VITE_VETO_SUPABASE_URL=...
# VITE_HARFBAZ_SUPABASE_URL=...
```
