import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface HarfbazLiderlikPodyumScreenProps {
  onNavigate?: (path: string) => void;
  onConfirmExit?: () => void;
  onCancelExit?: () => void;
  roomCode?: string;
  [key: string]: any;
}

export const HarfbazLiderlikPodyumScreen: React.FC<HarfbazLiderlikPodyumScreenProps> = ({ 
  onNavigate,
  onConfirmExit,
  onCancelExit,
  roomCode: propRoomCode
}) => {
  const { profile } = useAuth();
  
  const getRoomCodeFromHashOrStorage = (): string => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('room=')) {
        const query = hash.split('room=')[1]?.split('&')[0];
        if (query) return query.startsWith('#') ? query : `#${query}`;
      }
    }
    return propRoomCode || sessionStorage.getItem('duel_arena_room_code') || '#HB-5912';
  };

  const rawRoomCode = getRoomCodeFromHashOrStorage();
  const cleanCode = rawRoomCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const displayRoomCode = rawRoomCode.startsWith('#') ? rawRoomCode : `#${rawRoomCode}`;

  const getInitialTab = (): 'harfbaz' | 'veto' | 'genel' => {
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
    if (hash.includes('veto')) return 'veto';
    if (hash.includes('genel') || hash === '#/leaderboard' || hash === '#/liderlik-tablosu' || hash === '#/liderlik') return 'genel';
    return 'harfbaz';
  };

  const [activeGameTab, setActiveGameTab] = useState<'harfbaz' | 'veto' | 'genel'>(getInitialTab);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [activePlayerCount, setActivePlayerCount] = useState<number>(1428);

  // Global ELO Tablosu (Canlı Supabase Profiles)
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([
    { id: 'usr_alpha_1', username: 'Kuzey_Rüzgarı', avatar: '🐺', elo_rating: 1980, total_matches: 142, wins: 118, win_rate: 83 },
    { id: 'usr_alpha_2', username: 'Gölge_Avcısı', avatar: '🗡️', elo_rating: 1895, total_matches: 128, wins: 98, win_rate: 77 },
    { id: 'usr_alpha_3', username: 'Ayışığı_Savaşçısı', avatar: '🌙', elo_rating: 1840, total_matches: 115, wins: 87, win_rate: 76 },
    { id: 'usr_alpha_4', username: 'Demir_Yumruk', avatar: '🛡️', elo_rating: 1785, total_matches: 96, wins: 71, win_rate: 74 },
    { id: 'usr_alpha_5', username: 'Fırtına_Kıran', avatar: '⚡', elo_rating: 1750, total_matches: 89, wins: 64, win_rate: 72 },
    { id: 'usr_alpha_6', username: 'Siber_Samuray', avatar: '⛩️', elo_rating: 1710, total_matches: 82, wins: 59, win_rate: 72 },
    { id: 'usr_alpha_7', username: 'Zaman_Yolcusu', avatar: '⏳', elo_rating: 1680, total_matches: 75, wins: 52, win_rate: 69 },
    { id: 'usr_alpha_8', username: 'Zümrüt_Anka', avatar: '🦅', elo_rating: 1645, total_matches: 68, wins: 48, win_rate: 71 },
    { id: 'usr_alpha_9', username: 'Gece_Gözcüsü', avatar: '🦉', elo_rating: 1610, total_matches: 61, wins: 41, win_rate: 67 },
    { id: 'usr_alpha_10', username: 'Ateş_Ruhu', avatar: '🔥', elo_rating: 1580, total_matches: 54, wins: 36, win_rate: 67 }
  ]);

  // Veto Maç Verisi
  const [vetoMatchData, setVetoMatchData] = useState<any>({
    room_code: cleanCode.startsWith('VT') ? cleanCode : 'VT-8492',
    team_a_name: 'Kırmızı Takım',
    team_b_name: 'Mavi Takım',
    team_a_score: 52,
    team_b_score: 44,
    players: []
  });

  // Her maçın kendine özel sonuçları (oda bazlı)
  const [matchData, setMatchData] = useState(() => {
    try {
      const stored = sessionStorage.getItem(`harfbaz_match_${cleanCode}`);
      if (stored) return JSON.parse(stored);
      const latest = sessionStorage.getItem('harfbaz_latest_match');
      if (latest) {
        const parsed = JSON.parse(latest);
        if (parsed.roomCode && parsed.roomCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanCode) {
          return parsed;
        }
      }
    } catch {}

    return {
      roomCode: displayRoomCode,
      completedAt: new Date().toISOString(),
      rounds: 3,
      categoriesCount: 10,
      players: [
        {
          id: profile.id || 'p_me',
          name: profile.username || 'Misafir_Oyuncu',
          avatar: profile.avatar || '🎭',
          score: 120,
          uniqueCount: 8,
          duplicateCount: 2,
          vetoCount: 0,
          isMe: true,
          avgSpeed: '24.2 Sn'
        }
      ]
    };
  });

  const handleTabChange = (tab: 'harfbaz' | 'veto' | 'genel') => {
    setActiveGameTab(tab);
    let targetPath = `harfbaz-leaderboard?room=${cleanCode}`;
    if (tab === 'veto') targetPath = `veto-leaderboard?room=${cleanCode}`;
    else if (tab === 'genel') targetPath = 'leaderboard';

    window.location.hash = `#/${targetPath}`;
    if (onNavigate) {
      onNavigate(targetPath);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('veto')) setActiveGameTab('veto');
      else if (hash.includes('genel') || hash === '#/leaderboard' || hash === '#/liderlik-tablosu' || hash === '#/liderlik') setActiveGameTab('genel');
      else if (hash.includes('harfbaz')) setActiveGameTab('harfbaz');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Canlı Supabase Veri Yükleme (Global ELO + Oda Maç Verileri)
  useEffect(() => {
    let isMounted = true;
    const fetchLiveStatsAndLeaderboard = async () => {
      if (!isSupabaseConfigured) return;
      try {
        // 1. Canlı Portalı İncele ve Aktif Düellocu Sayısını Getir
        const { data: statsRes } = await supabase.rpc('get_portal_stats');
        if (statsRes?.totalPlayers !== undefined && isMounted) {
          setActivePlayerCount(statsRes.totalPlayers > 0 ? 1420 + statsRes.totalPlayers : 1428);
        }

        // 2. Canlı Küresel ELO Liderlik Tablosu
        const { data: globalData, error: gErr } = await supabase.rpc('get_global_leaderboard', { p_limit: 25 });
        if (!gErr && Array.isArray(globalData) && globalData.length > 0 && isMounted) {
          setGlobalLeaderboard(globalData);
        }

        // 3. Odaya veya Oyuna Özel Maç Sonu Skorları
        const { data: matchRes, error: mErr } = await supabase.rpc('get_match_leaderboard', { p_room_code: cleanCode });
        if (!mErr && matchRes?.found && isMounted) {
          if (matchRes.game === 'veto') {
            setVetoMatchData({
              room_code: matchRes.room_code || cleanCode,
              team_a_name: matchRes.team_a_name || 'Kırmızı Takım',
              team_b_name: matchRes.team_b_name || 'Mavi Takım',
              team_a_score: matchRes.team_a_score ?? 52,
              team_b_score: matchRes.team_b_score ?? 44,
              players: matchRes.players || []
            });
          } else if (matchRes.game === 'harfbaz' && Array.isArray(matchRes.players) && matchRes.players.length > 0) {
            setMatchData((prev: any) => ({
              ...prev,
              roomCode: `#HB-${matchRes.room_code || cleanCode}`,
              rounds: matchRes.current_round || 3,
              players: matchRes.players.map((p: any) => ({
                ...p,
                isMe: p.id === profile.id || p.name === profile.username
              }))
            }));
          }
        }
      } catch (err) {
        console.warn('Canlı liderlik tablosu hatası:', err);
      }
    };

    fetchLiveStatsAndLeaderboard();
    const poll = setInterval(fetchLiveStatsAndLeaderboard, 12000);
    return () => {
      isMounted = false;
      clearInterval(poll);
    };
  }, [cleanCode, profile.id, profile.username]);

  const getLeagueBadge = (elo: number) => {
    if (elo >= 1900) return { name: 'Grandmaster', color: 'text-tertiary-fixed-dim bg-secondary-container/40' };
    if (elo >= 1750) return { name: 'Master', color: 'text-amber-400 bg-amber-400/10' };
    if (elo >= 1600) return { name: 'Diamond', color: 'text-cyan-400 bg-cyan-400/10' };
    if (elo >= 1400) return { name: 'Platinum', color: 'text-emerald-400 bg-emerald-400/10' };
    if (elo >= 1200) return { name: 'Gold', color: 'text-yellow-400 bg-yellow-400/10' };
    return { name: 'Gümüş Lig', color: 'text-outline-variant bg-surface-container-high' };
  };

  const myGlobalIndex = globalLeaderboard.findIndex(p => p.id === profile.id || p.username === profile.username);
  const myCalculatedRank = myGlobalIndex >= 0 ? myGlobalIndex + 1 : Math.max(1, Math.min(1250, 1500 - Math.floor((profile.eloRating || 1200) / 2)));

  const sortedPlayers = [...(matchData.players || [])].sort((a: any, b: any) => b.score - a.score);
  const p1 = sortedPlayers[0] || { id: profile.id || '1', name: profile.username || '1. Oyuncu', score: 0, isMe: true, avgSpeed: '24.2 Sn', uniqueCount: 0, duplicateCount: 0, vetoCount: 0 };
  const p2 = sortedPlayers[1] || { id: '2', name: '2. Sıra (Açık)', score: 0, isMe: false, avgSpeed: '-', uniqueCount: 0, duplicateCount: 0, vetoCount: 0 };
  const p3 = sortedPlayers[2] || { id: '3', name: '3. Sıra (Açık)', score: 0, isMe: false, avgSpeed: '-', uniqueCount: 0, duplicateCount: 0, vetoCount: 0 };
  const scoreDiff = p1.score - p2.score;
  const fastestPlayer = [...sortedPlayers].sort((a: any, b: any) => parseFloat(a.avgSpeed || '99') - parseFloat(b.avgSpeed || '99'))[0] || p1;
  const mostVetoedPlayer = [...sortedPlayers].sort((a: any, b: any) => (b.vetoCount || 0) - (a.vetoCount || 0))[0] || p1;
  const totalUnique = sortedPlayers.reduce((acc: number, p: any) => acc + (p.uniqueCount || 0), 0);
  const totalRounds = matchData.rounds || 3;
  const totalCategories = totalRounds * (matchData.categoriesCount || 10);

  // Veto hesaplamaları
  const isRedWinner = (vetoMatchData.team_a_score || 0) >= (vetoMatchData.team_b_score || 0);
  const teamAName = vetoMatchData.team_a_name || 'Kırmızı Takım';
  const teamBName = vetoMatchData.team_b_name || 'Mavi Takım';
  const scoreA = vetoMatchData.team_a_score || 0;
  const scoreB = vetoMatchData.team_b_score || 0;
  const winnerName = isRedWinner ? teamAName : teamBName;
  const winnerScore = isRedWinner ? scoreA : scoreB;
  const runnerUpName = isRedWinner ? teamBName : teamAName;
  const runnerUpScore = isRedWinner ? scoreB : scoreA;
  
  const vPlayers = (vetoMatchData.players || []).length > 0 ? vetoMatchData.players : [
    { name: `${winnerName} Kaptanı`, score: winnerScore, team: isRedWinner ? 'A' : 'B' },
    { name: `${runnerUpName} Kaptanı`, score: runnerUpScore, team: isRedWinner ? 'B' : 'A' },
    { name: `${winnerName} Anlatıcısı`, score: Math.max(0, winnerScore - 8), team: isRedWinner ? 'A' : 'B' }
  ];
  const v1 = vPlayers[0] || { name: `${winnerName} MVP`, score: winnerScore, team: isRedWinner ? 'A' : 'B' };
  const v2 = vPlayers[1] || { name: `${runnerUpName} Temsilcisi`, score: runnerUpScore, team: isRedWinner ? 'B' : 'A' };
  const v3 = vPlayers[2] || { name: `${winnerName} Üyesi`, score: Math.max(0, winnerScore - 12), team: isRedWinner ? 'A' : 'B' };
  const totalTurns = Math.max(6, Math.round((scoreA + scoreB) / 4));

  // Global ELO Podyum hesaplamaları
  const g1 = globalLeaderboard[0] || { username: 'Kuzey_Rüzgarı', elo_rating: 1980, avatar: '🐺', win_rate: 83, total_matches: 142 };
  const g2 = globalLeaderboard[1] || { username: 'Gölge_Avcısı', elo_rating: 1895, avatar: '🗡️', win_rate: 77, total_matches: 128 };
  const g3 = globalLeaderboard[2] || { username: 'Ayışığı_Savaşçısı', elo_rating: 1840, avatar: '🌙', win_rate: 76, total_matches: 115 };
  const g1Badge = getLeagueBadge(g1.elo_rating);
  const g2Badge = getLeagueBadge(g2.elo_rating);
  const g3Badge = getLeagueBadge(g3.elo_rating);

  return (
    <main className="w-full pt-20 bg-background flex-1">
      <div className="flex flex-col w-full">
        {/*  TOP HERO HEADER SECTION (Matching other portal & legal screens)  */}
        <div className="w-full bg-surface-container-low border-b border-outline-variant/30 pt-space-xl pb-space-lg relative overflow-hidden">
          <div className="w-full px-margin-mobile md:px-margin max-w-7xl mx-auto flex flex-col gap-space-md">
            {/*  Breadcrumb / Overline Info  */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <span className="material-symbols-outlined text-primary-container text-[18px]">workspace_premium</span>
                <span>Duel Arena</span>
                <span className="text-outline-variant">/</span>
                <span className="text-primary font-bold">Liderlik Tablosu &amp; Podyum</span>
              </div>
              <div className="flex items-center gap-space-sm flex-wrap">
                <div className="flex items-center gap-space-2xs bg-surface-container px-space-md py-space-2xs rounded-full">
                  <span className="material-symbols-outlined text-primary text-[14px]">groups</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{activePlayerCount.toLocaleString('tr-TR')} Düellocu Aktif</span>
                </div>
                <div className="flex items-center gap-space-2xs bg-secondary-container/40 px-space-md py-space-2xs rounded-full">
                  <span className="w-2 h-2 rounded-full bg-primary-container inline-block animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-primary tracking-wider font-bold">1. SEZON</span>
                </div>
              </div>
            </div>

            {/*  Main Title & Editorial Deck  */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="max-w-3xl flex flex-col gap-space-xs">
                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
                  Liderlik Tablosu <span className="text-primary font-light">&amp;</span> Podyum
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                  Harfbaz kelime avı ve Veto taktik düellolarında haftanın şampiyonları, podyum dereceleri ve genel ELO sıralaması.
                </p>
              </div>
            </div>

            {/*  Game-Based Leaderboard Tab Switcher (Matching LegalNavPills)  */}
            <div className="flex items-center gap-space-xs p-space-2xs bg-surface-container-lowest rounded-full overflow-x-auto w-full md:w-fit shadow-md border border-outline-variant/20">
              <button
                type="button"
                onClick={() => handleTabChange('harfbaz')}
                className={`font-label-md text-label-md whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-space-2xs ${
                  activeGameTab === 'harfbaz'
                    ? 'bg-primary-container text-on-primary-container font-bold px-space-lg py-space-xs rounded-full shadow-[0_4px_16px_rgba(241,112,14,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 px-space-lg py-space-xs rounded-full'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">spellcheck</span>
                <span>Harfbaz Podyumu</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('veto')}
                className={`font-label-md text-label-md whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-space-2xs ${
                  activeGameTab === 'veto'
                    ? 'bg-primary-container text-on-primary-container font-bold px-space-lg py-space-xs rounded-full shadow-[0_4px_16px_rgba(241,112,14,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 px-space-lg py-space-xs rounded-full'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>Veto Şampiyonluğu</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('genel')}
                className={`font-label-md text-label-md whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-space-2xs ${
                  activeGameTab === 'genel'
                    ? 'bg-primary-container text-on-primary-container font-bold px-space-lg py-space-xs rounded-full shadow-[0_4px_16px_rgba(241,112,14,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 px-space-lg py-space-xs rounded-full'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">leaderboard</span>
                <span>Genel Arena (ELO)</span>
              </button>
            </div>
          </div>
        </div>

        {/*  Content Section  */}
        <div className="relative w-full overflow-hidden px-margin-mobile md:px-margin py-space-xl max-w-7xl mx-auto">
          {/*  Ambient glowing radial backdrops  */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-36 left-1/4 w-72 h-72 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>

          {activeGameTab === 'harfbaz' && (
            <>
{/*  Match Victor Header  */}
<div className="relative text-center mb-space-2xl">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-secondary-container/30 text-primary mb-space-sm">
<span className="material-symbols-outlined text-[16px]">military_tech</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider">Maç Sonu Raporu: {displayRoomCode}</span>
</div>
<h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight uppercase">
        Harfbaz Şampiyonu <span className="text-primary-container">{p1.name}</span>!
</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs flex items-center justify-center gap-space-sm flex-wrap">
<span>{totalRounds} Tur Tamamlandı</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span>Toplam {totalCategories} Kategori</span>
<span className="w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="text-primary font-title-md">{totalUnique} Özgün Kelime</span>
</p>
</div>
{/*  Podium Section (2nd, 1st, 3rd)  */}
<div className="relative max-w-4xl mx-auto mb-space-2xl">
<div className="grid grid-cols-3 gap-space-xs sm:gap-space-md items-end pt-space-xl">
{/*  2nd Place: p2  */}
<div className="flex flex-col items-center">
<div className="relative mb-space-sm flex flex-col items-center">
<div className="relative">
<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-surface-container-high p-1 flex items-center justify-center">
  <div className="w-full h-full rounded-full bg-surface-bright flex items-center justify-center font-bold text-headline-sm text-on-surface">
    {p2.name?.trim().charAt(0).toUpperCase() || '2'}
  </div>
</div>
<div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center shadow-md">
<span className="font-label-sm text-label-sm text-on-surface">2</span>
</div>
</div>
<div className="flex items-center gap-1 mt-space-xs">
  <span className="font-title-md text-title-md text-on-surface text-center truncate max-w-[100px] sm:max-w-none">{p2.name}</span>
  {p2.isMe && (
    <span className="bg-primary-container/20 text-primary-container font-label-sm text-label-sm px-1 py-0.2 rounded font-bold uppercase">SEN</span>
  )}
</div>
<span className="font-headline-sm text-headline-sm text-primary font-bold">{p2.score} <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Puan</span></span>
</div>
{/*  Silver Pillar  */}
<div className="w-full h-44 sm:h-52 bg-surface-container rounded-t-xl p-space-md flex flex-col justify-between items-center text-center shadow-md">
<div className="w-8 h-1 bg-surface-bright rounded-full"></div>
<div className="flex flex-col items-center gap-1">
<span className="material-symbols-outlined text-outline text-[24px]">workspace_premium</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase">İkinci</span>
<span className="font-body-sm text-body-sm text-outline">Gümüş Rozet</span>
</div>
<div className="font-label-sm text-label-sm text-outline-variant tracking-wide">{p2.avgSpeed || '32 Sn Ort.'}</div>
</div>
</div>
{/*  1st Place: p1 - Champion  */}
<div className="flex flex-col items-center -mt-8 sm:-mt-12 z-10">
<div className="relative mb-space-sm flex flex-col items-center">
<div className="animate-bounce mb-1 text-primary-container">
<span className="material-symbols-outlined text-[32px]" style={{"fontVariationSettings":"'FILL' 1"}}>crown</span>
</div>
<div className="relative">
<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-tr from-primary-container via-tertiary-container to-primary p-1 shadow-[0_0_24px_rgba(241,112,14,0.35)] flex items-center justify-center">
  <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-headline-md text-primary">
    {p1.name?.trim().charAt(0).toUpperCase() || '1'}
  </div>
</div>
<div className="absolute -bottom-2 -right-1 w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shadow-md">
<span className="font-label-md text-label-md text-on-primary-container font-bold">1</span>
</div>
</div>
<div className="flex items-center gap-1 mt-space-xs">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold text-center truncate max-w-[120px] sm:max-w-none">{p1.name}</span>
{p1.isMe && (
  <span className="bg-primary-container/20 text-primary-container font-label-sm text-label-sm px-1.5 py-0.5 rounded font-bold uppercase">SEN</span>
)}
</div>
<span className="font-headline-lg text-headline-lg text-primary font-bold">{p1.score} <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Puan</span></span>
<span className="font-label-sm text-label-sm text-tertiary-fixed-dim bg-secondary-container/40 px-2 py-0.5 rounded-full mt-1">+{scoreDiff > 0 ? scoreDiff : 0} Puan Fark</span>
</div>
{/*  Champion Pillar  */}
<div className="w-full h-56 sm:h-64 bg-gradient-to-b from-secondary-container via-surface-container-high to-surface-container rounded-t-xl p-space-md flex flex-col justify-between items-center text-center shadow-xl">
<div className="w-12 h-1 bg-primary rounded-full"></div>
<div className="flex flex-col items-center gap-1">
<div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[24px]" style={{"fontVariationSettings":"'FILL' 1"}}>trophy</span>
</div>
<span className="font-title-md text-title-md text-primary font-bold uppercase tracking-wider">Şampiyon</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Liderlik Tacı</span>
</div>
<div className="font-label-sm text-label-sm text-primary font-semibold bg-surface-container-lowest/70 px-space-sm py-0.5 rounded-full">
  {p1.uniqueCount} Özgün Kelime
</div>
</div>
</div>
{/*  3rd Place: p3  */}
<div className="flex flex-col items-center">
<div className="relative mb-space-sm flex flex-col items-center">
<div className="relative">
<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-surface-container-high p-1 flex items-center justify-center">
  <div className="w-full h-full rounded-full bg-surface-variant flex items-center justify-center font-bold text-headline-sm text-on-surface">
    {p3.name?.trim().charAt(0).toUpperCase() || '3'}
  </div>
</div>
<div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center shadow-md">
<span className="font-label-sm text-label-sm text-on-surface">3</span>
</div>
</div>
<div className="flex items-center gap-1 mt-space-xs">
  <span className="font-title-md text-title-md text-on-surface text-center truncate max-w-[100px] sm:max-w-none">{p3.name}</span>
  {p3.isMe && (
    <span className="bg-primary-container/20 text-primary-container font-label-sm text-label-sm px-1 py-0.2 rounded font-bold uppercase">SEN</span>
  )}
</div>
<span className="font-headline-sm text-headline-sm text-primary font-bold">{p3.score} <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Puan</span></span>
</div>
{/*  Bronze Pillar  */}
<div className="w-full h-36 sm:h-44 bg-surface-container-low rounded-t-xl p-space-md flex flex-col justify-between items-center text-center shadow-md">
<div className="w-8 h-1 bg-surface-variant rounded-full"></div>
<div className="flex flex-col items-center gap-1">
<span className="material-symbols-outlined text-outline-variant text-[24px]">military_tech</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Üçüncü</span>
<span className="font-body-sm text-body-sm text-outline-variant">Bronz Rozet</span>
</div>
<div className="font-label-sm text-label-sm text-outline-variant tracking-wide">{p3.avgSpeed || '37 Sn Ort.'}</div>
</div>
</div>
</div>
</div>
{/*  Match Highlights & Insight Cards (3 Minimal Metric Cards inspired by reference)  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-2xl">
{/*  Highlight 1: En Hızlı STOP  */}
<div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high transition-colors">
<div className="flex items-start justify-between">
<div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">timer</span>
</div>
<span className="font-label-sm text-label-sm text-primary uppercase bg-secondary-container/20 px-2 py-0.5 rounded-full">Tur Rekoru</span>
</div>
<div className="my-space-md">
<span className="font-label-md text-label-md text-on-surface-variant block mb-1">En Hızlı STOP Yapan</span>
<h2 className="font-headline-md text-headline-md text-on-surface">{fastestPlayer.name}</h2>
<p className="font-body-sm text-body-sm text-primary-fixed-dim mt-1">{fastestPlayer.avgSpeed} ortalama ile masayı kilitledi</p>
</div>
<div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
<div className="bg-primary-container h-full w-[88%] rounded-full"></div>
</div>
</div>
{/*  Highlight 2: En Çok Veto Yiyen  */}
<div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container-high transition-colors">
<div className="flex items-start justify-between">
<div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-error">
<span className="material-symbols-outlined text-[20px]">gavel</span>
</div>
<span className="font-label-sm text-label-sm text-error uppercase bg-error-container/20 px-2 py-0.5 rounded-full">İtiraz Masası</span>
</div>
<div className="my-space-md">
<span className="font-label-md text-label-md text-on-surface-variant block mb-1">En Çok İtiraz Alan</span>
<h2 className="font-headline-md text-headline-md text-on-surface">{mostVetoedPlayer.name}</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Toplam {mostVetoedPlayer.vetoCount || 0} veto işlemi uygulandı</p>
</div>
<div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
<div className="bg-error h-full w-[52%] rounded-full"></div>
</div>
</div>
{/*  Highlight 3: En Sıra Dışı Kelime  */}
<div className="bg-secondary-container rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-primary-container transition-colors">
<div className="flex items-start justify-between">
<div className="w-10 h-10 rounded-full bg-on-secondary/40 flex items-center justify-center text-primary-fixed">
<span className="material-symbols-outlined text-[20px]">auto_awesome</span>
</div>
<span className="font-label-sm text-label-sm text-primary-fixed uppercase bg-on-secondary/30 px-2 py-0.5 rounded-full">+20 Bonus</span>
</div>
<div className="my-space-md">
<span className="font-label-md text-label-md text-on-surface-variant block mb-1">En Sıra Dışı Kelime</span>
<div className="flex items-baseline gap-space-xs">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-wide">"Kuksa"</h2>
<span className="font-body-sm text-body-sm text-primary-fixed-dim">(Eşya)</span>
</div>
<p className="font-body-sm text-body-sm text-primary-fixed mt-1">{p1.name} tarafından yazıldı, kimse eşleşmedi</p>
</div>
<div className="flex items-center gap-1 text-on-surface font-label-sm text-label-sm">
<span>Sözlük Onay Oranı: %100</span>
</div>
</div>
</div>
{/*  Remaining Players Standings & Category Breakdown  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-2xl">
{/*  Full Standings Table  */}
<div className="lg:col-span-8 bg-surface-container rounded-xl p-space-xl shadow-sm">
<div className="flex items-center justify-between mb-space-lg">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">Tüm Katılımcılar &amp; Sonuçlar</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Harfbaz puanlama matrisi: Özgün (10p), Çakışan (5p), Veto (-5p)</p>
</div>
<div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-xs rounded-full">
<span className="material-symbols-outlined text-[16px] text-primary">groups</span>
<span className="font-label-sm text-label-sm text-on-surface">{sortedPlayers.length} Oyuncu</span>
</div>
</div>
<div className="flex flex-col gap-space-xs">
{sortedPlayers.map((player: any, idx: number) => (
  <div
    key={player.id || idx}
    className={`${player.isMe ? 'bg-surface-container-high border border-primary-container/30' : idx === 0 ? 'bg-surface-container-high/60' : 'bg-surface-container-low'} hover:bg-surface-container-high rounded-lg p-space-md flex items-center justify-between transition-colors`}
  >
    <div className="flex items-center gap-space-md min-w-0">
      <span className={`w-6 font-title-md text-title-md font-bold ${idx === 0 ? 'text-primary' : idx === 1 ? 'text-on-surface' : 'text-outline'}`}>
        #{idx + 1}
      </span>
      <div className={`w-10 h-10 rounded-full ${idx === 0 ? 'bg-primary-container/20 text-primary-container' : 'bg-surface-bright text-on-surface'} flex items-center justify-center font-title-md font-bold`}>
        {player.name ? player.name.trim().charAt(0).toUpperCase() : '?'}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-space-xs">
          <span className="font-title-md text-title-md text-on-surface truncate">{player.name}</span>
          {player.isMe && (
            <span className="bg-primary-container/20 text-primary-container font-label-sm text-label-sm px-1.5 py-0.2 rounded font-bold uppercase">SEN</span>
          )}
        </div>
        <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
          <span>{player.uniqueCount || 0} Özgün</span>
          <span>•</span>
          <span>{player.duplicateCount || 0} Çakışan</span>
          <span>•</span>
          <span className={(player.vetoCount || 0) > 0 ? 'text-tertiary font-semibold' : 'text-outline-variant'}>
            {player.vetoCount || 0} Veto
          </span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <span className={`font-headline-sm text-headline-sm font-bold ${idx === 0 ? 'text-primary' : 'text-on-surface'}`}>
        {player.score}
      </span>
      <span className="font-body-sm text-body-sm text-on-surface-variant block">Puan</span>
    </div>
  </div>
))}
</div>
</div>
{/*  Stats Visual Donut & Category Mastery  */}
<div className="lg:col-span-4 flex flex-col gap-space-md">
{/*  SVG Donut Metric Card (Match Breakdown)  */}
<div className="bg-surface-container rounded-xl p-space-xl shadow-sm flex flex-col justify-between h-full">
<div className="flex items-center justify-between mb-space-sm">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Kelime Dağılımı</h3>
<span className="font-label-sm text-label-sm text-primary uppercase bg-secondary-container/20 px-2 py-0.5 rounded-full">50 Kategori</span>
</div>
<div className="flex items-center justify-center py-space-sm relative">
{/*  Inline Responsive Clean SVG Donut Chart  */}
<svg className="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
{/*  Background Ring  */}
<circle cx="60" cy="60" fill="none" r="48" stroke="#292a2e" stroke-width="12"></circle>
{/*  Segments: Primary (Unique 65%), Secondary (Duplicated 25%), Error (Vetoed 10%)  */}
<circle cx="60" cy="60" fill="none" r="48" stroke="#f1700e" stroke-dasharray="196 301" stroke-dashoffset="0" stroke-linecap="round" stroke-width="12"></circle>
<circle cx="60" cy="60" fill="none" r="48" stroke="#7a3408" stroke-dasharray="75 301" stroke-dashoffset="-196" stroke-width="12"></circle>
<circle cx="60" cy="60" fill="none" r="48" stroke="#93000a" stroke-dasharray="30 301" stroke-dashoffset="-271" stroke-width="12"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
<span className="font-headline-lg text-headline-lg text-on-surface font-bold leading-none">108</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">Toplam Girdi</span>
</div>
</div>
{/*  Legend  */}
<div className="grid grid-cols-3 gap-space-xs text-center pt-space-xs">
<div className="bg-surface-container-high p-space-xs rounded-lg">
<div className="w-2 h-2 rounded-full bg-primary-container mx-auto mb-1"></div>
<span className="font-label-sm text-label-sm text-on-surface-variant block">Özgün</span>
<span className="font-title-md text-title-md text-on-surface font-bold">%65</span>
</div>
<div className="bg-surface-container-high p-space-xs rounded-lg">
<div className="w-2 h-2 rounded-full bg-secondary-container mx-auto mb-1"></div>
<span className="font-label-sm text-label-sm text-on-surface-variant block">Çakışan</span>
<span className="font-title-md text-title-md text-on-surface font-bold">%25</span>
</div>
<div className="bg-surface-container-high p-space-xs rounded-lg">
<div className="w-2 h-2 rounded-full bg-error-container mx-auto mb-1"></div>
<span className="font-label-sm text-label-sm text-on-surface-variant block">Veto</span>
<span className="font-title-md text-title-md text-on-surface font-bold">%10</span>
</div>
</div>
</div>
</div>
</div>
</>
)}

{/* VETO ŞAMPİYONLUĞU & LİDERLİK TABLOSU */}
{activeGameTab === 'veto' && (
  <>
        {/* Veto Match Victor Header */}
        <div className="relative text-center mb-space-2xl">
          <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-secondary-container/30 text-primary mb-space-sm">
            <span className="material-symbols-outlined text-[16px]">military_tech</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Veto Takım Raporu: {vetoMatchData.room_code || displayRoomCode}</span>
          </div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight uppercase">
            {winnerName} <span className="text-primary-container">Zafere Ulaştı!</span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs flex items-center justify-center gap-space-sm flex-wrap">
            <span>Nihai Skor: <strong className="text-primary font-bold">{scoreA}</strong> — <strong className="text-on-surface font-bold">{scoreB}</strong></span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span>Hedef: 50 Puan</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="text-primary font-title-md">{totalTurns} Tur Düello</span>
          </p>
        </div>

        {/* Veto Podium Section (2nd, 1st, 3rd) */}
        <div className="relative max-w-4xl mx-auto mb-space-2xl">
          <div className="grid grid-cols-3 gap-space-xs sm:gap-space-md items-end pt-space-xl">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-space-sm flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-surface-container-high p-1 shadow-md border-2 border-outline-variant flex items-center justify-center text-[28px]">
                    ⚖️
                  </div>
                  <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center shadow-md">
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">2</span>
                  </div>
                </div>
                <span className="font-title-md text-title-md text-on-surface mt-space-xs text-center truncate max-w-[120px] sm:max-w-none">{v2.name}</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">{v2.score} <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Puan</span></span>
                <span className="font-label-sm text-label-sm text-outline-variant bg-surface-container-high px-2 py-0.5 rounded-full mt-1">{v2.team === 'A' ? teamAName : teamBName}</span>
              </div>
              {/* Silver Pillar */}
              <div className="w-full h-44 sm:h-52 bg-surface-container rounded-t-xl p-space-md flex flex-col justify-between items-center text-center shadow-md">
                <div className="w-8 h-1 bg-surface-bright rounded-full"></div>
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-[24px]">workspace_premium</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">İkinci</span>
                  <span className="font-body-sm text-body-sm text-outline">Gümüş Derece</span>
                </div>
                <div className="font-label-sm text-label-sm text-outline-variant tracking-wide">{runnerUpScore} Takım Skoru</div>
              </div>
            </div>

            {/* 1st Place - Champion */}
            <div className="flex flex-col items-center -mt-8 sm:-mt-12 z-10">
              <div className="relative mb-space-sm flex flex-col items-center">
                <div className="animate-bounce mb-1 text-primary-container">
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
                </div>
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-tr from-primary-container via-tertiary-container to-primary p-1 shadow-[0_0_24px_rgba(241,112,14,0.35)] flex items-center justify-center text-[34px]">
                    ⚔️
                  </div>
                  <div className="absolute -bottom-2 -right-1 w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shadow-md">
                    <span className="font-label-md text-label-md text-on-primary-container font-bold">1</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold text-center max-w-[140px] sm:max-w-none truncate">{v1.name}</span>
                  <span className="bg-primary-container/20 text-primary-container font-label-sm text-label-sm px-1.5 py-0.5 rounded uppercase font-bold">MVP</span>
                </div>
                <span className="font-headline-lg text-headline-lg text-primary font-bold">{winnerScore} <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Puan</span></span>
                <span className="font-label-sm text-label-sm text-tertiary-fixed-dim bg-secondary-container/40 px-2 py-0.5 rounded-full mt-1">{winnerName} Şampiyonu</span>
              </div>
              {/* Champion Pillar */}
              <div className="w-full h-56 sm:h-64 bg-gradient-to-b from-secondary-container via-surface-container-high to-surface-container rounded-t-xl p-space-md flex flex-col justify-between items-center text-center shadow-xl">
                <div className="w-12 h-1 bg-primary rounded-full"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                  </div>
                  <span className="font-title-md text-title-md text-primary font-bold uppercase tracking-wider">Veto Şampiyonu</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Lider Performans</span>
                </div>
                <div className="font-label-sm text-label-sm text-primary font-semibold bg-surface-container-lowest/70 px-space-sm py-0.5 rounded-full">
                  {winnerScore} Doğru • Tam Başarı
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-space-sm flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-surface-container-high p-1 shadow-md border-2 border-outline-variant flex items-center justify-center text-[28px]">
                    ⚡
                  </div>
                  <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center shadow-md">
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">3</span>
                  </div>
                </div>
                <span className="font-title-md text-title-md text-on-surface mt-space-xs text-center truncate max-w-[120px] sm:max-w-none">{v3.name}</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">{v3.score} <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Puan</span></span>
                <span className="font-label-sm text-label-sm text-outline-variant bg-surface-container-high px-2 py-0.5 rounded-full mt-1">{v3.team === 'A' ? teamAName : teamBName}</span>
              </div>
              {/* Bronze Pillar */}
              <div className="w-full h-36 sm:h-44 bg-surface-container-low rounded-t-xl p-space-md flex flex-col justify-between items-center text-center shadow-md">
                <div className="w-8 h-1 bg-surface-variant rounded-full"></div>
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-outline-variant text-[24px]">military_tech</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Üçüncü</span>
                  <span className="font-body-sm text-body-sm text-outline-variant">Hızlı Katkı</span>
                </div>
                <div className="font-label-sm text-label-sm text-outline-variant tracking-wide">{v3.score} Skor Katkısı</div>
              </div>
            </div>
          </div>
        </div>

        {/* Veto Team Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-2xl">
          {/* Team A Card */}
          <div className={`lg:col-span-6 bg-surface-container rounded-xl p-space-xl shadow-md border-l-4 ${isRedWinner ? 'border-primary-container' : 'border-outline-variant'} relative overflow-hidden flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className={`px-space-xs py-space-2xs rounded ${isRedWinner ? 'bg-primary-container text-on-primary-container' : 'bg-surface-bright text-on-surface'} font-label-sm text-label-sm font-bold uppercase`}>
                    {isRedWinner ? 'Şampiyon' : 'İkinci'}
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{teamAName}</h2>
                </div>
                <div className="text-right">
                  <span className={`font-display-lg text-display-lg font-bold ${isRedWinner ? 'text-primary-container' : 'text-outline'}`}>{scoreA}</span>
                  <span className="block font-label-sm text-label-sm text-outline">TOPLAM PUAN</span>
                </div>
              </div>
              <div className="bg-surface-container-high rounded-lg p-space-md flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">mic</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm text-outline uppercase block">Takım Temsilcisi</span>
                    <span className="font-title-md text-title-md text-on-surface font-semibold">{v1.name}</span>
                  </div>
                </div>
                <span className="font-label-md text-label-md text-primary font-bold">{scoreA} Doğru</span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                <div className="bg-surface-container-low p-space-md rounded-lg">
                  <span className="font-body-sm text-body-sm text-outline block">Kazanılan Puan</span>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold mt-1">{scoreA}</span>
                  <span className="font-label-sm text-label-sm text-primary">+{scoreA} Puan</span>
                </div>
                <div className="bg-surface-container-low p-space-md rounded-lg">
                  <span className="font-body-sm text-body-sm text-outline block">Durum</span>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold mt-1">{isRedWinner ? 'Zafer' : 'Finalist'}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Tamamlandı</span>
                </div>
              </div>
            </div>
            <div className="mt-space-lg">
              <div className="flex justify-between font-label-sm text-label-sm text-outline mb-1">
                <span>Başarı Oranı</span>
                <span className="text-on-surface font-semibold">{scoreA + scoreB > 0 ? Math.round((scoreA / (scoreA + scoreB)) * 100) : 50}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-lowest rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full" style={{ width: `${scoreA + scoreB > 0 ? Math.round((scoreA / (scoreA + scoreB)) * 100) : 50}%` }}></div>
              </div>
            </div>
          </div>

          {/* Team B Card */}
          <div className={`lg:col-span-6 bg-surface-container rounded-xl p-space-xl shadow-md border-l-4 ${!isRedWinner ? 'border-primary-container' : 'border-outline-variant'} relative overflow-hidden flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className={`px-space-xs py-space-2xs rounded ${!isRedWinner ? 'bg-primary-container text-on-primary-container' : 'bg-surface-bright text-on-surface'} font-label-sm text-label-sm font-bold uppercase`}>
                    {!isRedWinner ? 'Şampiyon' : 'İkinci'}
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{teamBName}</h2>
                </div>
                <div className="text-right">
                  <span className={`font-display-lg text-display-lg font-bold ${!isRedWinner ? 'text-primary-container' : 'text-outline'}`}>{scoreB}</span>
                  <span className="block font-label-sm text-label-sm text-outline">TOPLAM PUAN</span>
                </div>
              </div>
              <div className="bg-surface-container-high rounded-lg p-space-md flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-[20px]">gavel</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm text-outline uppercase block">Takım Temsilcisi</span>
                    <span className="font-title-md text-title-md text-on-surface font-semibold">{v2.name}</span>
                  </div>
                </div>
                <span className="font-label-md text-label-md text-outline font-bold">{scoreB} Doğru</span>
              </div>
              <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                <div className="bg-surface-container-low p-space-md rounded-lg">
                  <span className="font-body-sm text-body-sm text-outline block">Kazanılan Puan</span>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold mt-1">{scoreB}</span>
                  <span className="font-label-sm text-label-sm text-primary">+{scoreB} Puan</span>
                </div>
                <div className="bg-surface-container-low p-space-md rounded-lg">
                  <span className="font-body-sm text-body-sm text-outline block">Durum</span>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold mt-1">{!isRedWinner ? 'Zafer' : 'Finalist'}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Tamamlandı</span>
                </div>
              </div>
            </div>
            <div className="mt-space-lg">
              <div className="flex justify-between font-label-sm text-label-sm text-outline mb-1">
                <span>Başarı Oranı</span>
                <span className="text-on-surface font-semibold">{scoreA + scoreB > 0 ? Math.round((scoreB / (scoreA + scoreB)) * 100) : 50}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-lowest rounded-full overflow-hidden">
                <div className="h-full bg-tertiary rounded-full" style={{ width: `${scoreA + scoreB > 0 ? Math.round((scoreB / (scoreA + scoreB)) * 100) : 50}%` }}></div>
              </div>
            </div>
          </div>
        </div>

    {/* Veto Highlight Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-2xl">
      <div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <span className="font-label-sm text-label-sm uppercase bg-surface-bright px-2 py-0.5 rounded-full text-on-surface-variant">Hız Rekoru</span>
        </div>
        <div className="mt-space-md">
          <span className="font-label-sm text-label-sm text-outline uppercase block">En Hızlı Tahmin</span>
          <div className="font-headline-md text-headline-md text-primary font-bold">2.1 Sn</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Kırmızı Takım "Kozmik" kelimesini ilk ipucunda bildi</p>
        </div>
      </div>

      <div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">block</span>
          </div>
          <span className="font-label-sm text-label-sm uppercase bg-surface-bright px-2 py-0.5 rounded-full text-on-surface-variant">Hakemlik</span>
        </div>
        <div className="mt-space-md">
          <span className="font-label-sm text-label-sm text-outline uppercase block">Veto Avcısı</span>
          <div className="font-headline-md text-headline-md text-on-surface font-bold">6 Başarılı İtiraz</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Mavi Takım yasaklı kelime ihlallerini anında yakaladı</p>
        </div>
      </div>

      <div className="bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">trending_up</span>
          </div>
          <span className="font-label-sm text-label-sm uppercase bg-surface-bright px-2 py-0.5 rounded-full text-on-surface-variant">Taktik</span>
        </div>
        <div className="mt-space-md">
          <span className="font-label-sm text-label-sm text-outline uppercase block">Pas Verimliliği</span>
          <div className="font-headline-md text-headline-md text-tertiary-fixed-dim font-bold">%92 İsabet</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Pas hakları zaman kaybetmeden kritik anlara saklandı</p>
        </div>
      </div>
    </div>
  </>
)}

{/* GENEL ARENA (ELO) LİDERLİK TABLOSU */}
{activeGameTab === 'genel' && (
  <>
    {/* Global Arena Victor Header */}
    <div className="relative text-center mb-space-2xl">
      <div className="inline-flex items-center gap-space-xs px-space-md py-space-2xs rounded-full bg-secondary-container/30 text-primary mb-space-sm">
        <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
        <span className="font-label-sm text-label-sm uppercase tracking-wider">Duel Arena Şampiyonlar Ligi</span>
      </div>
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight uppercase">
        Genel Arena <span className="text-primary-container">ELO Sıralaması</span>
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs flex items-center justify-center gap-space-sm flex-wrap">
        <span>Veto &amp; Harfbaz Çapraz Sıralaması</span>
        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
        <span>{activePlayerCount.toLocaleString('tr-TR')} Aktif Düellocu</span>
        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
        <span className="text-primary font-title-md">1. Sezon</span>
      </p>
    </div>

    {/* Top 3 Global Players Podium */}
    <div className="relative max-w-4xl mx-auto mb-space-2xl">
          <div className="grid grid-cols-3 gap-space-xs sm:gap-space-md items-end pt-space-xl">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-space-sm flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-container-high p-1 flex items-center justify-center text-[28px] shadow-md border-2 border-outline-variant">
                  {g2.avatar || '🥈'}
                </div>
                <span className="font-title-md text-title-md text-on-surface mt-space-xs text-center truncate max-w-[120px] sm:max-w-none">{g2.username}</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">{g2.elo_rating} <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">ELO</span></span>
              </div>
              <div className="w-full h-44 sm:h-52 bg-surface-container rounded-t-xl p-space-md flex flex-col justify-between items-center text-center shadow-md">
                <div className="w-8 h-1 bg-surface-bright rounded-full"></div>
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-[24px]">workspace_premium</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">İkinci</span>
                  <span className="font-body-sm text-body-sm text-outline">{g2Badge.name}</span>
                </div>
                <div className="font-label-sm text-label-sm text-outline-variant">%{g2.win_rate} Galibiyet</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-8 sm:-mt-12 z-10">
              <div className="relative mb-space-sm flex flex-col items-center">
                <div className="animate-bounce mb-1 text-primary-container">
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-primary-container via-tertiary-container to-primary p-1 shadow-[0_0_24px_rgba(241,112,14,0.35)] flex items-center justify-center text-[36px]">
                  {g1.avatar || '👑'}
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold text-center mt-space-xs max-w-[140px] sm:max-w-none truncate">{g1.username}</span>
                <span className="font-headline-lg text-headline-lg text-primary font-bold">{g1.elo_rating} <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">ELO</span></span>
                <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full mt-1 ${g1Badge.color}`}>{g1Badge.name}</span>
              </div>
              <div className="w-full h-56 sm:h-64 bg-gradient-to-b from-secondary-container via-surface-container-high to-surface-container rounded-t-xl p-space-md flex flex-col justify-between items-center text-center shadow-xl">
                <div className="w-12 h-1 bg-primary rounded-full"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                  </div>
                  <span className="font-title-md text-title-md text-primary font-bold uppercase tracking-wider">Arenanın Lideri</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Haftanın Şampiyonu</span>
                </div>
                <div className="font-label-sm text-label-sm text-primary font-semibold bg-surface-container-lowest/70 px-space-sm py-0.5 rounded-full">
                  %{g1.win_rate} Galibiyet • {g1.total_matches} Maç
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-space-sm flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-container-high p-1 flex items-center justify-center text-[28px] shadow-md border-2 border-outline-variant">
                  {g3.avatar || '🥉'}
                </div>
                <span className="font-title-md text-title-md text-on-surface mt-space-xs text-center truncate max-w-[120px] sm:max-w-none">{g3.username}</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">{g3.elo_rating} <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">ELO</span></span>
              </div>
              <div className="w-full h-36 sm:h-44 bg-surface-container-low rounded-t-xl p-space-md flex flex-col justify-between items-center text-center shadow-md">
                <div className="w-8 h-1 bg-surface-variant rounded-full"></div>
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-outline-variant text-[24px]">military_tech</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Üçüncü</span>
                  <span className="font-body-sm text-body-sm text-outline-variant">{g3Badge.name}</span>
                </div>
                <div className="font-label-sm text-label-sm text-outline-variant">%{g3.win_rate} Galibiyet</div>
              </div>
            </div>
          </div>
        </div>

    {/* Global Arena Full Table */}
    <div className="bg-surface-container rounded-xl p-space-xl shadow-sm mb-space-2xl">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Küresel Arena Sıralaması</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">ELO dereceleri Veto ve Harfbaz galibiyet oranlarına göre her maç güncellenir</p>
        </div>
        <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-xs rounded-full">
          <span className="material-symbols-outlined text-[16px] text-primary">public</span>
          <span className="font-label-sm text-label-sm text-on-surface">Tüm Zamanlar</span>
        </div>
      </div>

      <div className="flex flex-col gap-space-xs">
        {/* Current User Row */}
        <div className="bg-primary-container/15 border border-primary/40 rounded-lg p-space-md flex items-center justify-between transition-colors shadow-sm">
          <div className="flex items-center gap-space-md min-w-0">
            <span className="w-8 font-title-md text-title-md text-primary font-bold">#{myCalculatedRank}</span>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[20px]">
              {profile.avatar || '🎭'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-title-md text-title-md text-on-surface font-bold truncate">{profile.username}</span>
                <span className="font-label-sm text-label-sm text-primary bg-primary-container/30 px-1.5 py-0.2 rounded font-bold uppercase">SEN</span>
                <span className={`font-label-sm text-label-sm px-1.5 py-0.2 rounded ${getLeagueBadge(profile.eloRating || 1200).color}`}>
                  {getLeagueBadge(profile.eloRating || 1200).name}
                </span>
              </div>
              <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                <span>{profile.totalMatches || 0} Düello</span>
                <span>•</span>
                <span>{profile.wins || 0} Zafer</span>
                <span>•</span>
                <span className="text-primary font-semibold">{profile.isGuest ? 'Aktif Misafir Profili' : 'Doğrulanmış Üye'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-headline-sm text-headline-sm text-primary font-bold">{profile.eloRating || 1200}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant block">ELO</span>
          </div>
        </div>

        {/* Global Ranks from Live Supabase Database */}
        {globalLeaderboard.slice(3).map((player: any, idx: number) => {
          const rank = idx + 4;
          const badge = getLeagueBadge(player.elo_rating || 1200);
          const isMe = player.id === profile.id || player.username === profile.username;

          return (
            <div 
              key={player.id || idx}
              className={`${isMe ? 'bg-primary-container/10 border border-primary/30' : 'bg-surface-container-low'} hover:bg-surface-container-high rounded-lg p-space-md flex items-center justify-between transition-colors`}
            >
              <div className="flex items-center gap-space-md min-w-0">
                <span className="w-8 font-title-md text-title-md text-on-surface-variant">#{rank}</span>
                <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center text-on-surface text-[20px]">
                  {player.avatar || '⚔️'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-title-md text-title-md text-on-surface truncate">{player.username}</span>
                    {isMe && (
                      <span className="font-label-sm text-label-sm text-primary bg-primary-container/30 px-1.5 py-0.2 rounded font-bold uppercase">SEN</span>
                    )}
                    <span className={`font-label-sm text-label-sm px-1.5 py-0.2 rounded ${badge.color}`}>{badge.name}</span>
                  </div>
                  <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                    <span>{player.total_matches || 0} Düello</span>
                    <span>•</span>
                    <span>%{player.win_rate || 50} Galibiyet</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{player.elo_rating}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant block">ELO</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>
)}

{/*  Rules Drawer & Floating Sheet  */}
{showRules && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-black/75 backdrop-blur-md" id="rules-drawer">
  <div className="bg-surface-container rounded-xl max-w-lg w-full p-space-xl shadow-2xl relative">
  <div className="flex items-center justify-between mb-space-md">
  <div className="flex items-center gap-space-xs text-primary">
  <span className="material-symbols-outlined text-[24px]">menu_book</span>
  <h4 className="font-headline-sm text-headline-sm text-on-surface">Harfbaz Puanlama Kılavuzu</h4>
  </div>
  <button 
    onClick={() => setShowRules(false)}
    className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface hover:bg-surface-bright transition-colors cursor-pointer" 
    id="close-rules-btn" 
    type="button"
  >
  <span className="material-symbols-outlined text-[18px]">close</span>
  </button>
  </div>
  <div className="space-y-space-md font-body-md text-body-md text-on-surface-variant">
  <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded-lg">
  <span className="w-2 h-2 rounded-full bg-primary-container mt-2 shrink-0"></span>
  <div>
  <strong className="text-on-surface">Özgün Kelime (+10 Puan):</strong>
  <p className="text-body-sm font-body-sm">Belirtilen harfle başlayan ve başka hiçbir oyuncunun yazmadığı geçerli kelimeler.</p>
  </div>
  </div>
  <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded-lg">
  <span className="w-2 h-2 rounded-full bg-secondary-container mt-2 shrink-0"></span>
  <div>
  <strong className="text-on-surface">Çakışan Kelime (+5 Puan):</strong>
  <p className="text-body-sm font-body-sm">İki veya daha fazla oyuncunun aynı kategoriye yazdığı geçerli eşleşen kelimeler.</p>
  </div>
  </div>
  <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded-lg">
  <span className="w-2 h-2 rounded-full bg-error mt-2 shrink-0"></span>
  <div>
  <strong className="text-on-surface">Veto Edilen Kelime (-5 Puan):</strong>
  <p className="text-body-sm font-body-sm">Oylama masasında çoğunluk kararıyla iptal edilen veya sözlükte yer almayan kelimeler.</p>
  </div>
  </div>
  </div>
  <div className="mt-space-lg flex justify-end">
  <button 
    onClick={() => setShowRules(false)}
    className="px-space-lg py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md cursor-pointer" 
    id="confirm-rules-btn" 
    type="button"
  >
    Anladım
  </button>
  </div>
  </div>
  </div>
)}
</div>
{/*  Micro-interaction Client-side Script  */}

</div></main>
  );
};

export default HarfbazLiderlikPodyumScreen;
