# ⚓ Pirate Coop — Eşya & Karakter Ağırlık / Taşıma Sistemi (GDD & Fizik Speki)

> **Notion Kullanımı İçin:** Bu dokümanı doğrudan Notion sayfanıza kopyalayıp yapıştırabilirsiniz. Tablolar, ikonlar ve başlıklar Notion blokları ile %100 uyumludur.

---

## 📌 1. Sistemin Amacı ve Tasarım Felsefesi (Core Philosophy)
Oyunumuzun dinamik parti/co-op atmosferinde eşyalar fırlatılabilirken, **karakterler ve takım arkadaşları asla fırlatılamaz**:
1. **İnsan Fırlatılamaz Kuralı (`canBeThrown = false`):** Kucağa bir takım arkadaşı veya NPC alındığında ekranda "Fırlat" seçeneği **asla çıkmaz**. Sol Tık veya F tuşu karakteri roket gibi fırlatamaz; arkadaş sadece **`[E]` tuşu ile önüne yere nazikçe bırakılabilir**.
2. **Taşıma Ağırlığı (Weight & Speed Penalty):** Kucağa ağır bir korsan alındığında taşıyıcının hızı (%32 azalma ile %68'e), zıplaması (%80'e) düşer ve depar atılamaz.
3. **Kusursuz Ayağa Kalkma:** Baygınlık süresi (5 saniye) dolan karakter yerde takılıp kalmaz; süresi biter bitmez pürüzsüzce ayağa kalkar.
4. **Havada Asılı Kalma Yasağı:** Uçurumdan veya iskeleden aşağı düşerken süresi dolsa dahi karakter havada dikilip süzülmez; ancak yere temas edip düşüş hızı sakinleştiğinde ayağa kalkar.

---

## ⚖️ 2. Ağırlık Sınıfları Hiyerarşisi (Weight Classes)

| Ağırlık Sınıfı | Temsili Kütle | Örnek Nesneler | Taşıyıcı Hız Etkisi | Taşıyıcı Zıplama Etkisi | Fırlatma Durumu | Tahmini Menzil |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **🟢 Light (Hafif)** | 0 – 3 kg | Şişe, Meşale, Tabanca, Hindistan Cevizi | %100 (Ceza Yok) | %100 (Ceza Yok) | `Fırlatılabilir` (18f) | **12 – 15 Metre** (Uzak) |
| **🟡 Medium (Orta)** | 5 – 20 kg | Ahşap Sandık, Küçük Erzak Fıçısı | %88 (%12 Yavaşlama) | %95 (%5 Azalma) | `Fırlatılabilir` (11.5f) | **6 – 8 Metre** (Orta) |
| **🔴 Heavy (Ağır)** | 60 – 90 kg | **Baygın Korsan (İnsan)**, Büyük Barut Fıçısı | %68 (%32 Yavaşlama) | %80 (%20 Azalma) | ❌ **FIRLATILAMAZ** | **Yere Bırakılır** (`[E]`) |

---

## 🏃‍♂️ 3. Taşıyıcı Lokomosyon Kuralları (Carrier Locomotion)

* **Yürüme Hızı:** Karakter taşırken hız %68 çarpanıyla ölçeklenir.
* **Depar (Sprint) Kısıtlaması:** Kucakta insan taşırken depar tuşuna (`Shift`) basılsa bile hız azami yürüme hızının %15 fazlasına kilitlenir. Kucakta insan varken koşulamaz.
* **Zıplama Kuvveti:** Dikey sıçrama kuvveti %80 seviyesine iner; alçak basamaklar aşılabilir ancak yüksek platformlara sıçranamaz.

---

## 💫 4. Havada Uyanmama & Zemin Doğrulama Mantığı

```
[Baygınlık Süresi Doldu (0.0s)]
             │
             ▼
     [Kucakta mı Tutuluyor?]
      ├── EVET ──▶ [Kucaktan Kurtulur ve Ayaklarının Üzerine Düşer]
      │
     HAYIR
      │
      ▼
   [IsAirborne() Denetimi]
      ├── YERDE YATIYOR ────▶ [Pürüzsüzce Ayağa Kalk (SmoothStep)] (BEKLEME YOK!)
      │
      └── HAVADA DÜŞÜYOR ───▶ [Zemine Çarpıp Hız Durulana Kadar Ragdoll Kal]
```

### 🛑 Kural Maddeleri:
1. **Yerdeki Karakter Anında Kalkar:** Zeminle temas halinde yatan baygın bir korsanın 5 saniyelik süresi bittiğinde sıfır gecikmeyle ayağa kalkış animasyonu başlar. Yerde takılıp kalma bug'ı tamamen giderilmiştir.
2. **Düşüşte Olan Karakter Yere İnene Kadar Bekler:** İskeleden veya yüksekten düşmekte olan karakter havada dikilip Mary Poppins gibi süzülmez; yere inip dikey düşüş hızı durulduğunda (`linearVelocity.y < 2.5f`) ayağa dikilir.

---

## 🎮 5. Oyuncu Arayüzü & Geri Bildirim (HUD & Feedback)

* **Baygın Takım Arkadaşı Kucaktayken:**
  `🏴‍☠️ [E] Arkadaşı Yere Bırak  (💤 3.8s)`
  *(Fırlatma yazısı, "Sol Tık / F" veya kafa karıştıran ağır yük yazıları kaldırıldı! Dümdüz temiz bırakma arayüzü)*
* **Eğer Oyuncu Karakter Tutarken F / Sol Tık Basarsa:**
  `⚠️ Arkadaşını fırlatamazsın! [E] tuşu ile yere bırak.`
* **Normal Kutu / Eşya Tutulurken:**
  `📦 [Sol Tık / F] Fırlat   |   [E] Bırak`
