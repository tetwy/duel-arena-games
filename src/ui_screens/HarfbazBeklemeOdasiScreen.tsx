import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { gameService } from '../games/harfbaz/services/gameService';
import { CATEGORIES } from '../games/harfbaz/constants';
import type { Player, Room } from '../games/harfbaz/types';

interface HarfbazBeklemeOdasiScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  roomCode?: string;
  onSetRoomCode?: (code: string) => void;
  [key: string]: any;
}

export const HarfbazBeklemeOdasiScreen: React.FC<HarfbazBeklemeOdasiScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit,
  roomCode: propRoomCode,
  onSetRoomCode
}) => {
  const { profile } = useAuth();
  const storedCode = sessionStorage.getItem('duel_arena_room_code');
  const validProp = propRoomCode && propRoomCode.startsWith('#HB-') ? propRoomCode : null;
  const validStored = storedCode && storedCode.startsWith('#HB-') ? storedCode : null;
  const rawCode = validProp || validStored || '#HB-5912';
  const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '').replace('HB', '').toUpperCase();
  const displayRoomCode = rawCode.startsWith('#') ? rawCode : `#${rawCode}`;

  const [isCodeHidden, setIsCodeHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Room & Players state
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [customRounds, setCustomRounds] = useState<string>('');
  const [roundDuration, setRoundDuration] = useState<number>(60);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [allCategoriesActive, setAllCategoriesActive] = useState<boolean>(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([...CATEGORIES]);
  const [fastVoting, setFastVoting] = useState<boolean>(true);
  const [isHiddenMode, setIsHiddenMode] = useState<boolean>(false);

  // Load and refresh room data
  const refreshRoom = useCallback(async () => {
    try {
      const { data: dbRoom } = await supabase
        .from('harfbaz_rooms')
        .select('*')
        .ilike('code', `%${cleanCode}%`)
        .limit(1)
        .maybeSingle();

      if (dbRoom) {
        if (dbRoom.status === 'PLAYING') {
          sessionStorage.setItem('duel_arena_harfbaz_room_id', dbRoom.id);
          onNavigate?.('harfbaz-game');
          return;
        }

        const roomPlayers = await gameService.getPlayers(dbRoom.id);
        setPlayers(roomPlayers);
        setRoom(dbRoom as any);
        if (dbRoom.settings) {
          if (dbRoom.settings.totalRounds) setTotalRounds(dbRoom.settings.totalRounds);
          if (dbRoom.settings.roundDuration) setRoundDuration(dbRoom.settings.roundDuration);
        }
      } else {
        // Authentic player initialization without mock bots
        setPlayers([
          { id: profile.id || 'p_me', name: profile.username || 'Misafir_Oyuncu', avatar: profile.avatar || 'Tilki', isHost: true, score: 0, isReady: true, joinedAt: new Date().toISOString() },
        ]);
      }
    } catch (e) {
      console.warn('Lobi yenileme hatası:', e);
    }
  }, [cleanCode, onNavigate, profile.id, profile.username, profile.avatar]);

  useEffect(() => {
    refreshRoom();
    const poll = setInterval(refreshRoom, 3000);
    return () => clearInterval(poll);
  }, [refreshRoom]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(displayRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const myPlayer = players.find(p => p.id === profile.id || p.name === profile.username);
  const isHost = myPlayer?.isHost || sessionStorage.getItem('duel_arena_is_host') === 'true' || players.length === 1;

  const handleStartGame = async () => {
    if (!isHost || isStarting) return;
    setIsStarting(true);
    // Persist current room settings into sessionStorage for the match
    sessionStorage.setItem('harfbaz_active_categories', JSON.stringify(allCategoriesActive ? CATEGORIES : selectedCategories));
    sessionStorage.setItem('harfbaz_hidden_mode', isHiddenMode ? 'true' : 'false');
    sessionStorage.setItem('harfbaz_total_rounds', totalRounds.toString());
    sessionStorage.setItem('harfbaz_round_duration', roundDuration.toString());
    try {
      const roomId = room?.id || sessionStorage.getItem('duel_arena_harfbaz_room_id');
      if (roomId) {
        await gameService.startGame(roomId);
      }
      onNavigate?.('harfbaz-game');
    } catch (err) {
      console.warn('Oyun başlatma hatası:', err);
      onNavigate?.('harfbaz-game');
    } finally {
      setIsStarting(false);
    }
  };

  const handleKick = async (playerId: string) => {
    if (!isHost || !room?.id) return;
    try {
      await gameService.kickPlayer(room.id, playerId);
      await refreshRoom();
    } catch (e) {
      console.warn('Oyuncu atma hatası:', e);
    }
  };

  const handleToggleCategory = (cat: string) => {
    if (!isHost) return;
    let next: string[];
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length <= 3) return; // Keep at least 3 categories
      next = selectedCategories.filter(c => c !== cat);
    } else {
      next = [...selectedCategories, cat];
    }
    setSelectedCategories(next);
    handleUpdateSetting('categories', next);
  };

  const handleToggleAllCategories = () => {
    if (!isHost) return;
    const nextActive = !allCategoriesActive;
    setAllCategoriesActive(nextActive);
    const nextCats = nextActive ? [...CATEGORIES] : (selectedCategories.length >= 3 ? selectedCategories : [...CATEGORIES]);
    if (nextActive) {
      setSelectedCategories([...CATEGORIES]);
    }
    handleUpdateSetting('categories', nextCats);
  };

  const handleUpdateSetting = async (
    type: 'rounds' | 'duration' | 'categories' | 'voting' | 'hiddenMode',
    val: any
  ) => {
    let nextRounds = totalRounds;
    let nextDuration = roundDuration;
    let nextCategories = selectedCategories;
    let nextVoting = fastVoting;
    let nextHiddenMode = isHiddenMode;

    if (type === 'rounds') {
      nextRounds = Number(val);
      setTotalRounds(nextRounds);
    } else if (type === 'duration') {
      nextDuration = Number(val);
      setRoundDuration(nextDuration);
    } else if (type === 'categories') {
      nextCategories = val;
      sessionStorage.setItem('harfbaz_active_categories', JSON.stringify(val));
    } else if (type === 'voting') {
      nextVoting = Boolean(val);
      setFastVoting(nextVoting);
    } else if (type === 'hiddenMode') {
      nextHiddenMode = Boolean(val);
      setIsHiddenMode(nextHiddenMode);
      sessionStorage.setItem('harfbaz_hidden_mode', nextHiddenMode ? 'true' : 'false');
    }

    const roomId = room?.id || sessionStorage.getItem('duel_arena_harfbaz_room_id');
    if (roomId) {
      try {
        await gameService.updateSettings(roomId, {
          totalRounds: nextRounds,
          roundDuration: nextDuration,
          categories: nextCategories,
          isFastVoting: nextVoting,
          isHiddenMode: nextHiddenMode,
        } as any);
      } catch (err) {
        console.warn('Harfbaz ayar güncelleme hatası:', err);
      }
    }
  };

  const handleLeaveLobby = async () => {
    const pId = myPlayer?.id || profile.id;
    try {
      await gameService.leaveRoom(pId);
    } catch (e) {
      // ignore
    }
    sessionStorage.removeItem('duel_arena_room_code');
    sessionStorage.removeItem('duel_arena_is_host');
    onNavigate?.('portal');
  };

  const readyCount = players.filter(p => p.isReady).length;
  // Sınırsız katılım: 8 kişi kısıtlaması kaldırıldı, dinamik açık yuvalar sağlanıyor
  const emptySlots = Math.max(2, Math.max(players.length + 2, 10) - players.length);

  return (
    <main className="w-full pt-20 bg-surface flex-1"><div className="flex flex-col w-full">
<div className="w-full px-gutter-mobile md:px-gutter py-space-lg flex flex-col gap-space-lg max-w-[1440px] mx-auto">
{/*  Top Information Bar  */}
<div className="w-full bg-surface-container rounded-xl p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-sm">
<div className="flex items-center gap-space-sm">
<button 
  onClick={() => setShowExitModal(true)}
  className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors px-space-md py-space-xs rounded-full font-label-md text-label-md cursor-pointer" 
  id="leave-lobby-btn" 
  type="button"
>
<span className="material-symbols-outlined text-[18px]">logout</span>
<span>Lobiden Ayrıl</span>
</button>
</div>
<div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-full border border-outline-variant/30">
<span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider font-semibold">ODA KODU:</span>
<button
  onClick={handleCopy}
  type="button"
  title="Kodu kopyalamak için tıklayın"
  className="font-headline-sm text-headline-sm text-primary font-bold tracking-wider font-mono hover:brightness-125 transition-all cursor-pointer select-none flex items-center gap-1.5"
  id="room-code-display"
>
  <span>{isCodeHidden ? '••••••' : displayRoomCode}</span>
  {copied && (
    <span className="font-label-sm text-[10px] bg-secondary-container text-primary-fixed px-1.5 py-0.5 rounded-full font-sans font-bold">
      Kopyalandı!
    </span>
  )}
</button>
<button
  onClick={() => setIsCodeHidden(!isCodeHidden)}
  className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
  title={isCodeHidden ? "Kodu Göster" : "Kodu Gizle"}
  type="button"
>
  <span className="material-symbols-outlined text-[16px]">
    {isCodeHidden ? 'visibility' : 'visibility_off'}
  </span>
</button>
<button
  onClick={handleCopy}
  className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
  id="copy-code-btn"
  title="Kodu Kopyala"
  type="button"
>
  <span className="material-symbols-outlined text-[16px]">
    {copied ? 'check' : 'content_copy'}
  </span>
</button>
<span className="text-on-surface-variant/40 font-body-sm">|</span>
<span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">lock_open</span>
  Şifresiz
</span>
</div>
<div className="flex items-center gap-space-sm">
<div className="flex items-center gap-space-xs bg-secondary-container/40 px-space-md py-space-xs rounded-full">
<span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
<span className="font-label-md text-label-md text-secondary">
  Oyuncu Durumu: <span className="font-bold text-on-surface">{readyCount} / {players.length} Hazır</span>
</span>
</div>
</div>
</div>
{/*  Main 2-Column Grid Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg w-full items-start">
{/*  Left Column: Players Grid (7 Cols on desktop)  */}
<div className="lg:col-span-7 flex flex-col gap-space-md">
{/*  Players Header  */}
<div className="bg-surface-container rounded-xl p-space-lg shadow-sm">
<div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-outline-variant/10">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary-container text-[24px]">group</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
  <span>Katılımcılar</span>
  <span className="text-primary font-title-md font-bold">({players.length} Oyuncu)</span>
</h2>
</div>
<div className="flex items-center gap-space-xs">
<span className="font-label-sm text-label-sm text-secondary bg-secondary-container/40 px-space-sm py-1 rounded-full uppercase tracking-wider font-semibold flex items-center gap-1 border border-secondary-container">
  <span className="material-symbols-outlined text-[15px]">all_inclusive</span> Sınırsız Katılım
</span>
</div>
</div>
{/*  Slots Grid  */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm" id="player-slots-container">
{players.map((p, idx) => {
  const isMe = p.id === profile.id || p.name === profile.username;
  return (
    <div 
      key={p.id || idx}
      className={`rounded-lg p-space-sm flex items-center justify-between transition-all ${
        isMe ? 'bg-secondary-container/30 ring-1 ring-primary-container/40' : 'bg-surface-container-high hover:bg-surface-variant'
      }`}
    >
      <div className="flex items-center gap-space-sm min-w-0">
        <div className={`relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
          isMe ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-on-surface-variant'
        }`}>
          <span className="material-symbols-outlined text-[22px]">
            {p.avatar === 'Baykuş' ? 'visibility' : p.avatar === 'Aslan' ? 'cruelty_free' : p.avatar === 'Robot' ? 'smart_toy' : 'face'}
          </span>
          {p.isHost && (
            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary-container" title="Kurucu Host">
              <span className="material-symbols-outlined text-[13px]" style={{"fontVariationSettings":"'FILL' 1"}}>workspace_premium</span>
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-title-md text-title-md text-on-surface font-bold truncate">{p.name}</span>
            {isMe && <span className="bg-primary/20 text-primary text-[10px] font-label-sm px-1.5 py-0.5 rounded-full uppercase">SEN</span>}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {p.isHost ? 'Lobi Sahibi' : 'Katılımcı'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-space-xs shrink-0">
        {p.isReady ? (
          <span className="bg-primary-container/20 text-primary-container font-label-sm text-label-sm px-space-sm py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check</span>
            Hazır
          </span>
        ) : (
          <span className="bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm px-space-sm py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
            Bekliyor...
          </span>
        )}
        {isHost && !isMe && (
          <button 
            onClick={() => handleKick(p.id)}
            className="w-7 h-7 rounded-full bg-surface-container-lowest hover:bg-error-container text-on-surface-variant hover:text-on-error-container flex items-center justify-center transition-colors cursor-pointer" 
            title="Odadan Çıkar" 
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>
    </div>
  );
})}

{/* Quick Invite Slot */}
<button 
  onClick={handleCopy}
  type="button"
  className="bg-secondary-container/20 border border-dashed border-primary/40 hover:bg-secondary-container/30 rounded-lg p-space-sm flex items-center justify-between transition-all cursor-pointer group text-left"
>
  <div className="flex items-center gap-space-sm">
    <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
      <span className="material-symbols-outlined text-[20px]">person_add</span>
    </div>
    <div className="flex flex-col">
      <span className="font-title-md text-title-md text-on-surface font-semibold">Arkadaşını Davet Et</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{copied ? 'Oda Kodu Kopyalandı!' : 'Lobi kodunu paylaşarak sınırsız oyuncu çağır'}</span>
    </div>
  </div>
</button>

{/* Open Dynamic Slots */}
{Array.from({ length: emptySlots }).map((_, i) => (
  <div key={`empty-slot-${i}`} className="bg-surface-container-low/50 border border-dashed border-outline-variant/30 rounded-lg p-space-sm flex items-center justify-between opacity-50">
    <div className="flex items-center gap-space-sm">
      <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
        <span className="material-symbols-outlined text-[20px]">group_add</span>
      </div>
      <span className="font-body-md text-body-md text-outline italic">Açık Yuva (Sınırsız)</span>
    </div>
  </div>
))}
</div>
</div>
</div>

{/*  Right Column: Room Settings (5 Cols on desktop)  */}
<div className="lg:col-span-5 flex flex-col gap-space-md">
<div className="bg-surface-container rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary-container text-[24px]">tune</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Oda Parametreleri</h2>
</div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
  {isHost ? 'Host Yetkisi' : 'Kilitli'}
</span>
</div>
{/*  Parameter 1: Tur Sayısı  */}
<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-on-surface flex items-center justify-between">
<span>Tur Sayısı</span>
<span className="text-primary font-bold" id="label-round-count">{totalRounds} Tur Seçili</span>
</label>
<div className="flex items-center flex-wrap gap-2">
{[3, 5, 7].map((num) => (
  <button 
    key={num}
    onClick={() => {
      setCustomRounds('');
      handleUpdateSetting('rounds', num);
    }}
    disabled={!isHost}
    className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
      totalRounds === num && !customRounds
        ? 'bg-primary-container text-on-primary-container font-bold shadow-md' 
        : 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
    }`} 
    type="button"
  >
    {num} Tur
  </button>
))}
<div className="flex-1 min-w-[110px] relative">
<input 
  disabled={!isHost}
  value={customRounds}
  onChange={(e) => {
    setCustomRounds(e.target.value);
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num > 0) handleUpdateSetting('rounds', num);
  }}
  className="w-full bg-surface-container-high text-on-surface placeholder:text-outline text-label-md px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/20" 
  id="custom-rounds-input" 
  placeholder="Özel Tur" 
  type="number"
  min="1"
  max="50"
/>
</div>
</div>
</div>
{/*  Parameter 2: Süre Limiti  */}
<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-on-surface flex items-center justify-between">
<span>Tur Başına Süre</span>
<span className="text-primary font-bold" id="label-round-duration">{roundDuration} Saniye Seçili</span>
</label>
<div className="flex items-center flex-wrap gap-2">
{[45, 60, 90].map((sec) => (
  <button 
    key={sec}
    onClick={() => {
      setCustomDuration('');
      handleUpdateSetting('duration', sec);
    }}
    disabled={!isHost}
    className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
      roundDuration === sec && !customDuration
        ? 'bg-primary-container text-on-primary-container font-bold shadow-md' 
        : 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
    }`} 
    type="button"
  >
    {sec}s
  </button>
))}
<div className="flex-1 min-w-[110px] relative">
<input 
  disabled={!isHost}
  value={customDuration}
  onChange={(e) => {
    setCustomDuration(e.target.value);
    const sec = parseInt(e.target.value, 10);
    if (!isNaN(sec) && sec > 0) handleUpdateSetting('duration', sec);
  }}
  className="w-full bg-surface-container-high text-on-surface placeholder:text-outline text-label-md px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/20" 
  id="custom-duration-input" 
  placeholder="Özel sn" 
  type="number"
  min="10"
  max="300"
/>
</div>
</div>
</div>
{/*  Parameter 3: Category & Gameplay Toggles  */}
<div className="flex flex-col gap-space-sm pt-space-xs">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Kural &amp; Kategori Seçenekleri</span>

{/*  Category Toggle Card with Interactive Elimination  */}
<div className="bg-surface-container-high p-space-sm rounded-lg flex flex-col gap-space-sm">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-primary text-[20px]">category</span>
      <div className="flex flex-col">
        <span className="font-title-md text-title-md text-on-surface">
          {allCategoriesActive ? 'Tüm 10 Kategori Aktif' : `Özel Kategori Seçimi (${selectedCategories.length}/10)`}
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {allCategoriesActive 
            ? 'İsim, Şehir, Hayvan, Bitki, Eşya, Ünlü, Ülke...' 
            : 'İstemediğiniz kategorileri eleyerek oynayın (min. 3)'}
        </span>
      </div>
    </div>
    <button 
      onClick={handleToggleAllCategories}
      disabled={!isHost}
      className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
        allCategoriesActive ? 'bg-primary-container' : 'bg-surface-container-highest border border-outline-variant/30'
      }`} 
      id="toggle-categories-btn" 
      title={allCategoriesActive ? "Özel kategori seçimine geç (Eleyebil)" : "Tüm kategorileri aktifleştir"}
      type="button"
    >
      <div className={`w-4 h-4 rounded-full transition-transform ${
        allCategoriesActive ? 'bg-on-primary-container ml-auto' : 'bg-outline mr-auto'
      }`} id="toggle-cat-dot"></div>
    </button>
  </div>

  {/* Category Elimination / Selection Pills when Deactivated */}
  {!allCategoriesActive && (
    <div className="pt-space-xs border-t border-outline-variant/15 flex flex-col gap-space-2xs">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-primary font-semibold">Oynanacak Kategorileri Seçin / Eleyin:</span>
        <span className="text-[11px] font-label-sm text-on-surface-variant">{selectedCategories.length} / {CATEGORIES.length} aktif</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1" id="category-pills-selector">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              type="button"
              disabled={!isHost}
              onClick={() => handleToggleCategory(cat)}
              className={`px-2.5 py-1 rounded-full font-label-md text-[12px] flex items-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'bg-surface-container text-on-surface-variant/40 line-through border border-outline-variant/20 hover:text-on-surface'
              } ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {isSelected ? 'check' : 'remove'}
              </span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
      {selectedCategories.length <= 3 && (
        <span className="text-[11px] text-tertiary">En az 3 kategori seçili olmalıdır.</span>
      )}
    </div>
  )}
</div>

{/*  Gizli Kelime Modu Toggle Card  */}
<div className="bg-surface-container-high p-space-sm rounded-lg flex items-center justify-between">
  <div className="flex items-center gap-space-sm">
    <span className="material-symbols-outlined text-primary text-[20px]">visibility_off</span>
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <span className="font-title-md text-title-md text-on-surface">Gizli Kelime Modu</span>
        <span className="text-[10px] font-label-sm bg-primary/20 text-primary px-1.5 py-0.2 rounded-full font-bold uppercase">Gizli</span>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant">İnceleme ve oylama ekranında kelimeler gizli gelir; basınca açılır</span>
    </div>
  </div>
  <button 
    onClick={() => isHost && handleUpdateSetting('hiddenMode', !isHiddenMode)}
    disabled={!isHost}
    className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
      isHiddenMode ? 'bg-primary-container' : 'bg-surface-container-highest border border-outline-variant/30'
    }`} 
    id="toggle-hidden-mode-btn" 
    type="button"
  >
    <div className={`w-4 h-4 rounded-full transition-transform ${
      isHiddenMode ? 'bg-on-primary-container ml-auto' : 'bg-outline mr-auto'
    }`} id="toggle-hidden-dot"></div>
  </button>
</div>

{/*  Fast Voting Toggle Card  */}
<div className="bg-surface-container-high p-space-sm rounded-lg flex items-center justify-between">
  <div className="flex items-center gap-space-sm">
    <span className="material-symbols-outlined text-tertiary text-[20px]">how_to_vote</span>
    <div className="flex flex-col">
      <span className="font-title-md text-title-md text-on-surface">Hızlı Oylama Modu</span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">İtirazlar anlık 10 sn ile sınırlanır</span>
    </div>
  </div>
  <button 
    onClick={() => isHost && handleUpdateSetting('voting', !fastVoting)}
    disabled={!isHost}
    className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
      fastVoting ? 'bg-primary-container' : 'bg-surface-container-highest'
    }`} 
    id="toggle-voting-btn" 
    type="button"
  >
    <div className={`w-4 h-4 rounded-full transition-transform ${
      fastVoting ? 'bg-on-primary-container ml-auto' : 'bg-outline mr-auto'
    }`} id="toggle-vote-dot"></div>
  </button>
</div>
</div>
{/*  Launch Game Big CTA  */}
<div className="pt-space-xs flex flex-col gap-space-xs">
<button 
  onClick={handleStartGame}
  disabled={!isHost || isStarting}
  className={`w-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-headline-sm text-headline-sm py-space-md rounded-xl transition-all shadow-lg flex items-center justify-center gap-space-sm group ${
    !isHost ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
  } ${isStarting ? 'opacity-80 cursor-wait' : ''}`} 
  id="start-game-btn" 
  type="button"
>
<span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">
  {isStarting ? 'hourglass_top' : 'play_arrow'}
</span>
<span>{isStarting ? 'Başlatılıyor...' : isHost ? 'Oyunu Başlat' : 'Oda Sahibi Başlatacak'}</span>
</button>
<div className="flex items-center justify-center gap-space-xs text-on-surface-variant">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
<span className="font-body-sm text-body-sm">
  {isHost ? 'Tüm oyuncular hazır durumdayken oyun başlatılabilir' : 'Hazır durumdasınız, oyunun başlaması bekleniyor'}
</span>
</div>
</div>
</div>
</div>
</div>
</div>

{/*  Exit Modal  */}
{showExitModal && (
  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-gutter">
  <div className="bg-surface-container rounded-xl p-space-xl max-w-md w-full shadow-2xl flex flex-col gap-space-md">
  <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center text-error mx-auto">
  <span className="material-symbols-outlined text-[28px]">logout</span>
  </div>
  <div className="text-center flex flex-col gap-space-2xs">
  <h3 className="font-headline-sm text-headline-sm text-on-surface">Lobiden Ayrılmak İstiyor Musunuz?</h3>
  <p className="font-body-md text-body-md text-on-surface-variant">
    Lobiden ayrıldığınızda ana portala yönlendirileceksiniz.
  </p>
  </div>
  <div className="grid grid-cols-2 gap-space-sm pt-space-sm">
  <button 
    onClick={() => setShowExitModal(false)}
    className="bg-surface-container-high hover:bg-surface-variant text-on-surface py-space-xs rounded-full font-label-md text-label-md transition-colors cursor-pointer" 
    type="button"
  >
    Vazgeç
  </button>
  <button 
    onClick={handleLeaveLobby}
    className="bg-error hover:bg-error-container text-on-error hover:text-on-error-container py-space-xs rounded-full font-label-md text-label-md transition-colors cursor-pointer" 
    type="button"
  >
    Ayrıl
  </button>
  </div>
  </div>
  </div>
)}
</div>
</main>
  );
};

export default HarfbazBeklemeOdasiScreen;
