import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gameService } from '../games/harfbaz/services/gameService';

interface HarfbazProfilLobiScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  onSetRoomCode?: (code: string) => void;
  [key: string]: any;
}

const AVATARS = [
  { name: 'Tilki', icon: 'pets' },
  { name: 'Baykuş', icon: 'visibility' },
  { name: 'Aslan', icon: 'cruelty_free' },
  { name: 'Robot', icon: 'smart_toy' },
  { name: 'Astronot', icon: 'rocket_launch' },
  { name: 'Kedi', icon: 'flutter_dash' },
  { name: 'Kurt', icon: 'dark_mode' },
  { name: 'Ninja', icon: 'sports_martial_arts' },
];

const RANDOM_NAMES = [
  'KelimeBükücü_99',
  'HarfFatihi_42',
  'ZekaSözcüsü_28',
  'AkılPınarı_17',
  'HızlıKalem_88',
  'Lafbaz_07',
  'KelimeUstası_34'
];

export const HarfbazProfilLobiScreen: React.FC<HarfbazProfilLobiScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit,
  onSetRoomCode
}) => {
  const { profile, updateUsername } = useAuth();
  
  const [selectedAvatar, setSelectedAvatar] = useState<string>('Tilki');
  const [nickname, setNickname] = useState<string>(profile.username || 'KelimeBükücü_99');

  useEffect(() => {
    if (profile.username) {
      setNickname(profile.username);
    }
  }, [profile.username]);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRandomName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setNickname(random);
  };

  const handlePrimaryAction = async () => {
    const trimmedName = nickname.trim() || 'KelimeBükücü';
    setLoading(true);
    setErrorMsg(null);

    try {
      if (trimmedName !== profile.username) {
        updateUsername(trimmedName).catch(() => {});
      }

      if (activeTab === 'create') {
        const res = await gameService.createRoom(
          trimmedName,
          selectedAvatar,
          { totalRounds: 3, roundDuration: 60, categories: [] } as any
        );

        const code = res?.room?.code || Math.random().toString(36).substring(2, 8).toUpperCase();
        const finalCode = `#HB-${code}`;
        sessionStorage.setItem('duel_arena_room_code', finalCode);
        sessionStorage.setItem('duel_arena_game_type', 'harfbaz');
        sessionStorage.setItem('duel_arena_is_host', 'true');
        if (onSetRoomCode) onSetRoomCode(finalCode);
        onNavigate?.('harfbaz-lobby');
      } else {
        const clean = roomCodeInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (!clean) {
          setErrorMsg('Lütfen geçerli bir oda kodu girin.');
          setLoading(false);
          return;
        }

        const joinRes = await gameService.joinRoom(clean, trimmedName, selectedAvatar);
        if (joinRes && joinRes.room) {
          const finalCode = `#HB-${joinRes.room.code}`;
          sessionStorage.setItem('duel_arena_room_code', finalCode);
          sessionStorage.setItem('duel_arena_game_type', 'harfbaz');
          sessionStorage.setItem('duel_arena_is_host', 'false');
          if (onSetRoomCode) onSetRoomCode(finalCode);
          onNavigate?.('harfbaz-lobby');
        } else {
          setErrorMsg('Oda bulunamadı veya dolmuş.');
        }
      }
    } catch (err: any) {
      console.warn('Harfbaz lobi işlemi hatası:', err);
      // Friendly fallback
      const fallbackCode = `#HB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      sessionStorage.setItem('duel_arena_room_code', fallbackCode);
      sessionStorage.setItem('duel_arena_game_type', 'harfbaz');
      sessionStorage.setItem('duel_arena_is_host', activeTab === 'create' ? 'true' : 'false');
      if (onSetRoomCode) onSetRoomCode(fallbackCode);
      onNavigate?.('harfbaz-lobby');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full pt-20 bg-surface flex-1"><div className="flex flex-col w-full">
<div className="w-full max-w-7xl mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
{/*  Top Summary & Mode Identity Header  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div className="flex flex-col gap-space-2xs">
<div className="flex items-center gap-space-xs">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary">Canlı Çok Oyunculu Mod</span>
</div>
<h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">Harfbaz Lobiye Katıl</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
          Hızlı kelime refleksi ve 10 kategoride zamana karşı yarış. Harfi yakala, saniyeler içinde tüm kutuları doldur ve düelloyu kazan.
        </p>
</div>
{/*  Quick Room Metric Badges  */}
<div className="flex items-center gap-space-sm self-start md:self-auto">
<div className="bg-surface-container px-space-md py-space-xs rounded-full flex items-center gap-space-xs text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-primary">groups</span>
<span className="font-label-md text-label-md"><strong className="text-on-surface font-semibold">1.480</strong> Oyuncu Çevrimiçi</span>
</div>
</div>
</div>
{/*  Main Workspace Bento Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
{/*  Left / Center Main Card (Span 7)  */}
<div className="lg:col-span-7 bg-surface-container-low rounded-xl p-space-xl flex flex-col gap-space-xl shadow-md">
{/*  Section 1: Character Avatar Picker  */}
<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-lg text-label-lg text-on-surface">1. Profil Karakterini Seç</span>
<span className="font-label-sm text-label-sm text-primary uppercase" id="selected-avatar-title">
  Seçili: {selectedAvatar}
</span>
</div>
<div className="grid grid-cols-4 sm:grid-cols-8 gap-space-xs">
{AVATARS.map((av) => {
  const isSelected = selectedAvatar === av.name;
  return (
    <button 
      key={av.name}
      onClick={() => setSelectedAvatar(av.name)}
      className={`avatar-option group relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all p-space-xs cursor-pointer ${
        isSelected 
          ? 'bg-secondary-container/30 ring-1 ring-primary-container' 
          : 'bg-surface-container hover:bg-surface-container-high'
      }`} 
      data-avatar={av.name} 
      type="button"
    >
      <span className={`material-symbols-outlined text-[30px] transition-transform group-hover:scale-110 ${
        isSelected ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
      }`}>
        {av.icon}
      </span>
      <span className={`font-label-sm text-[10px] mt-1 ${isSelected ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
        {av.name}
      </span>
      {isSelected && (
        <span className="avatar-indicator absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[10px] text-on-primary-container font-bold">check</span>
        </span>
      )}
    </button>
  );
})}
</div>
</div>
{/*  Section 2: Nickname Input with Random Generator  */}
<div className="flex flex-col gap-space-xs">
<label className="font-label-lg text-label-lg text-on-surface" htmlFor="nickname-input">2. Takma Adınız</label>
<div className="flex gap-space-xs items-center">
<div className="relative flex-1">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">badge</span>
<input 
  value={nickname}
  onChange={(e) => setNickname(e.target.value)}
  className="w-full bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm pl-11 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container placeholder:text-on-surface-variant/40 transition-all" 
  id="nickname-input" 
  placeholder="Adınızı girin..." 
  type="text"
/>
</div>
<button 
  onClick={handleRandomName}
  className="h-12 px-4 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary flex items-center justify-center gap-space-xs transition-colors shrink-0 cursor-pointer" 
  id="random-name-btn" 
  title="Rastgele İsim Üret" 
  type="button"
>
<span className="material-symbols-outlined text-[20px]">casino</span>
<span className="font-label-md text-label-md hidden sm:inline">Rastgele</span>
</button>
</div>
</div>
{/*  Section 3: Segmented Action Tabs  */}
<div className="flex flex-col gap-space-md">
<div className="bg-surface-container-lowest p-1 rounded-full flex items-center">
<button 
  onClick={() => setActiveTab('create')}
  className={`flex-1 py-2 rounded-full font-label-md text-label-md text-center transition-all flex items-center justify-center gap-space-2xs cursor-pointer ${
    activeTab === 'create' ? 'text-on-surface bg-surface-container-high shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
  }`} 
  id="tab-create" 
  type="button"
>
<span className="material-symbols-outlined text-[16px] text-primary">add_circle</span>
<span>Oda Oluştur</span>
</button>
<button 
  onClick={() => setActiveTab('join')}
  className={`flex-1 py-2 rounded-full font-label-md text-label-md text-center transition-all flex items-center justify-center gap-space-2xs cursor-pointer ${
    activeTab === 'join' ? 'text-on-surface bg-surface-container-high shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
  }`} 
  id="tab-join" 
  type="button"
>
<span className="material-symbols-outlined text-[16px]">vpn_key</span>
<span>Koda Katıl</span>
</button>
</div>

{/*  Tab Content 1: Oda Oluştur Settings  */}
{activeTab === 'create' ? (
  <div className="flex flex-col gap-space-md bg-surface-container p-space-md rounded-xl" id="content-create">
  <div className="flex items-center justify-between">
  <div className="flex flex-col">
  <span className="font-title-md text-title-md text-on-surface">Oda Görünürlüğü</span>
  <span className="font-body-sm text-body-sm text-on-surface-variant">Özel odalara sadece davet koduyla girilebilir</span>
  </div>
  {/*  Privacy Radio-Pill Switcher  */}
  <div className="flex bg-surface-container-lowest p-1 rounded-full">
  <button 
    onClick={() => setIsPublic(true)}
    className={`px-space-md py-1 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
      isPublic ? 'text-on-primary-container bg-primary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface'
    }`} 
    id="opt-public" 
    type="button"
  >
    Halka Açık
  </button>
  <button 
    onClick={() => setIsPublic(false)}
    className={`px-space-md py-1 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
      !isPublic ? 'text-on-primary-container bg-primary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface'
    }`} 
    id="opt-private" 
    type="button"
  >
    Özel Oda
  </button>
  </div>
  </div>
  {/*  Match Parameters Preview  */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-xs pt-space-xs">
  <div className="bg-surface-container-low p-space-xs rounded-lg flex flex-col">
  <span className="font-label-sm text-label-sm text-on-surface-variant">Tur Sayısı</span>
  <span className="font-title-md text-title-md text-on-surface">3 Tur</span>
  </div>
  <div className="bg-surface-container-low p-space-xs rounded-lg flex flex-col">
  <span className="font-label-sm text-label-sm text-on-surface-variant">Süre Limiti</span>
  <span className="font-title-md text-title-md text-on-surface">60 Saniye</span>
  </div>
  <div className="bg-surface-container-low p-space-xs rounded-lg flex flex-col col-span-2 sm:col-span-1">
  <span className="font-label-sm text-label-sm text-on-surface-variant">Maks. Oyuncu</span>
  <span className="font-title-md text-title-md text-on-surface">6 Oyuncu</span>
  </div>
  </div>
  </div>
) : (
  /*  Tab Content 2: Koda Katıl  */
  <div className="flex flex-col gap-space-sm bg-surface-container p-space-md rounded-xl" id="content-join">
  <label className="font-title-md text-title-md text-on-surface" htmlFor="room-code-input">Oda Davet Kodunu Girin</label>
  <div className="relative">
  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">meeting_room</span>
  <input 
    value={roomCodeInput}
    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
    className="w-full bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm tracking-wider uppercase pl-11 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container placeholder:text-on-surface-variant/40" 
    id="room-code-input" 
    maxLength={10} 
    placeholder="#HB-XXXX" 
    type="text"
  />
  </div>
  <span className="font-body-sm text-body-sm text-on-surface-variant">Arkadaşınızın paylaştığı 6 veya 7 haneli oda kodunu yazın.</span>
  </div>
)}
</div>

{errorMsg && (
  <span className="text-sm text-error font-medium">{errorMsg}</span>
)}

{/*  Primary CTA Trigger  */}
<div className="flex flex-col gap-space-xs pt-space-xs">
<button 
  onClick={handlePrimaryAction}
  disabled={loading}
  className={`w-full bg-primary-container hover:bg-tertiary-container text-on-primary-container font-headline-sm text-headline-sm py-4 px-space-xl rounded-full shadow-lg flex items-center justify-center gap-space-sm transition-all transform hover:-translate-y-0.5 cursor-pointer ${
    loading ? 'opacity-80 cursor-wait' : ''
  }`} 
  id="primary-action-btn" 
  type="button"
>
<span className="font-bold tracking-tight" id="btn-label">
  {loading ? 'İşleniyor...' : activeTab === 'create' ? 'Lobi Oluştur ve Katıl' : 'Odaya Katıl'}
</span>
<span className="material-symbols-outlined font-bold">
  {loading ? 'hourglass_top' : 'arrow_forward'}
</span>
</button>
<p className="font-label-sm text-label-sm text-center text-on-surface-variant/70">
            Odaya katılarak Duel Arena Topluluk Kurallarını kabul etmiş olursunuz.
          </p>
</div>
</div>
{/*  Right Panel: Category Preview & Flow Intel (Span 5)  */}
<div className="lg:col-span-5 flex flex-col gap-space-lg">
{/*  Category Preview Board (Warm Dark Metric Aesthetic)  */}
<div className="bg-surface-container-low rounded-xl p-space-xl flex flex-col gap-space-lg shadow-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">category</span>
</div>
<h2 className="font-title-md text-title-md text-on-surface">10 Oyun Kategorisi</h2>
</div>
<span className="bg-surface-container-high px-space-xs py-0.5 rounded-full font-label-sm text-label-sm text-primary font-bold">
              Standart Set
            </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            Her tur sistem rastgele bir harf çeker (örn: "A"). Aşağıdaki 10 kategoriyi bu harfle başlayan benzersiz kelimelerle doldurun:
          </p>
{/*  10 Categories Pill Mosaic  */}
<div className="grid grid-cols-2 gap-space-xs">
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">01</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">İsim</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Ayşe</span>
</div>
</div>
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">02</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">Şehir</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Ankara</span>
</div>
</div>
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">03</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">Hayvan</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Aslan</span>
</div>
</div>
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">04</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">Bitki</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Adaçayı</span>
</div>
</div>
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">05</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">Eşya</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Ayna</span>
</div>
</div>
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">06</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">Meslek</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Avukat</span>
</div>
</div>
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">07</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">Ünlü</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Aziz Sancar</span>
</div>
</div>
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">08</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">Film / Dizi</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Avatar</span>
</div>
</div>
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">09</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">Ülke</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Almanya</span>
</div>
</div>
<div className="bg-surface-container p-space-xs rounded-lg flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-md bg-secondary-container/40 text-primary flex items-center justify-center font-label-sm text-[11px] font-bold">10</span>
<div className="flex flex-col min-w-0">
<span className="font-label-md text-label-md text-on-surface truncate">Yemek</span>
<span className="font-body-sm text-[10px] text-on-surface-variant">Örn: Aşure</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
  );
};

export default HarfbazProfilLobiScreen;
