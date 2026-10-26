import React, { useState, useEffect } from 'react';
import { getRoomDetails, resetGame } from '../games/veto/services/gameService';

interface VetoSampiyonlukScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  lightningPlayerName?: string;
  mostVetoedPlayerName?: string;
  mostPassedPlayerName?: string;
  roomCode?: string;
  [key: string]: any;
}

export const VetoSampiyonlukScreen: React.FC<VetoSampiyonlukScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit,
  lightningPlayerName = 'Hızlı Tahminci',
  mostVetoedPlayerName = 'Denetçi',
  mostPassedPlayerName = 'Anlatıcı',
  roomCode: propRoomCode
}) => {
  const rawCode = propRoomCode || sessionStorage.getItem('duel_arena_room_code') || '#VT-8492';
  const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const [redScore, setRedScore] = useState<number>(52);
  const [blueScore, setBlueScore] = useState<number>(44);
  const [targetScore, setTargetScore] = useState<number>(50);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(45);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const details = await getRoomDetails(cleanCode);
        if (details) {
          if (details.team_a_score !== undefined) setRedScore(details.team_a_score);
          if (details.team_b_score !== undefined) setBlueScore(details.team_b_score);
          if (details.target_score !== undefined) setTargetScore(details.target_score);
        }
      } catch (e) {
        // keep fallback
      }
    };
    fetchScores();

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cleanCode]);

  const isRedWinner = redScore >= blueScore;
  const winnerName = isRedWinner ? 'KIRMIZI TAKIM' : 'MAVİ TAKIM';

  const handleRematch = async () => {
    setIsResetting(true);
    try {
      await resetGame(cleanCode);
      onNavigate?.('veto-lobby');
    } catch (e) {
      console.warn('Rövanş başlatma hatası:', e);
      onNavigate?.('veto-lobby');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="w-full pt-20 bg-background"><div className="flex flex-col w-full">
<div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-xl">
{/*  Top Celebration Announcement  */}
<div className="relative overflow-hidden bg-surface-container rounded-xl p-space-lg md:p-space-xl shadow-lg flex flex-col items-center text-center">
{/*  Glow ambient background  */}
<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/15 rounded-full blur-3xl pointer-events-none"></div>
<div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-secondary-container/40 text-primary mb-space-sm">
<span className="material-symbols-outlined text-[18px]">workspace_premium</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider">Mücadele Tamamlandı</span>
</div>
<h1 className="font-display-lg text-display-lg text-on-surface tracking-tight flex items-center justify-center flex-wrap gap-x-space-sm">
<span>🏆</span>
<span className="text-primary-container">{winnerName}</span>
<span>ZAFERE ULAŞTI!</span>
</h1>
<p className="mt-space-xs font-headline-md text-headline-md text-outline font-semibold">
        Nihai Skor: <span className="text-primary font-bold">{redScore}</span> — <span className="text-on-surface-variant font-bold">{blueScore}</span>
</p>
<span className="mt-space-2xs font-body-sm text-body-sm text-on-surface-variant">Hedef: {targetScore} Puan • Mücadele Tamamlandı</span>
</div>
{/*  Match Summary & Team Comparison Cards  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Champion: Red Team  */}
<div className="lg:col-span-6 bg-surface-container-high rounded-xl p-space-xl shadow-md relative overflow-hidden flex flex-col justify-between">
<div className="absolute top-0 left-0 bottom-0 w-2 bg-primary-container"></div>
<div className="flex flex-col gap-space-md">
<div className="flex items-start justify-between">
<div>
<div className="flex items-center gap-space-xs">
<span className="font-label-sm text-label-sm uppercase px-space-xs py-space-2xs rounded bg-primary-container text-on-primary-container font-bold">
  {isRedWinner ? 'Şampiyon' : 'İkinci'}
</span>
<span className="font-label-sm text-label-sm text-outline">Grup A</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-2xs">Kırmızı Takım</h2>
</div>
<div className="text-right">
<span className="font-display-lg text-display-lg text-primary-container">{redScore}</span>
<span className="block font-label-sm text-label-sm text-outline">TOPLAM PUAN</span>
</div>
</div>
{/*  Highlight MVP  */}
<div className="bg-surface-container-low rounded-lg p-space-md flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">mic</span>
</div>
<div>
<span className="font-label-sm text-label-sm text-outline uppercase block">MVP Anlatıcı</span>
<span className="font-title-md text-title-md text-on-surface">Boran 'Apex'</span>
</div>
</div>
<span className="font-label-md text-label-md text-primary font-bold">32 Anlatım</span>
</div>
{/*  Breakdown Metrics  */}
<div className="grid grid-cols-2 gap-space-sm pt-space-xs">
<div className="bg-surface-container p-space-md rounded-lg">
<span className="font-body-sm text-body-sm text-outline block">Doğru Bildirilen</span>
<span className="font-headline-md text-headline-md text-on-surface font-bold mt-1">{redScore}</span>
<span className="font-label-sm text-label-sm text-primary">+{redScore} Puan</span>
</div>
<div className="bg-surface-container p-space-md rounded-lg">
<span className="font-body-sm text-body-sm text-outline block">Veto Cezası</span>
<span className="font-headline-md text-headline-md text-error font-bold mt-1">-2</span>
<span className="font-label-sm text-label-sm text-error">2 İhlal</span>
</div>
</div>
</div>
{/*  Success Ratio Indicator  */}
<div className="mt-space-lg">
<div className="flex justify-between font-label-sm text-label-sm text-outline mb-1">
<span>Başarı Oranı</span>
<span className="text-on-surface font-semibold">96.4%</span>
</div>
<div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full" style={{"width":"96.4%"}}></div>
</div>
</div>
</div>
{/*  Runner Up: Blue Team  */}
<div className="lg:col-span-6 bg-surface-container rounded-xl p-space-xl shadow-md relative overflow-hidden flex flex-col justify-between">
<div className="absolute top-0 left-0 bottom-0 w-2 bg-tertiary"></div>
<div className="flex flex-col gap-space-md">
<div className="flex items-start justify-between">
<div>
<div className="flex items-center gap-space-xs">
<span className="font-label-sm text-label-sm uppercase px-space-xs py-space-2xs rounded bg-surface-bright text-on-surface font-bold">
  {!isRedWinner ? 'Şampiyon' : 'İkinci'}
</span>
<span className="font-label-sm text-label-sm text-outline">Grup B</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-2xs">Mavi Takım</h2>
</div>
<div className="text-right">
<span className="font-display-lg text-display-lg text-outline">{blueScore}</span>
<span className="block font-label-sm text-label-sm text-outline">TOPLAM PUAN</span>
</div>
</div>
{/*  Highlight Denetçi  */}
<div className="bg-surface-container-low rounded-lg p-space-md flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
<span className="material-symbols-outlined text-[20px]">gavel</span>
</div>
<div>
<span className="font-label-sm text-label-sm text-outline uppercase block">En Dikkatli Denetçi</span>
<span className="font-title-md text-title-md text-on-surface">Simge 'Observer'</span>
</div>
</div>
<span className="font-label-md text-label-md text-tertiary font-bold">4 Veto Yakalama</span>
</div>
{/*  Breakdown Metrics  */}
<div className="grid grid-cols-2 gap-space-sm pt-space-xs">
<div className="bg-surface-container-low p-space-md rounded-lg">
<span className="font-body-sm text-body-sm text-outline block">Doğru Bildirilen</span>
<span className="font-headline-md text-headline-md text-on-surface font-bold mt-1">{blueScore}</span>
<span className="font-label-sm text-label-sm text-outline">+{blueScore} Puan</span>
</div>
<div className="bg-surface-container-low p-space-md rounded-lg">
<span className="font-body-sm text-body-sm text-outline block">Pas Hakkı</span>
<span className="font-headline-md text-headline-md text-outline font-bold mt-1">11</span>
<span className="font-label-sm text-label-sm text-outline">Pas Kullanıldı</span>
</div>
</div>
</div>
{/*  Success Ratio Indicator  */}
<div className="mt-space-lg">
<div className="flex justify-between font-label-sm text-label-sm text-outline mb-1">
<span>Başarı Oranı</span>
<span className="text-on-surface font-semibold">88.0%</span>
</div>
<div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full bg-tertiary rounded-full" style={{"width":"88%"}}></div>
</div>
</div>
</div>
</div>
{/*  Special Recognition Medals  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<div className="bg-surface-container rounded-xl p-space-lg flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">bolt</span>
</div>
<div>
<span className="font-label-sm text-label-sm text-outline uppercase">Yıldırım Hızı</span>
<h3 className="font-title-md text-title-md text-on-surface font-bold">{lightningPlayerName}</h3>
<span className="font-body-sm text-body-sm text-primary">Ortalama 4.2 sn/kelime</span>
</div>
</div>
<div className="bg-surface-container rounded-xl p-space-lg flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-error-container/20 text-error flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">block</span>
</div>
<div>
<span className="font-label-sm text-label-sm text-outline uppercase">En Çok Veto Yiyen</span>
<h3 className="font-title-md text-title-md text-on-surface font-bold">{mostVetoedPlayerName}</h3>
<span className="font-body-sm text-body-sm text-error">4 İhlal Kaydedildi</span>
</div>
</div>
<div className="bg-surface-container rounded-xl p-space-lg flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-surface-container-high text-outline flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">forward</span>
</div>
<div>
<span className="font-label-sm text-label-sm text-outline uppercase">Pas Ustası</span>
<h3 className="font-title-md text-title-md text-on-surface font-bold">{mostPassedPlayerName}</h3>
<span className="font-body-sm text-body-sm text-outline">7 Pas Kullanıldı</span>
</div>
</div>
</div>
{/*  Bottom Actions Container  */}
<div className="w-full bg-surface-container rounded-xl p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-md">
<div className="flex items-center gap-space-xs text-outline">
<span className="material-symbols-outlined text-[20px] text-primary">timer</span>
<span className="font-body-sm text-body-sm">Oda lideri seçim yapana kadar bekleme süresi: <strong className="text-on-surface" id="countdown">{countdown}s</strong></span>
</div>
<div className="flex items-center flex-wrap justify-end gap-space-sm w-full sm:w-auto">
{/*  Return to Portal Action (Tertiary)  */}
<a className="px-space-md py-space-xs rounded-full font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-space-xs cursor-pointer" data-path="portal" onClick={(e) => { e.preventDefault(); onNavigate?.('portal'); }} href="#/portal">
<span className="material-symbols-outlined text-[18px]">home</span>
<span>Ortak Portala Dön</span>
</a>
{/*  Return to Lobby Action (Secondary)  */}
<a className="px-space-md py-space-xs rounded-full font-label-md text-label-md bg-secondary-container text-primary hover:bg-opacity-80 transition-colors flex items-center gap-space-xs cursor-pointer" data-path="veto-lobby" onClick={(e) => { e.preventDefault(); onNavigate?.('veto-lobby'); }} href="#/veto-lobby">
<span className="material-symbols-outlined text-[18px]">meeting_room</span>
<span>Takım Lobisine Dön</span>
</a>
{/*  Rematch Action (Primary CTA with Amber Lift)  */}
<button 
  onClick={handleRematch}
  disabled={isResetting}
  className={`px-space-lg py-space-xs rounded-full font-label-md text-label-md bg-primary-container text-on-primary-container font-bold hover:brightness-110 shadow-[0_4px_16px_rgba(241,112,14,0.3)] transition-all flex items-center gap-space-xs active:scale-95 cursor-pointer ${isResetting ? 'opacity-75 cursor-wait' : ''}`} 
  id="rematchBtn" 
  type="button"
>
<span className="material-symbols-outlined text-[20px]">
  {isResetting ? 'hourglass_top' : 'replay'}
</span>
<span>{isResetting ? 'Yenileniyor...' : 'Rövanş Yap'}</span>
</button>
</div>
</div>
</div>
</div>
</main>
  );
};

export default VetoSampiyonlukScreen;
