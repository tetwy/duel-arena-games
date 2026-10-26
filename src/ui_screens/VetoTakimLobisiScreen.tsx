import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { 
  getPlayersInRoom, 
  getRoomDetails, 
  joinRoom, 
  leaveRoom, 
  switchPlayerTeam, 
  updateRoomSettings, 
  startNextTurn,
  subscribeToRoom 
} from '../games/veto/services/gameService';
import type { Player } from '../games/veto/types';

interface VetoTakimLobisiScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  roomCode?: string;
  onSetRoomCode?: (code: string) => void;
  [key: string]: any;
}

export const VetoTakimLobisiScreen: React.FC<VetoTakimLobisiScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit,
  roomCode: propRoomCode,
  onSetRoomCode
}) => {
  const { profile } = useAuth();
  const storedCode = sessionStorage.getItem('duel_arena_room_code');
  const validProp = propRoomCode && propRoomCode.startsWith('#VT-') ? propRoomCode : null;
  const validStored = storedCode && storedCode.startsWith('#VT-') ? storedCode : null;
  const rawCode = validProp || validStored || '#VT-8492';
  const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const displayRoomCode = rawCode.startsWith('#') ? rawCode : `#${rawCode}`;

  const [isCodeHidden, setIsCodeHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  // Room Settings
  const [targetScore, setTargetScore] = useState<number>(50);
  const [customTarget, setCustomTarget] = useState<string>('');
  const [roundTime, setRoundTime] = useState<number>(60);
  const [customTime, setCustomTime] = useState<string>('');
  const [passLimit, setPassLimit] = useState<number>(3);
  const [customPass, setCustomPass] = useState<string>('');
  const [penaltyEnabled, setPenaltyEnabled] = useState<boolean>(true);
  const [hiddenNarrator, setHiddenNarrator] = useState<boolean>(false);

  // Identify current player and host
  const myPlayer = players.find(p => p.id === profile.id || p.name === profile.username);
  const isHost = myPlayer?.isHost || sessionStorage.getItem('duel_arena_is_host') === 'true' || players.length === 1;

  // Refresh room and players from Supabase / Local
  const refreshLobby = useCallback(async () => {
    try {
      const room = await getRoomDetails(cleanCode);
      if (room) {
        if (room.status === 'PLAYING') {
          onNavigate?.('veto-match');
          return;
        }
        if (room.target_score) setTargetScore(room.target_score);
        if (room.round_time) setRoundTime(room.round_time);
        if (room.pass_limit !== undefined) setPassLimit(room.pass_limit);
      }

      let currentPlayers = await getPlayersInRoom(cleanCode);
      
      // Auto-join if current user isn't in players yet
      const found = currentPlayers.some(p => p.id === profile.id || p.name === profile.username);
      if (!found && cleanCode) {
        await joinRoom(cleanCode, profile.username || 'Oyuncu', profile.id || `p_${Date.now()}`, profile.avatar || 'A');
        currentPlayers = await getPlayersInRoom(cleanCode);
      }

      // If empty, initialize with current user only (no fake mock bots)
      if (currentPlayers.length === 0) {
        currentPlayers = [
          { id: profile.id || 'p_me', name: profile.username || 'Oyuncu', isHost: true, team: 'A', avatar: profile.avatar || 'A' }
        ];
      }

      setPlayers(currentPlayers);
    } catch (e) {
      console.warn('Lobi yenileme hatası:', e);
    }
  }, [cleanCode, profile.id, profile.username, profile.avatar, onNavigate]);

  useEffect(() => {
    refreshLobby();
    const sub = subscribeToRoom(cleanCode, (payload) => {
      if (payload?.new?.status === 'PLAYING') {
        onNavigate?.('veto-match');
      } else {
        refreshLobby();
      }
    });

    const poll = setInterval(refreshLobby, 4000);
    return () => {
      sub?.unsubscribe?.();
      clearInterval(poll);
    };
  }, [cleanCode, refreshLobby, onNavigate]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(displayRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchTeam = async (newTeam: 'A' | 'B') => {
    const pId = myPlayer?.id || profile.id;
    try {
      await switchPlayerTeam(pId, newTeam);
      await refreshLobby();
    } catch (err) {
      console.warn('Takım değiştirme hatası:', err);
    }
  };

  const handleLeaveLobby = async () => {
    const pId = myPlayer?.id || profile.id;
    try {
      await leaveRoom(cleanCode, pId);
    } catch (err) {
      // ignore
    }
    sessionStorage.removeItem('duel_arena_room_code');
    sessionStorage.removeItem('duel_arena_is_host');
    onNavigate?.('portal');
  };

  const handleUpdateSetting = async (key: 'target' | 'time' | 'pass', val: number) => {
    if (!isHost) return;
    const newTarget = key === 'target' ? val : targetScore;
    const newTime = key === 'time' ? val : roundTime;
    const newPass = key === 'pass' ? val : passLimit;

    if (key === 'target') setTargetScore(val);
    if (key === 'time') setRoundTime(val);
    if (key === 'pass') setPassLimit(val);

    try {
      await updateRoomSettings(cleanCode, {
        targetScore: newTarget,
        roundTime: newTime,
        passLimit: newPass
      });
    } catch (err) {
      console.warn('Ayar güncelleme hatası:', err);
    }
  };

  const handleStartDuel = async () => {
    if (!isHost || isStarting) return;
    setIsStarting(true);
    try {
      await startNextTurn(cleanCode, 'A', roundTime, undefined, true);
      onNavigate?.('veto-match');
    } catch (err) {
      console.warn('Oyun başlatma hatası:', err);
      onNavigate?.('veto-match');
    } finally {
      setIsStarting(false);
    }
  };

  const teamAPlayers = players.filter(p => p.team === 'A');
  const teamBPlayers = players.filter(p => p.team === 'B');
  const myTeam = myPlayer?.team || 'A';

  const emptySlotsA = Math.max(0, 5 - teamAPlayers.length);
  const emptySlotsB = Math.max(0, 5 - teamBPlayers.length);

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
<h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">Veto Takım Düello Lobisi</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
          Stratejik ipuçlarıyla yasaklı kelimelere takılmadan takımına puan kazandır. Takımını seç, kuralları ayarla ve düelloya başla.
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

{/*  Top Room Code & Status Bar  */}
<div className="w-full bg-surface-container-low rounded-xl p-space-md sm:p-space-lg flex flex-wrap items-center justify-between gap-space-md shadow-md border border-outline-variant/10">
<div className="flex items-center flex-wrap gap-space-sm sm:gap-space-md">
{/*  Room Code Capsule  */}
<div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full border border-outline-variant/20">
<span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Lobi Kodu</span>
<button
  onClick={handleCopy}
  type="button"
  title="Kodu kopyalamak için tıklayın"
  className="font-title-md text-title-md text-on-surface font-bold tracking-widest ml-1 font-mono hover:text-primary transition-colors cursor-pointer select-none flex items-center gap-1.5"
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
  className="flex items-center justify-center text-outline hover:text-primary transition-colors ml-1 p-1 rounded-full hover:bg-surface-container-high"
  title={isCodeHidden ? "Kodu Göster" : "Kodu Gizle"}
  type="button"
>
  <span className="material-symbols-outlined text-[18px]">
    {isCodeHidden ? 'visibility' : 'visibility_off'}
  </span>
</button>
<button
  onClick={handleCopy}
  className="flex items-center justify-center text-outline hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-high"
  id="btn-copy-code"
  title="Kodu Kopyala"
  type="button"
>
  <span className="material-symbols-outlined text-[18px]">
    {copied ? 'check' : 'content_copy'}
  </span>
</button>
</div>
{/*  Room Capacity  */}
<div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full border border-outline-variant/10">
<span className="material-symbols-outlined text-primary-container text-[18px]">groups</span>
<span className="font-label-sm text-label-sm text-outline uppercase">Kapasite:</span>
<span className="font-title-md text-title-md text-on-surface font-semibold" id="player-count">
  {players.length} / 10 Oyuncu
</span>
</div>
{/*  Host Indicator  */}
<div className="flex items-center gap-space-xs bg-secondary-container/60 px-space-md py-space-xs rounded-full border border-primary/20">
<span className="material-symbols-outlined text-primary text-[18px]" style={{"fontVariationSettings":"'FILL' 1"}}>shield_person</span>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
  Kurucu: {isHost ? 'Sen (Host)' : (players.find(p => p.isHost)?.name || 'Host')}
</span>
</div>
</div>
{/*  Quick Room Status Tag  */}
<div className="flex items-center gap-space-xs">
<span className="font-label-sm text-label-sm text-tertiary bg-surface-container px-space-md py-space-xs rounded-full font-semibold border border-outline-variant/10">
          MOD: VETO TAKIM REKABETİ
        </span>
</div>
</div>

{/*  Main Bento Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
{/*  Left Card: Teams (Span 7)  */}
<div className="lg:col-span-7 bg-surface-container-low rounded-xl p-space-xl flex flex-col gap-space-lg shadow-md border border-outline-variant/10">
<div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/10">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[22px]">diversity_3</span>
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Takım Dağılımı &amp; Kadrolar</h2>
</div>
<span className="font-label-sm text-label-sm text-primary uppercase font-semibold">Toplam {players.length} / 10</span>
</div>

{/*  Teams Dual Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md flex-1">
{/*  Team Alpha (Kırmızı Takım)  */}
<div className="bg-surface-container rounded-xl p-space-md flex flex-col justify-between border border-outline-variant/10">
<div>
<div className="flex items-center justify-between pb-space-xs">
<div className="flex items-center gap-space-xs">
<div className="w-3 h-3 rounded-full bg-primary-container shadow-[0_0_8px_rgba(241,112,14,0.6)]"></div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Kırmızı Takım</h3>
</div>
<span className="font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full bg-secondary-container text-primary font-bold">
  {teamAPlayers.length} Oyuncu
</span>
</div>
{/*  Player List  */}
<div className="flex flex-col gap-space-xs mt-space-sm">
{teamAPlayers.map((p, idx) => {
  const isMe = p.id === profile.id || p.name === profile.username;
  return (
    <div 
      key={p.id || idx}
      className={`p-space-sm rounded-xl flex items-center justify-between gap-space-sm transition-all hover:scale-[1.01] ${
        isMe ? 'bg-secondary-container/90 ring-1 ring-primary-container' : 'bg-surface-container-high'
      }`}
    >
      <div className="flex items-center gap-space-sm min-w-0">
        <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center shrink-0 uppercase ${
          isMe ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-on-surface'
        }`}>
          {p.name.charAt(0) || 'P'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-title-md text-title-md text-on-surface font-bold truncate">
            {isMe ? `Sen (${p.name})` : p.name}
          </span>
          <span className="font-label-sm text-label-sm text-primary">
            {p.isHost ? 'Kaptan • Host' : 'Takım Oyuncusu'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="px-space-xs py-0.5 bg-primary/20 text-primary border border-primary/30 font-label-sm text-[11px] font-bold rounded-full flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-[13px]">check</span> Hazır
        </span>
      </div>
    </div>
  );
})}

{/* Empty Slots */}
{Array.from({ length: emptySlotsA }).map((_, i) => (
  <div key={`empty-a-${i}`} className="p-space-xs px-space-sm bg-surface-container-lowest/50 rounded-xl flex items-center justify-between opacity-50 border border-dashed border-outline-variant/20">
    <div className="flex items-center gap-space-sm">
      <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline">
        <span className="material-symbols-outlined text-[18px]">person_add</span>
      </div>
      <span className="font-body-md text-body-md text-outline italic text-sm">Boş Yuva</span>
    </div>
  </div>
))}
</div>
</div>
{/*  Team Actions  */}
<button 
  onClick={() => myTeam !== 'A' && handleSwitchTeam('A')}
  disabled={myTeam === 'A'}
  className={`w-full mt-space-md py-2.5 px-space-md rounded-full font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-space-xs shadow-sm cursor-pointer ${
    myTeam === 'A' 
      ? 'bg-primary-container text-on-primary-container cursor-default' 
      : 'bg-surface-container-highest text-on-surface hover:bg-secondary-container hover:text-primary'
  }`} 
  type="button"
>
  <span className="material-symbols-outlined text-[18px]">
    {myTeam === 'A' ? 'how_to_reg' : 'swap_horiz'}
  </span>
  {myTeam === 'A' ? 'Bu Takımdasın' : 'Kırmızı Takıma Geç'}
</button>
</div>

{/*  Team Beta (Mavi Takım)  */}
<div className="bg-surface-container rounded-xl p-space-md flex flex-col justify-between border border-outline-variant/10">
<div>
<div className="flex items-center justify-between pb-space-xs">
<div className="flex items-center gap-space-xs">
<div className="w-3 h-3 rounded-full bg-tertiary shadow-[0_0_8px_rgba(255,183,123,0.6)]"></div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Mavi Takım</h3>
</div>
<span className="font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full bg-surface-container-highest text-on-surface font-bold">
  {teamBPlayers.length} Oyuncu
</span>
</div>
{/*  Player List  */}
<div className="flex flex-col gap-space-xs mt-space-sm">
{teamBPlayers.map((p, idx) => {
  const isMe = p.id === profile.id || p.name === profile.username;
  return (
    <div 
      key={p.id || idx}
      className={`p-space-sm rounded-xl flex items-center justify-between gap-space-sm transition-all hover:scale-[1.01] ${
        isMe ? 'bg-secondary-container/90 ring-1 ring-primary-container' : 'bg-surface-container-high'
      }`}
    >
      <div className="flex items-center gap-space-sm min-w-0">
        <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center shrink-0 uppercase ${
          isMe ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-on-surface'
        }`}>
          {p.name.charAt(0) || 'P'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-title-md text-title-md text-on-surface font-bold truncate">
            {isMe ? `Sen (${p.name})` : p.name}
          </span>
          <span className="font-label-sm text-label-sm text-tertiary">
            {p.isHost ? 'Kaptan • Host' : 'Takım Oyuncusu'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="px-space-xs py-0.5 bg-primary-container/20 text-primary-container border border-primary-container/30 font-label-sm text-[11px] font-bold rounded-full flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-[13px]">check</span> Hazır
        </span>
      </div>
    </div>
  );
})}

{/* Empty Slots */}
{Array.from({ length: emptySlotsB }).map((_, i) => (
  <div key={`empty-b-${i}`} className="p-space-xs px-space-sm bg-surface-container-lowest/50 rounded-xl flex items-center justify-between opacity-50 border border-dashed border-outline-variant/20">
    <div className="flex items-center gap-space-sm">
      <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline">
        <span className="material-symbols-outlined text-[18px]">person_add</span>
      </div>
      <span className="font-body-md text-body-md text-outline italic text-sm">Boş Yuva</span>
    </div>
  </div>
))}
</div>
</div>
{/*  Team Actions  */}
<button 
  onClick={() => myTeam !== 'B' && handleSwitchTeam('B')}
  disabled={myTeam === 'B'}
  className={`w-full mt-space-md py-2.5 px-space-md rounded-full font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-space-xs shadow-sm cursor-pointer ${
    myTeam === 'B' 
      ? 'bg-primary-container text-on-primary-container cursor-default' 
      : 'bg-surface-container-highest text-on-surface hover:bg-secondary-container hover:text-primary'
  }`} 
  type="button"
>
  <span className="material-symbols-outlined text-[18px]">
    {myTeam === 'B' ? 'how_to_reg' : 'swap_horiz'}
  </span>
  {myTeam === 'B' ? 'Bu Takımdasın' : 'Mavi Takıma Geç'}
</button>
</div>
</div>
</div>

{/*  Right Card: Settings Console (Span 5)  */}
<div className="lg:col-span-5 bg-surface-container-low rounded-xl p-space-xl flex flex-col gap-space-lg shadow-md border border-outline-variant/10">
<div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/10">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary-container text-[24px]">tune</span>
<h2 className="font-headline-md text-headline-md text-on-surface font-bold">Oyun Parametreleri</h2>
</div>
<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
  {isHost ? 'Host Yetkisi' : 'Kilitli'}
</span>
</div>

{/*  Setting 1: Hedef Puan  */}
<div className="flex flex-col gap-space-xs">
<label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between">
<span>Hedef Puan</span>
<span className="font-label-sm text-label-sm text-primary font-bold" id="label-target-score">
  {targetScore} Puan Seçili
</span>
</label>
<div className="flex items-center flex-wrap gap-2">
{[25, 50, 75].map((val) => (
  <button 
    key={val}
    onClick={() => handleUpdateSetting('target', val)}
    disabled={!isHost}
    className={`param-btn px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
      targetScore === val 
        ? 'bg-primary-container text-on-primary-container font-bold shadow-md' 
        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
    }`} 
    type="button"
  >
    {val}
  </button>
))}
<div className="flex-1 min-w-[110px] relative">
<input 
  disabled={!isHost}
  value={customTarget}
  onChange={(e) => {
    setCustomTarget(e.target.value);
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num > 0) handleUpdateSetting('target', num);
  }}
  className="w-full bg-surface-container text-on-surface placeholder:text-outline text-label-md px-space-sm py-space-xs rounded-full focus:outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/20" 
  id="custom-target" 
  placeholder="Özel Puan" 
  type="number"
/>
</div>
</div>
</div>

{/*  Setting 2: Tur Süresi  */}
<div className="flex flex-col gap-space-xs">
<label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between">
<span>Tur Süresi</span>
<span className="font-label-sm text-label-sm text-primary font-bold" id="label-turn-time">
  {roundTime} Saniye
</span>
</label>
<div className="flex items-center flex-wrap gap-2">
{[60, 90, 120].map((val) => (
  <button 
    key={val}
    onClick={() => handleUpdateSetting('time', val)}
    disabled={!isHost}
    className={`param-btn px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
      roundTime === val 
        ? 'bg-primary-container text-on-primary-container font-bold shadow-md' 
        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
    }`} 
    type="button"
  >
    {val}s
  </button>
))}
<div className="flex-1 min-w-[110px] relative">
<input 
  disabled={!isHost}
  value={customTime}
  onChange={(e) => {
    setCustomTime(e.target.value);
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num > 0) handleUpdateSetting('time', num);
  }}
  className="w-full bg-surface-container text-on-surface placeholder:text-outline text-label-md px-space-sm py-space-xs rounded-full focus:outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/20" 
  id="custom-time" 
  placeholder="Özel sn" 
  type="number"
/>
</div>
</div>
</div>

{/*  Setting 3: Pas Hakkı  */}
<div className="flex flex-col gap-space-xs">
<label className="font-label-lg text-label-lg text-on-surface flex items-center justify-between">
<span>Pas Hakkı</span>
<span className="font-label-sm text-label-sm text-primary font-bold" id="label-pass-count">
  {passLimit >= 99 ? 'Sınırsız Pas' : `${passLimit} Pas`}
</span>
</label>
<div className="flex items-center flex-wrap gap-2">
{[1, 3, 5].map((val) => (
  <button 
    key={val}
    onClick={() => handleUpdateSetting('pass', val)}
    disabled={!isHost}
    className={`param-btn px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
      passLimit === val 
        ? 'bg-primary-container text-on-primary-container font-bold shadow-md' 
        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
    }`} 
    type="button"
  >
    {val}
  </button>
))}
<button 
  onClick={() => handleUpdateSetting('pass', 999)}
  disabled={!isHost}
  className={`param-btn px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all cursor-pointer ${
    passLimit >= 99 
      ? 'bg-primary-container text-on-primary-container font-bold shadow-md' 
      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
  }`} 
  type="button"
>
  Sınırsız
</button>
<div className="flex-1 min-w-[80px] relative">
<input 
  disabled={!isHost}
  value={customPass}
  onChange={(e) => {
    setCustomPass(e.target.value);
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num >= 0) handleUpdateSetting('pass', num);
  }}
  className="w-full bg-surface-container text-on-surface placeholder:text-outline text-label-md px-space-sm py-space-xs rounded-full focus:outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/20" 
  id="custom-pass" 
  placeholder="Özel" 
  type="number"
/>
</div>
</div>
</div>

{/*  Extra Gameplay Flags  */}
<div className="p-space-md bg-surface-container rounded-xl flex flex-col gap-space-xs border border-outline-variant/10">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Ek Kurallar</span>
<div className="flex items-center justify-between py-1">
<span className="font-body-md text-body-md text-on-surface">Veto Kelime Cezası (-1 Puan)</span>
<label className="relative inline-flex items-center cursor-pointer">
<input 
  checked={penaltyEnabled}
  onChange={(e) => setPenaltyEnabled(e.target.checked)}
  disabled={!isHost}
  className="sr-only peer" 
  type="checkbox"
/>
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
<div className="flex items-center justify-between py-1">
<span className="font-body-md text-body-md text-on-surface">Gizli Anlatıcı Modu</span>
<label className="relative inline-flex items-center cursor-pointer">
<input 
  checked={hiddenNarrator}
  onChange={(e) => setHiddenNarrator(e.target.checked)}
  disabled={!isHost}
  className="sr-only peer" 
  type="checkbox"
/>
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>
</div>
</div>
</div>

{/*  Bottom Major Action Bar  */}
<div className="w-full bg-surface-container-low rounded-xl p-space-md sm:p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-md border border-outline-variant/10">
<div className="flex items-center gap-space-md w-full sm:w-auto">
<button 
  onClick={handleLeaveLobby}
  className="w-full sm:w-auto px-space-xl py-2.5 rounded-full bg-surface-container hover:bg-error-container/30 text-on-surface hover:text-error transition-all font-label-md text-label-md font-semibold flex items-center justify-center gap-2 cursor-pointer border border-outline-variant/15" 
  type="button"
>
<span className="material-symbols-outlined text-[20px]">logout</span>
  Lobiden Ayrıl
</button>
<span className="hidden md:inline font-body-sm text-body-sm text-outline">Lobi ayrıldığınızda kuruculuk bir sonraki oyuncuya aktarılır.</span>
</div>
<div className="flex items-center gap-space-md w-full sm:w-auto">
<button 
  onClick={handleStartDuel}
  disabled={!isHost || isStarting}
  className={`w-full sm:w-auto px-space-2xl py-3 rounded-full bg-primary-container hover:bg-tertiary-container text-on-primary-container font-headline-sm text-headline-sm font-bold shadow-[0_4px_16px_rgba(241,112,14,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-space-sm cursor-pointer ${
    !isHost ? 'opacity-60 cursor-not-allowed' : ''
  } ${isStarting ? 'opacity-80 cursor-wait' : ''}`} 
  id="btn-start-duel" 
  type="button"
>
<span className="material-symbols-outlined text-[24px]">
  {isStarting ? 'hourglass_top' : 'swords'}
</span>
  {isStarting ? 'Başlatılıyor...' : isHost ? 'Düelloyu Başlat' : 'Kaptan Başlatacak...'}
</button>
</div>
</div>
</div>
</div>
</main>
  );
};

export default VetoTakimLobisiScreen;
