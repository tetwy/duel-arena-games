import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllCardsRaw, 
  getRoomDetails, 
  getPlayersInRoom, 
  safeScorePoint, 
  safeLosePoint, 
  safePass, 
  safeIncrementCard, 
  finishGame,
  startNextTurn,
  subscribeToRoom 
} from '../games/veto/services/gameService';
import type { CardData, Player } from '../games/veto/types';

interface VetoCanliDuelloScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  roomCode?: string;
  [key: string]: any;
}

export const VetoCanliDuelloScreen: React.FC<VetoCanliDuelloScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit,
  roomCode: propRoomCode
}) => {
  const { profile } = useAuth();
  const rawCode = propRoomCode || sessionStorage.getItem('duel_arena_room_code') || '#VT-8492';
  const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const [cards, setCards] = useState<CardData[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A');
  const [redScore, setRedScore] = useState<number>(0);
  const [blueScore, setBlueScore] = useState<number>(0);
  const [passCount, setPassCount] = useState<number>(0);
  const [passLimit, setPassLimit] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);

  // Live Guesses Stream
  const [guessInput, setGuessInput] = useState<string>('');
  const [guesses, setGuesses] = useState<Array<{ sender: string, text: string, time: string, isHighlighted?: boolean }>>([]);

  // Load cards and room details
  useEffect(() => {
    let isMounted = true;

    const loadGameData = async () => {
      try {
        const loadedCards = await getAllCardsRaw();
        if (isMounted && loadedCards.length > 0) {
          setCards(loadedCards);
        }

        const roomDetails = await getRoomDetails(cleanCode);
        if (isMounted && roomDetails) {
          setRoom(roomDetails);
          setRedScore(roomDetails.team_a_score || 0);
          setBlueScore(roomDetails.team_b_score || 0);
          setCurrentCardIndex(roomDetails.current_card_index || 0);
          setPassLimit(roomDetails.pass_limit !== undefined ? roomDetails.pass_limit : 3);
          setPassCount(roomDetails.pass_count || 0);
          setActiveTeam(roomDetails.active_team_index === 1 || roomDetails.active_team === 'B' ? 'B' : 'A');
        }

        const roomPlayers = await getPlayersInRoom(cleanCode);
        if (isMounted) setPlayers(roomPlayers);
      } catch (err) {
        console.warn('Oyun verisi yüklenirken hata:', err);
      }
    };

    loadGameData();
    const interval = setInterval(loadGameData, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [cleanCode]);

  // Realtime subscription
  useEffect(() => {
    const sub = subscribeToRoom(cleanCode, (payload) => {
      if (payload?.new) {
        const nr = payload.new;
        if (nr.team_a_score !== undefined) setRedScore(nr.team_a_score);
        if (nr.team_b_score !== undefined) setBlueScore(nr.team_b_score);
        if (nr.current_card_index !== undefined) setCurrentCardIndex(nr.current_card_index);
        if (nr.pass_count !== undefined) setPassCount(nr.pass_count);
        if (nr.status === 'GAME_OVER' || nr.status === 'FINISHED') {
          onNavigate?.('veto-victory');
        }
      }
    });

    return () => {
      sub?.unsubscribe?.();
    };
  }, [cleanCode, onNavigate]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch turn automatically
          const nextT = activeTeam === 'A' ? 'B' : 'A';
          setActiveTeam(nextT);
          const roundDuration = room?.round_time || 60;
          startNextTurn(cleanCode, nextT, roundDuration);
          return roundDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTeam, cleanCode, room?.round_time]);

  // Current Card
  const currentCard = cards[currentCardIndex % (cards.length || 1)] || {
    id: 'c1',
    word: 'KARA DELİK',
    category: 'BİLİM & UZAY',
    forbidden_words: ['Uzay', 'Çekim', 'Işık', 'Hawking', 'Yıldız']
  };

  const forbiddenList = currentCard.forbidden_words || (currentCard as any).taboo_words || ['Uzay', 'Çekim', 'Işık', 'Hawking', 'Yıldız'];

  const handleCorrect = async () => {
    try {
      const isTeamA = activeTeam === 'A';
      const currentScore = isTeamA ? redScore : blueScore;
      const targetScore = room?.target_score || 50;

      await safeScorePoint(cleanCode, activeTeam);
      await safeIncrementCard(cleanCode);

      setStreak((s) => s + 1);
      if (isTeamA) setRedScore((s) => s + 1);
      else setBlueScore((s) => s + 1);
      setCurrentCardIndex((idx) => idx + 1);

      setGuesses((prev) => [
        { sender: profile.username || 'Sen', text: `"${currentCard.word}" Doğru! 🎉`, time: 'Şimdi', isHighlighted: true },
        ...prev.slice(0, 4)
      ]);

      if (currentScore + 1 >= targetScore) {
        await finishGame(cleanCode, activeTeam, currentScore + 1);
        onNavigate?.('veto-victory');
      }
    } catch (err) {
      console.warn('Doğru bildirme hatası:', err);
    }
  };

  const handlePass = async () => {
    if (passLimit < 99 && passCount >= passLimit) {
      alert('Pas hakkınız tükendi!');
      return;
    }
    try {
      await safePass(cleanCode);
      await safeIncrementCard(cleanCode);

      setPassCount((p) => p + 1);
      setCurrentCardIndex((idx) => idx + 1);
      setStreak(0);

      setGuesses((prev) => [
        { sender: profile.username || 'Sen', text: 'Pas geçildi ⏩', time: 'Şimdi' },
        ...prev.slice(0, 4)
      ]);
    } catch (err) {
      console.warn('Pas hatası:', err);
    }
  };

  const handleVeto = async () => {
    try {
      await safeLosePoint(cleanCode, activeTeam);
      await safeIncrementCard(cleanCode);

      if (activeTeam === 'A') setRedScore((s) => Math.max(0, s - 1));
      else setBlueScore((s) => Math.max(0, s - 1));

      setCurrentCardIndex((idx) => idx + 1);
      setStreak(0);

      setGuesses((prev) => [
        { sender: 'Hakem', text: 'VETO! Yasaklı kelime söylendi (-1 Puan) ❌', time: 'Şimdi' },
        ...prev.slice(0, 4)
      ]);
    } catch (err) {
      console.warn('Veto hatası:', err);
    }
  };

  const handleSendGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const txt = guessInput.trim();
    if (!txt) return;

    const isMatch = txt.toUpperCase() === currentCard.word.toUpperCase();
    setGuesses((prev) => [
      { sender: profile.username || 'Sen', text: `"${txt}"`, time: 'Şimdi', isHighlighted: isMatch },
      ...prev.slice(0, 4)
    ]);
    setGuessInput('');

    if (isMatch) {
      handleCorrect();
    }
  };

  const roundDuration = room?.round_time || 60;
  const timerPercent = Math.min(100, Math.max(0, Math.round((timeLeft / roundDuration) * 100)));
  const formattedTimer = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;

  // Find narrator and auditor names
  const redPlayers = players.filter((p) => p.team === 'A');
  const bluePlayers = players.filter((p) => p.team === 'B');
  const narratorName = activeTeam === 'A' 
    ? (redPlayers[0]?.name || profile.username || 'Anlatıcı') 
    : (bluePlayers[0]?.name || 'Rakip Anlatıcı');
  const auditorName = activeTeam === 'A' 
    ? (bluePlayers[0]?.name || 'Rakip Denetçi') 
    : (redPlayers[0]?.name || profile.username || 'Denetçi');

  return (
    <main className="w-full pt-20 bg-background"><div className="flex flex-col w-full px-margin py-space-xl max-w-7xl mx-auto space-y-space-xl">
{/*  Top Match HUD Header  */}
<section className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-stretch">
{/*  Red Team Status  */}
<div className={`md:col-span-4 bg-surface-container rounded-2xl p-space-lg flex items-center justify-between shadow-xl relative overflow-hidden group transition-all ${
  activeTeam === 'A' ? 'ring-2 ring-primary-container' : 'opacity-85'
}`}>
<div className="absolute -right-6 -bottom-6 w-32 h-32 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex items-center gap-space-md z-10">
<div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center text-primary shadow-inner">
<span className="material-symbols-outlined text-[28px]" style={{"fontVariationSettings":"'FILL' 1"}}>shield</span>
</div>
<div>
<div className="flex items-center gap-space-2xs">
{activeTeam === 'A' ? (
  <>
    <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
    <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase">Sıra Bu Takımda</span>
  </>
) : (
  <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">Beklemede</span>
)}
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Kırmızı Takım</h2>
<span className="font-body-sm text-body-sm text-on-surface-variant">
  {activeTeam === 'A' ? `Anlatıcı: ${narratorName}` : `Denetçi: ${auditorName}`}
</span>
</div>
</div>
<div className="text-right z-10">
<span className="font-display-lg text-display-lg text-primary-container tracking-tight" id="red-score">{redScore}</span>
<span className="block font-label-sm text-label-sm text-outline uppercase tracking-widest">PUAN</span>
</div>
</div>
{/*  Center Match Timer HUD  */}
<div className="md:col-span-4 bg-surface-container-low rounded-2xl p-space-md flex flex-col items-center justify-center shadow-lg relative border-none">
<div className="flex items-center gap-space-xs text-outline mb-1">
<span className="material-symbols-outlined text-[18px]">timer</span>
<span className="font-label-md text-label-md tracking-wider uppercase">Kalan Süre</span>
</div>
<div className="flex items-baseline gap-1">
<span className={`font-display-lg text-[52px] leading-none font-bold tracking-tight ${timeLeft <= 10 ? 'text-error animate-pulse' : 'text-on-surface'}`} id="timer-display">
  {formattedTimer}
</span>
</div>
{/*  Ambient Timer Progress Bar  */}
<div className="w-3/4 bg-surface-container-highest h-2 rounded-full mt-space-sm overflow-hidden p-0.5">
<div 
  className="bg-primary-container h-full rounded-full transition-all duration-1000" 
  style={{ width: `${timerPercent}%` }}
></div>
</div>
</div>
{/*  Blue Team Status  */}
<div className={`md:col-span-4 bg-surface-container rounded-2xl p-space-lg flex items-center justify-between shadow-xl relative overflow-hidden transition-all ${
  activeTeam === 'B' ? 'ring-2 ring-tertiary' : 'opacity-85'
}`}>
<div className="text-left z-10">
<span className="font-display-lg text-display-lg text-on-surface-variant tracking-tight" id="blue-score">{blueScore}</span>
<span className="block font-label-sm text-label-sm text-outline uppercase tracking-widest">PUAN</span>
</div>
<div className="flex items-center gap-space-md z-10 text-right">
<div>
<div className="flex items-center justify-end gap-space-2xs">
{activeTeam === 'B' ? (
  <>
    <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
    <span className="font-label-sm text-label-sm text-tertiary tracking-wider uppercase">Sıra Bu Takımda</span>
  </>
) : (
  <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase">Rakip Ekip</span>
)}
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Mavi Takım</h2>
<span className="font-body-sm text-body-sm text-on-surface-variant">
  {activeTeam === 'B' ? `Anlatıcı: ${narratorName}` : `Denetçi: ${auditorName}`}
</span>
</div>
<div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined text-[28px]">shield</span>
</div>
</div>
</div>
</section>
{/*  Main Playing Stage (Arena Grid)  */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
{/*  Left Column: Round Specs & Spectator Telemetry  */}
<div className="lg:col-span-3 space-y-space-md order-2 lg:order-1">
{/*  Round Info Widget  */}
<div className="bg-surface-container rounded-2xl p-space-lg shadow-md">
<div className="flex items-center justify-between mb-space-md">
<span className="font-label-md text-label-md text-outline uppercase tracking-widest">Tur Bilgisi</span>
<span className="font-label-sm text-label-sm px-space-xs py-space-2xs bg-surface-container-high rounded-full text-primary">
  Hedef: {room?.target_score || 50} PUAN
</span>
</div>
<div className="space-y-space-sm">
<div className="flex items-center justify-between p-space-sm bg-surface-container-lowest rounded-xl">
<span className="font-body-sm text-body-sm text-on-surface-variant">Pas Hakkı</span>
<span className="font-title-md text-title-md text-on-surface font-semibold" id="pass-count-text">
  {passLimit >= 99 ? 'Sınırsız' : `${Math.max(0, passLimit - passCount)} / ${passLimit}`}
</span>
</div>
<div className="flex items-center justify-between p-space-sm bg-surface-container-lowest rounded-xl">
<span className="font-body-sm text-body-sm text-on-surface-variant">Kalan Kart</span>
<span className="font-title-md text-title-md text-on-surface font-semibold">
  {Math.max(1, (cards.length || 25) - currentCardIndex)}
</span>
</div>
<div className="flex items-center justify-between p-space-sm bg-surface-container-lowest rounded-xl">
<span className="font-body-sm text-body-sm text-on-surface-variant">Zorluk Seviyesi</span>
<span className="font-label-md text-label-md text-tertiary font-bold">USTA</span>
</div>
</div>
</div>
{/*  Quick Audio Comms Indicator  */}
<div className="bg-surface-container rounded-2xl p-space-lg shadow-md">
<div className="flex items-center justify-between mb-space-md">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">mic</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">Takım Ses Kanalı</span>
</div>
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
</div>
<div className="space-y-space-xs">
<div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-surface-container-low">
<div className="flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-label-sm text-label-sm uppercase">
  {narratorName.slice(0, 2)}
</span>
<span className="font-body-sm text-body-sm text-on-surface">{narratorName} (Anlatıyor)</span>
</div>
{/*  Audio Wave Animation  */}
<div className="flex items-end gap-0.5 h-4">
<span className="w-1 bg-primary-container h-2 rounded-full animate-pulse"></span>
<span className="w-1 bg-primary-container h-4 rounded-full animate-bounce"></span>
<span className="w-1 bg-primary-container h-1 rounded-full animate-pulse"></span>
</div>
</div>
<div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-surface-container-low opacity-70">
<div className="flex items-center gap-space-xs">
<span className="w-6 h-6 rounded-full bg-surface-bright text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm">
  {profile.username?.slice(0, 2).toUpperCase() || 'SN'}
</span>
<span className="font-body-sm text-body-sm text-on-surface">{profile.username || 'Sen'}</span>
</div>
<span className="material-symbols-outlined text-outline text-[16px]">mic</span>
</div>
</div>
</div>
</div>
{/*  Center Focus: VETO ARENA CARD  */}
<div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
<div className="w-full bg-surface-container rounded-3xl p-space-xl shadow-2xl relative flex flex-col items-center overflow-hidden">
{/*  Ambient Top Glow  */}
<div className="absolute -top-12 inset-x-0 mx-auto w-64 h-24 bg-primary-container/15 rounded-full blur-3xl pointer-events-none"></div>
{/*  Category Pill Badge  */}
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-secondary-container rounded-full text-on-secondary-container mb-space-lg shadow-sm">
<span className="material-symbols-outlined text-[18px]">rocket_launch</span>
<span className="font-label-sm text-label-sm font-bold uppercase tracking-widest">
  {currentCard.category || 'GENEL KÜLTÜR'}
</span>
</div>
{/*  Target Guess Word  */}
<div className="text-center mb-space-xl">
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block mb-1">Hedef Sözcük</span>
<h1 className="font-display-lg text-display-lg md:text-[46px] text-on-surface font-extrabold tracking-tight" id="target-word">
  {currentCard.word}
</h1>
</div>
{/*  Divider with Taboo indicator  */}
<div className="w-full flex items-center justify-center gap-space-sm mb-space-lg">
<div className="h-px bg-surface-container-high flex-1"></div>
<span className="font-label-sm text-label-sm text-error bg-surface-container-high px-space-sm py-1 rounded-full uppercase tracking-wider flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[14px]">block</span>
  5 Yasaklı Kelime
</span>
<div className="h-px bg-surface-container-high flex-1"></div>
</div>
{/*  Taboo Word List  */}
<div className="w-full space-y-space-xs mb-space-xl">
{forbiddenList.slice(0, 5).map((word: string, idx: number) => (
  <div key={idx} className="flex items-center justify-between p-space-md bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-colors">
    <div className="flex items-center gap-space-md">
      <span className="font-label-sm text-label-sm text-outline w-4 font-mono">0{idx + 1}</span>
      <span className="font-title-md text-title-md text-on-surface font-semibold tracking-wide uppercase">{word}</span>
    </div>
    <div className="w-7 h-7 rounded-full bg-surface-container-high text-error flex items-center justify-center">
      <span className="material-symbols-outlined text-[18px]">close</span>
    </div>
  </div>
))}
</div>
{/*  Action Control Dock  */}
<div className="w-full grid grid-cols-3 gap-space-sm pt-space-xs">
{/*  VETO Button  */}
<button 
  onClick={handleVeto}
  className="flex flex-col items-center justify-center py-space-sm px-space-md bg-secondary-container hover:bg-secondary-container/80 text-on-secondary rounded-2xl active:scale-95 transition-all shadow-md group cursor-pointer" 
  id="btn-veto" 
  type="button"
>
<div className="w-10 h-10 rounded-full bg-surface-container/60 flex items-center justify-center mb-1 group-hover:bg-error-container transition-colors">
<span className="material-symbols-outlined text-tertiary group-hover:text-error text-[24px]">gavel</span>
</div>
<span className="font-headline-sm text-headline-sm text-tertiary-fixed font-bold leading-tight">VETO</span>
<span className="font-label-sm text-label-sm text-outline tracking-wider">-1 PUAN</span>
</button>
{/*  PASS Button  */}
<button 
  onClick={handlePass}
  className="flex flex-col items-center justify-center py-space-sm px-space-md bg-surface-container-high hover:bg-surface-bright text-on-surface rounded-2xl active:scale-95 transition-all shadow-md cursor-pointer" 
  id="btn-pass" 
  type="button"
>
<div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center mb-1">
<span className="material-symbols-outlined text-outline text-[24px]">forward</span>
</div>
<span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">PAS GEÇ</span>
<span className="font-label-sm text-label-sm text-outline tracking-wider" id="pass-indicator-badge">
  {passLimit >= 99 ? 'SINIRSIZ' : `${Math.max(0, passLimit - passCount)}/${passLimit} KALAN`}
</span>
</button>
{/*  CORRECT Button  */}
<button 
  onClick={handleCorrect}
  className="flex flex-col items-center justify-center py-space-sm px-space-md bg-primary-container hover:bg-primary text-on-primary-container rounded-2xl active:scale-95 transition-all shadow-[0_0_24px_rgba(241,112,14,0.35)] group cursor-pointer" 
  id="btn-correct" 
  type="button"
>
<div className="w-10 h-10 rounded-full bg-on-primary-container/20 flex items-center justify-center mb-1 group-hover:bg-on-primary-container/30 transition-colors">
<span className="material-symbols-outlined text-on-primary-container text-[26px]">check</span>
</div>
<span className="font-headline-sm text-headline-sm text-on-primary font-bold leading-tight">DOĞRU</span>
<span className="font-label-sm text-label-sm text-on-primary/80 tracking-wider">+1 PUAN</span>
</button>
</div>
</div>
</div>
{/*  Right Column: Live Stream & Teammate Guess Feed  */}
<div className="lg:col-span-3 space-y-space-md order-3">
{/*  Live Guess Feed Widget  */}
<div className="bg-surface-container rounded-2xl p-space-lg shadow-md flex flex-col h-full">
<div className="flex items-center justify-between mb-space-md">
<div className="flex items-center gap-space-xs">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span className="font-label-md text-label-md text-on-surface font-semibold">Canlı Tahmin Akışı</span>
</div>
<span className="font-label-sm text-label-sm text-outline uppercase font-mono">CANLI</span>
</div>
{/*  Chat / Guess Bubbles Container  */}
<div className="space-y-space-xs flex-1 overflow-hidden" id="guess-stream">
{guesses.map((g, idx) => (
  <div 
    key={idx} 
    className={`p-space-sm rounded-xl transition-all ${
      g.isHighlighted ? 'bg-secondary-container/40 ring-1 ring-primary/40' : 'bg-surface-container-low'
    }`}
  >
    <div className="flex items-center justify-between text-outline mb-1">
      <span className={`font-label-sm text-label-sm font-semibold ${g.isHighlighted ? 'text-primary font-bold' : 'text-primary'}`}>
        {g.sender}
      </span>
      <span className="font-label-sm text-[10px]">{g.time}</span>
    </div>
    <p className={`font-body-md text-body-md ${g.isHighlighted ? 'text-on-surface font-semibold' : 'text-on-surface'}`}>
      {g.text}
    </p>
  </div>
))}
</div>
{/*  Inline Quick Guess Input  */}
<form onSubmit={handleSendGuess} className="mt-space-md pt-space-xs">
<div className="relative flex items-center">
<input 
  value={guessInput}
  onChange={(e) => setGuessInput(e.target.value)}
  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-1 focus:ring-primary-container" 
  placeholder="Tahmininizi yazın..." 
  type="text"
/>
<button 
  className="absolute right-2 text-primary hover:text-primary-container p-1 flex items-center cursor-pointer" 
  type="submit"
>
<span className="material-symbols-outlined text-[20px]">send</span>
</button>
</div>
</form>
</div>
{/*  Match Stats / Streaks Mini-Card  */}
<div className="bg-surface-container rounded-2xl p-space-md flex items-center justify-between shadow-sm">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-tertiary-container/30 text-tertiary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">local_fire_department</span>
</div>
<div>
<span className="font-label-sm text-label-sm text-outline block">Seri Durumu</span>
<span className="font-label-lg text-label-lg text-on-surface font-bold">{streak} Doğru Seri</span>
</div>
</div>
<span className="font-label-md text-label-md text-primary font-mono">+{streak * 5} XP Bonus</span>
</div>
</div>
</section>
</div></main>
  );
};

export default VetoCanliDuelloScreen;
