import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { gameService } from '../games/harfbaz/services/gameService';

interface HarfbazCanliOyunScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  roomCode?: string;
  [key: string]: any;
}

const ALL_CATEGORIES = [
  { key: 'isim', name: 'İsim', num: 1, label: '1. İsim', icon: 'person', placeholder: 'isim' },
  { key: 'sehir', name: 'Şehir', num: 2, label: '2. Şehir', icon: 'location_city', placeholder: 'şehir' },
  { key: 'hayvan', name: 'Hayvan', num: 3, label: '3. Hayvan', icon: 'pets', placeholder: 'hayvan' },
  { key: 'bitki', name: 'Bitki', num: 4, label: '4. Bitki', icon: 'yard', placeholder: 'bitki' },
  { key: 'esya', name: 'Eşya', num: 5, label: '5. Eşya', icon: 'chair', placeholder: 'eşya' },
  { key: 'meslek', name: 'Meslek', num: 6, label: '6. Meslek', icon: 'work', placeholder: 'meslek' },
  { key: 'unlu', name: 'Ünlü', num: 7, label: '7. Ünlü / Sanatçı', icon: 'star', placeholder: 'sanatçı' },
  { key: 'ulke', name: 'Ülke', num: 8, label: '8. Ülke', icon: 'flag', placeholder: 'ülke' },
  { key: 'yemek', name: 'Yemek', num: 9, label: '9. Yemek / İçecek', icon: 'restaurant', placeholder: 'yemek' },
  { key: 'dizi', name: 'Dizi/Film', num: 10, label: '10. Dizi / Film', icon: 'movie', placeholder: 'dizi veya film' },
];

export const HarfbazCanliOyunScreen: React.FC<HarfbazCanliOyunScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit,
  roomCode: propRoomCode
}) => {
  const { profile } = useAuth();
  const rawCode = propRoomCode || sessionStorage.getItem('duel_arena_room_code') || '#HB-5912';
  const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '').replace('HB', '').toUpperCase();

  const [currentLetter, setCurrentLetter] = useState<string>('K');
  const [currentRound, setCurrentRound] = useState<number>(2);
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [roundDuration, setRoundDuration] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>('');
  const [gameId, setGameId] = useState<string>('');

  const [isHiddenMode, setIsHiddenMode] = useState<boolean>(() => {
    return sessionStorage.getItem('harfbaz_hidden_mode') === 'true';
  });

  const [activeCategories, setActiveCategories] = useState<string[]>(() => {
    try {
      const raw = sessionStorage.getItem('harfbaz_active_categories');
      if (raw) return JSON.parse(raw);
    } catch {}
    return ['İsim', 'Şehir', 'Hayvan', 'Bitki', 'Eşya', 'Meslek', 'Ünlü', 'Ülke', 'Yemek', 'Dizi/Film'];
  });

  const [answers, setAnswers] = useState<Record<string, string>>({
    isim: '',
    sehir: '',
    hayvan: '',
    bitki: '',
    esya: '',
    meslek: '',
    unlu: '',
    ulke: '',
    dizi: '',
    yemek: ''
  });

  // Load active room and round details
  useEffect(() => {
    const fetchGameSession = async () => {
      try {
        const { data: dbRoom } = await supabase
          .from('harfbaz_rooms')
          .select('*')
          .ilike('code', `%${cleanCode}%`)
          .limit(1)
          .maybeSingle();

        if (dbRoom) {
          setRoomId(dbRoom.id);
          setGameId(dbRoom.current_game_id || `game_${Date.now()}`);
          if (dbRoom.current_letter) setCurrentLetter(dbRoom.current_letter);
          if (dbRoom.current_round) setCurrentRound(dbRoom.current_round);
          if (dbRoom.settings) {
            if (dbRoom.settings.totalRounds) setTotalRounds(dbRoom.settings.totalRounds);
            if (dbRoom.settings.roundDuration) {
              setRoundDuration(dbRoom.settings.roundDuration);
              setTimeLeft(dbRoom.settings.roundDuration);
            }
            if (dbRoom.settings.isHiddenMode !== undefined) {
              setIsHiddenMode(Boolean(dbRoom.settings.isHiddenMode));
            }
            if (Array.isArray(dbRoom.settings.categories) && dbRoom.settings.categories.length > 0) {
              setActiveCategories(dbRoom.settings.categories);
            }
          }
        }
      } catch (err) {
        console.warn('Oyun oturumu yüklenemedi:', err);
      }
    };

    fetchGameSession();
  }, [cleanCode]);

  const handleFieldChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleStopAndLock = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      sessionStorage.setItem('duel_arena_harfbaz_answers', JSON.stringify(answers));
      sessionStorage.setItem('duel_arena_harfbaz_letter', currentLetter);
      
      const rId = roomId || sessionStorage.getItem('duel_arena_harfbaz_room_id');
      const gId = gameId || `game_${Date.now()}`;
      if (rId) {
        await gameService.submitAnswers(rId, profile.id || 'p_me', currentRound, answers, gId);
      }
      onNavigate?.('harfbaz-veto');
    } catch (e) {
      console.warn('Cevaplar gönderilirken hata:', e);
      onNavigate?.('harfbaz-veto');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, answers, currentLetter, roomId, gameId, profile.id, currentRound, onNavigate]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleStopAndLock();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleStopAndLock]);

  // Aktif filtrelenmiş kategoriler
  const visibleCategories = useMemo(() => {
    return ALL_CATEGORIES.filter(cat => activeCategories.includes(cat.name));
  }, [activeCategories]);

  const filledCount = visibleCategories.filter(cat => (answers[cat.key] || '').trim().length > 0).length;
  const fillPercentage = visibleCategories.length > 0 ? Math.round((filledCount / visibleCategories.length) * 100) : 0;

  const formattedTime = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
  const strokeDash = `${Math.round((timeLeft / roundDuration) * 100)}, 100`;

  return (
    <main className="w-full pt-20 bg-surface flex-1"><div className="flex flex-col w-full">
<div className="w-full max-w-7xl mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
{/*  Üst HUD Kontrol Barı  */}
<section className="w-full bg-surface-container-low rounded-xl p-space-md sm:p-space-lg flex flex-col lg:flex-row items-center justify-between gap-space-lg shadow-sm">
{/*  Sol Bilgi Grubu: Çıkış ve Tur  */}
<div className="flex items-center gap-space-md w-full lg:w-auto justify-between lg:justify-start">
<button 
  className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer" 
  onClick={() => onNavigate?.('harfbaz-lobby')}
  type="button"
>
<span className="material-symbols-outlined text-[18px]">arrow_back</span>
<span className="font-label-md text-label-md">Çıkış Yap</span>
</button>
<div className="h-6 w-[1px] bg-surface-variant hidden sm:block"></div>
<div className="flex items-center gap-space-xs bg-surface-container-highest px-space-md py-space-xs rounded-full">
<span className="font-label-sm text-label-sm text-on-surface-variant">ETAP</span>
<span className="font-headline-sm text-headline-sm text-primary tracking-wide">
  TUR 0{currentRound}
</span>
<span className="font-label-sm text-label-sm text-outline">/ 0{totalRounds}</span>
</div>
</div>
{/*  Merkez: Dev Harf  */}
<div className="flex items-center gap-space-md bg-secondary-container/30 px-space-lg py-space-xs rounded-xl shadow-sm">
<div className="flex flex-col text-right">
<span className="font-label-sm text-label-sm uppercase text-secondary">Şanslı Harf</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Başlangıç</span>
</div>
<div className="w-14 h-14 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-display-lg text-display-lg shadow-[0_4px_20px_rgba(241,112,14,0.35)] font-bold">
  {currentLetter}
</div>
</div>
{/*  Sağ: Sayaç (Kalan Süre En Sağda)  */}
<div className="flex items-center gap-space-sm bg-surface-container px-space-md py-space-xs rounded-xl w-full lg:w-auto justify-center lg:justify-end">
<div className="relative w-10 h-10 flex items-center justify-center">
<svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-primary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={strokeDash} strokeLinecap="round" strokeWidth="3.5"></path>
</svg>
<span className="material-symbols-outlined text-[16px] text-primary-container absolute">timer</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Kalan Süre</span>
<span className={`font-headline-sm text-headline-sm tracking-wider ${timeLeft <= 10 ? 'text-error animate-pulse' : 'text-on-surface'}`} id="countdown-text">
  {formattedTime}
</span>
</div>
</div>
</section>
{/*  Oyun Izgarası: Aktif Kategori Alanları  */}
<section className="grid grid-cols-1 md:grid-cols-2 gap-space-md lg:gap-space-lg">
  {visibleCategories.map((cat, idx) => {
    const val = answers[cat.key] || '';
    const isFilled = val.trim().length > 0;

    return (
      <div 
        key={cat.key}
        className="bg-surface-container-low rounded-xl p-space-md hover:bg-surface-container transition-all flex flex-col gap-space-xs shadow-sm border border-outline-variant/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor={`cat-${cat.key}`}>
              {idx + 1}. {cat.name}
            </label>
          </div>
          {isFilled && (
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          )}
        </div>

        <div className="relative flex items-center">
          <input 
            value={val}
            onChange={(e) => handleFieldChange(cat.key, e.target.value)}
            className="w-full bg-surface-container-highest rounded-lg px-space-md py-space-sm font-title-md text-title-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-bright transition-all" 
            id={`cat-${cat.key}`} 
            placeholder={`${currentLetter} ile başlayan ${cat.placeholder}...`} 
            type="text"
          />
        </div>
      </div>
    );
  })}
</section>
{/*  Alt Aksiyon & Durum Kontrol Paneli  */}
<section className="bg-surface-container-low rounded-xl p-space-lg flex flex-col lg:flex-row items-center justify-between gap-space-lg shadow-md">
{/*  Sol: İlerleme Çubuğu ve İstatistik  */}
<div className="flex flex-col gap-space-xs w-full lg:w-1/3">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="text-on-surface-variant uppercase tracking-wider font-bold">Tur Doluluk Oranı</span>
<span className="text-primary font-bold">{filledCount} / {visibleCategories.length} Kategori Dolduruldu</span>
</div>
<div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
<div 
  className="h-full bg-primary-container rounded-full transition-all duration-300" 
  style={{ width: `${fillPercentage}%` }}
></div>
</div>
</div>
{/*  Sağ: Hızlı Mücadele Aksiyon Butonları  */}
<div className="flex flex-wrap items-center gap-space-md w-full lg:w-auto justify-end">
{/*  Büyük Vurgulu Buton: STOP & KİLİTLE  */}
<button 
  onClick={handleStopAndLock}
  disabled={isSubmitting}
  className={`px-space-xl py-space-md rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm flex items-center gap-space-sm shadow-[0_4px_24px_rgba(241,112,14,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer ${
    isSubmitting ? 'opacity-75 cursor-wait' : ''
  }`} 
  id="btn-stop-lock" 
  type="button"
>
<span className="material-symbols-outlined text-[24px]">
  {isSubmitting ? 'hourglass_top' : 'lock_clock'}
</span>
<span className="tracking-wide">
  {isSubmitting ? 'KİLİTLENİYOR...' : 'STOP! SÜREYİ KİLİTLE'}
</span>
</button>
</div>
</section>
</div>
</div>
</main>
  );
};

export default HarfbazCanliOyunScreen;
