import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, Team, CardData, GameSettings, Player } from './types';
import { INITIAL_TEAMS, DEFAULT_SETTINGS } from './constants';
import { 
  getAllCardsRaw, 
  createRoom, 
  joinRoom, 
  leaveRoom, 
  getPlayersInRoom, 
  subscribeToRoom, 
  startNextTurn, 
  getRoomDetails,
  switchPlayerTeam,
  resetGame,
  updateRoomSettings,
  safeScorePoint,
  safeLosePoint,
  safePass,
  safeIncrementCard,
  finishGame
} from './services/gameService';
import { supabase } from './supabaseClient';
import { Loader2, LogOut, RotateCcw } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

import WelcomeScreen from './components/WelcomeScreen';
import LobbyScreen from './components/LobbyScreen';
import GameCard from './components/GameCard';
import ScoreBoard from './components/ScoreBoard';
import GameControls from './components/GameControls';
import GameOverScreen from './components/GameOverScreen';
import GameTimer from './components/GameTimer';

class CardErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error("GameCard ErrorBoundary caught error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-sm md:max-w-md mx-auto h-[460px] bg-[#12070e] rounded-2xl border border-white/[0.08] flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-bold text-white mb-1">Kart Yüklenemedi</p>
          <span className="text-xs text-slate-400">Sonraki karta geçebilirsiniz.</span>
        </div>
      );
    }
    return this.props.children;
  }
}

interface VetoGameProps {
  onBackToMenu: () => void;
}

const safeStorage = {
  getItem: (key: string) => {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { sessionStorage.setItem(key, value); } catch (e) { }
  },
  removeItem: (key: string) => {
    try { sessionStorage.removeItem(key); } catch (e) { }
  }
};

export const VetoGame: React.FC<VetoGameProps> = ({ onBackToMenu }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  
  const [allCardsMap, setAllCardsMap] = useState<Record<string, CardData>>({}); 
  const [activeDeck, setActiveDeck] = useState<CardData[]>([]); 
  
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [roomCode, setRoomCode] = useState<string>('');
  
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Synced State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [turnExpiresAt, setTurnExpiresAt] = useState<string | null>(null);
  const [currentDeckOrderStr, setCurrentDeckOrderStr] = useState<string>(''); 
  
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const lastHandledTurnRef = useRef<string | null>(null);
  const [userManuallyReturnedToLobby, setUserManuallyReturnedToLobby] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const gameStateRef = useRef(gameState);
  const currentCardIndexRef = useRef(currentCardIndex);
  const teamsRef = useRef(teams); 
  const currentUserRef = useRef(currentUser); 

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { currentCardIndexRef.current = currentCardIndex; }, [currentCardIndex]);
  useEffect(() => { teamsRef.current = teams; }, [teams]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const activeTeam = teams[currentTeamIndex];
  const currentNarrator = useMemo(() => {
    if (activeTeam.players.length === 0) return null;
    return activeTeam.players[activeTeam.currentNarratorIndex % activeTeam.players.length];
  }, [activeTeam]);
  const isMeNarrator = currentUser?.id === currentNarrator?.id;
  const isMyTeamActive = activeTeam.players.some(p => p.id === currentUser?.id);
  const shouldMaskCard = isMyTeamActive && !isMeNarrator;

  // Başlangıç: Kartları ve olası oturumu yükle
  useEffect(() => {
    const initApp = async () => {
      try {
        const cards = await getAllCardsRaw();
        const map: Record<string, CardData> = {};
        cards.forEach(c => map[c.id] = c);
        setAllCardsMap(map);
        setActiveDeck(cards);

        const savedSession = safeStorage.getItem('VETO_SESSION');
        if (savedSession) {
          const { roomCode: savedCode, user } = JSON.parse(savedSession);
          const roomData = await getRoomDetails(savedCode);
          if (roomData) {
             setRoomCode(savedCode);
             setCurrentUser(user);
             setGameState(GameState.LOBBY); 
             const players = await getPlayersInRoom(savedCode);
             if (!players.some(p => p.id === user.id)) {
                await joinRoom(savedCode, user.name, user.id);
             }
          } else {
             safeStorage.removeItem('VETO_SESSION');
          }
        }
      } catch (e) {
        console.error("VETO başlatma hatası", e);
        safeStorage.removeItem('VETO_SESSION');
      } finally {
        setIsRestoringSession(false);
      }
    };
    initApp();
  }, []);

  const saveSession = (code: string, user: Player) => {
    safeStorage.setItem('VETO_SESSION', JSON.stringify({ roomCode: code, user }));
  };

  const clearSession = () => {
    safeStorage.removeItem('VETO_SESSION');
  };

  // Oda Oluşturma
  const handleCreateRoom = useCallback(async (playerName: string, avatar?: string) => {
    setIsLoading(true);
    const myId = `p_${Date.now()}`;
    const defaultTeamNames = { teamA: INITIAL_TEAMS[0].name, teamB: INITIAL_TEAMS[1].name };
    const chosenAvatar = avatar || 'mask';
    
    const code = await createRoom(playerName, myId, DEFAULT_SETTINGS, defaultTeamNames, chosenAvatar);
    
    if (code) {
      const hostUser: Player = { id: myId, name: playerName, isHost: true, avatar: chosenAvatar, team: 'A' };
      setCurrentUser(hostUser);
      setRoomCode(code);
      setGameSettings(DEFAULT_SETTINGS);
      setTeams(prev => { 
        const t = [...prev]; 
        t[0].players = [hostUser]; 
        t[1].players = []; 
        return t; 
      });
      setGameState(GameState.LOBBY);
      setUserManuallyReturnedToLobby(false);
      saveSession(code, hostUser);
    }
    setIsLoading(false);
  }, []);

  // Odaya Katılma
  const handleJoinRoomDirect = useCallback(async (playerName: string, code: string, avatar?: string): Promise<boolean> => {
    setIsLoading(true);
    const myId = `p_${Date.now()}`;
    const chosenAvatar = avatar || 'runner';
    const userToJoin: Player = { id: myId, name: playerName, isHost: false, avatar: chosenAvatar };
    
    const result = await joinRoom(code, playerName, myId, chosenAvatar);
    setIsLoading(false);

    if (result === 'SUCCESS') {
      setCurrentUser(userToJoin);
      setRoomCode(code);
      setGameState(GameState.LOBBY);
      setUserManuallyReturnedToLobby(false);
      saveSession(code, userToJoin);
      return true;
    } else {
      return false;
    }
  }, []);

  const handleLeaveLobby = useCallback(async () => {
    if (roomCode && currentUser) await leaveRoom(roomCode, currentUser.id);
    setGameState(GameState.WELCOME);
    setCurrentUser(null);
    setRoomCode('');
    setUserManuallyReturnedToLobby(false);
    clearSession();
  }, [roomCode, currentUser]);

  const switchTeam = useCallback(async (teamId: 'A' | 'B') => {
    if (!currentUser) return;
    await switchPlayerTeam(currentUser.id, teamId);
  }, [currentUser]);

  const handleRestartGame = useCallback(async () => {
    if (!currentUser?.isHost) return;
    setIsLoading(true);
    await resetGame(roomCode);
    setGameState(GameState.LOBBY);
    setUserManuallyReturnedToLobby(false);
    setIsLoading(false);
  }, [roomCode, currentUser]);

  const handleReturnToLobby = useCallback(() => {
    setUserManuallyReturnedToLobby(true);
    setGameState(GameState.LOBBY);
  }, []);

  const handleUpdateSettings = useCallback(async (newSettings: GameSettings) => {
    setGameSettings(newSettings); 
    await updateRoomSettings(roomCode, newSettings);
  }, [roomCode]);

  const handleAddBot = useCallback(async (targetTeam: 'A' | 'B') => {
    const botId = `bot_${Date.now()}`;
    const botNames = ['GölgeNinja_AI', 'SamurayBot', 'VetoRonini_AI', 'SiberMaske_AI'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)];
    const avatars = ['ronin', 'oni', 'kunoichi', 'monk', 'runner'];
    const botAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    await joinRoom(roomCode, botName, botId, botAvatar);
    const players = await getPlayersInRoom(roomCode);
    const teamA = players.filter(p => p.team === 'A');
    const teamB = players.filter(p => p.team === 'B');
    setTeams(prev => {
      const copy = [...prev];
      copy[0].players = teamA;
      copy[1].players = teamB;
      return copy;
    });
  }, [roomCode]);

  // Sync & Realtime
  const syncData = useCallback(async () => {
    if (!roomCode) return;

    const players = await getPlayersInRoom(roomCode);
    const teamA = players.filter(p => p.team === 'A');
    const teamB = players.filter(p => p.team === 'B');
    const roomData = await getRoomDetails(roomCode);
    
    if (!roomData) return;

    setGameSettings({
      targetScore: roomData.target_score ?? DEFAULT_SETTINGS.targetScore,
      roundTime: roomData.round_time ?? DEFAULT_SETTINGS.roundTime,
      passLimit: roomData.pass_limit ?? DEFAULT_SETTINGS.passLimit
    });

    if (roomData.deck_order && Array.isArray(roomData.deck_order)) {
      const orderStr = JSON.stringify(roomData.deck_order);
      if (orderStr !== currentDeckOrderStr && Object.keys(allCardsMap).length > 0) {
          const sortedDeck = roomData.deck_order
              .map((id: string) => allCardsMap[id])
              .filter((c: CardData | undefined) => c !== undefined);
          
          setActiveDeck(sortedDeck);
          setCurrentDeckOrderStr(orderStr);
      }
    }

    const activeTeamIdFromDB = roomData.current_team;
    const teamIdx = activeTeamIdFromDB === 'A' ? 0 : 1;
    const teamPlayers = teamIdx === 0 ? teamA : teamB;
    const narratorIdx = teamIdx === 0 ? roomData.team_a_narrator_index : roomData.team_b_narrator_index;
    const activeNarrator = teamPlayers.length > 0 ? teamPlayers[narratorIdx % teamPlayers.length] : null;
    
    const amINarrator = currentUserRef.current?.id === activeNarrator?.id;
    const isNewTurn = turnExpiresAt !== roomData.turn_expires_at;

    if (amINarrator && !isNewTurn) {
        setTeams(prev => [
          { ...prev[0], name: roomData.team_a_name || prev[0].name, players: teamA }, 
          { ...prev[1], name: roomData.team_b_name || prev[1].name, players: teamB }
        ]);
    } else {
        setTeams(prev => [
          { ...prev[0], name: roomData.team_a_name || prev[0].name, players: teamA, score: roomData.team_a_score || 0, currentNarratorIndex: roomData.team_a_narrator_index || 0 },
          { ...prev[1], name: roomData.team_b_name || prev[1].name, players: teamB, score: roomData.team_b_score || 0, currentNarratorIndex: roomData.team_b_narrator_index || 0 }
        ]);
        setCurrentCardIndex(roomData.current_card_index || 0);
        setPassCount(roomData.pass_count || 0);
    }

    setCurrentTeamIndex(roomData.current_team === 'A' ? 0 : 1);
    
    if (isNewTurn) {
        setTurnExpiresAt(roomData.turn_expires_at);
        setIsProcessingTurn(false);
    }
    
    const serverStatus = roomData.status;
    if (serverStatus === 'LOBBY' && gameStateRef.current !== GameState.LOBBY) {
        setGameState(GameState.LOBBY);
        setUserManuallyReturnedToLobby(false);
    } 
    else if (serverStatus === 'PLAYING' && gameStateRef.current !== GameState.PLAYING) {
        setGameState(GameState.PLAYING);
        setUserManuallyReturnedToLobby(false);
    }
    else if (serverStatus === 'FINISHED' && gameStateRef.current !== GameState.GAME_OVER) {
        if (!userManuallyReturnedToLobby) {
            setGameState(GameState.GAME_OVER);
        }
    }
  }, [roomCode, allCardsMap, currentDeckOrderStr, turnExpiresAt]);

  useEffect(() => {
    if ((gameStateRef.current === GameState.WELCOME || gameStateRef.current === GameState.JOIN_ROOM) || !roomCode) return;
    
    syncData();
    const sub = subscribeToRoom(roomCode, () => { syncData(); });
    return () => { sub.unsubscribe(); };
  }, [roomCode, allCardsMap, syncData]); 

  // Sonraki Tur
  const handleNextTurn = useCallback(async () => {
     if (isProcessingTurn) return;
     setIsProcessingTurn(true);

     const currentTeams = teamsRef.current;
     const currentIdx = currentTeamIndex; 

     const nextTeam = currentIdx === 0 ? 'B' : 'A';
     const newIndexA = currentTeams[0].currentNarratorIndex + (currentIdx === 0 ? 1 : 0);
     const newIndexB = currentTeams[1].currentNarratorIndex + (currentIdx === 1 ? 1 : 0);
     
     setCurrentTeamIndex(currentIdx === 0 ? 1 : 0);
     
     await startNextTurn(roomCode, nextTeam, gameSettings.roundTime, { indexA: newIndexA, indexB: newIndexB });
     await safeIncrementCard(roomCode);
  }, [isProcessingTurn, currentTeamIndex, roomCode, gameSettings]);

  const handleTimeUp = useCallback(() => { 
    handleNextTurn(); 
  }, [handleNextTurn]);

  // Timer
  useEffect(() => {
    if (gameState !== GameState.PLAYING || !turnExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(turnExpiresAt).getTime();
      const diff = Math.ceil((end - now) / 1000);
      
      if (diff <= 0) {
        setTimeLeft(0);
        
        const isTurnAlreadyHandled = lastHandledTurnRef.current === turnExpiresAt;
        
        if (currentUser?.isHost && !isTurnAlreadyHandled && !isProcessingTurn) { 
           lastHandledTurnRef.current = turnExpiresAt; 
           handleTimeUp(); 
        }
        else if (diff <= -2 && !isTurnAlreadyHandled && !isProcessingTurn) {
           lastHandledTurnRef.current = turnExpiresAt; 
           handleTimeUp();
        }

      } else {
        if (isProcessingTurn && diff > gameSettings.roundTime - 1) {
           setIsProcessingTurn(false);
        }
        setTimeLeft(Math.min(diff, gameSettings.roundTime));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [turnExpiresAt, gameState, currentUser, isProcessingTurn, gameSettings.roundTime, handleTimeUp]);

  const startGame = useCallback(async () => {
    setIsLoading(true);
    if (teams[1].players.length === 0) {
      const botPlayer: Player = {
        id: 'bot_sparring',
        name: 'Gölge Rakip (AI)',
        avatar: 'oni',
        team: 'B',
        isHost: false
      };
      setTeams(prev => [
        prev[0],
        { ...prev[1], players: [botPlayer] }
      ]);
    }
    await startNextTurn(roomCode, 'A', gameSettings.roundTime, undefined, true);
    setGameState(GameState.PLAYING);
    setIsLoading(false);
  }, [roomCode, gameSettings, teams]);

  const advanceCardOptimistically = () => {
    const deckLen = activeDeck.length > 0 ? activeDeck.length : 1;
    setCurrentCardIndex((prev) => (prev + 1) % deckLen);
    return deckLen;
  };

  const handleCorrect = async () => {
    const isTeamA = currentTeamIndex === 0;
    const teamKey = isTeamA ? 'A' : 'B';
    const newScore = teams[currentTeamIndex].score + 1;
    
    setTeams(prev => { const u = [...prev]; u[currentTeamIndex].score = newScore; return u; });
    advanceCardOptimistically(); 
    
    if (newScore >= gameSettings.targetScore) {
       await finishGame(roomCode, teamKey, newScore);
    } else {
       await safeScorePoint(roomCode, teamKey);
    }
  };

  const handleTaboo = async () => {
    const isTeamA = currentTeamIndex === 0;
    const teamKey = isTeamA ? 'A' : 'B';
    const newScore = teams[currentTeamIndex].score - 1;

    setTeams(prev => { const u = [...prev]; u[currentTeamIndex].score = newScore; return u; });
    advanceCardOptimistically(); 
    
    await safeLosePoint(roomCode, teamKey);
  };

  const handlePass = async () => {
    if (gameSettings.passLimit > 0 && passCount >= gameSettings.passLimit) return;
    
    setPassCount(prev => prev + 1);
    advanceCardOptimistically(); 
    
    await safePass(roomCode);
  };

  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08010e] text-white">
         <Loader2 size={36} className="text-rose-500 animate-spin mb-3" />
         <h2 className="text-sm font-bold tracking-widest uppercase font-mono text-slate-300">VETO BAĞLANTISI KURULUYOR...</h2>
      </div>
    );
  }

  // RENDER
  if (gameState === GameState.WELCOME) {
    return (
      <WelcomeScreen 
        onCreateRoom={handleCreateRoom} 
        onJoinRoom={handleJoinRoomDirect} 
        isJoining={isLoading}
        onBackToMenu={onBackToMenu}
      />
    );
  }
  
  if (gameState === GameState.LOBBY && currentUser) {
    return (
      <LobbyScreen 
        roomCode={roomCode} 
        teams={teams} 
        currentUser={currentUser} 
        settings={gameSettings} 
        onStartGame={startGame} 
        onSwitchTeam={switchTeam} 
        onLeave={handleLeaveLobby} 
        onUpdateSettings={handleUpdateSettings} 
        onAddBot={handleAddBot}
        isHost={currentUser.isHost}
      />
    );
  }

  if (gameState === GameState.GAME_OVER) {
    return (
      <GameOverScreen 
        teams={teams} 
        onRestart={handleRestartGame} 
        onReturnToLobby={handleReturnToLobby} 
        onHome={onBackToMenu} 
        isHost={currentUser?.isHost ?? false} 
      />
    );
  }

  if (gameState === GameState.PLAYING) {
    const currentCard = activeDeck.length > 0 ? activeDeck[currentCardIndex] : null;
    let roleText = isMeNarrator ? "ANLATIYORSUN" : (isMyTeamActive ? "TAHMİN ET!" : "YASAK KONTROLÜ!");
    let roleBadge = isMeNarrator 
      ? "text-amber-300 border-amber-400/40 bg-amber-950/40" 
      : (isMyTeamActive 
          ? "text-emerald-300 border-emerald-400/40 bg-emerald-950/40" 
          : "text-rose-300 border-rose-400/40 bg-rose-950/40"
        );

    return (
      <div className="h-screen max-h-screen w-full flex flex-col justify-between bg-[#08020e] text-white overflow-hidden relative font-sans select-none p-3 sm:p-5">
        
        {/* İnce Zemin */}
        <div className="absolute inset-0 z-0 bg-[#08020e] pointer-events-none" />

        {/* 0. Üst Navigasyon & Kaçış HUD Barı */}
        <header className="relative z-30 shrink-0 max-w-4xl w-full mx-auto flex items-center justify-between pb-1">
          <button
            onClick={() => setShowLeaveDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer active:translate-y-0.5"
            title="Düellodan Ayrıl"
          >
            <LogOut size={14} className="text-rose-400" />
            <span>Ayrıl</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest px-2.5 py-1 rounded-md bg-[#12070e] border border-white/10 text-rose-300">
              ODA: {roomCode}
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Hedef: {gameSettings.targetScore} Puan
            </span>
          </div>

          {currentUser?.isHost ? (
            <button
              onClick={handleRestartGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-white/10 hover:border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer active:translate-y-0.5"
              title="Lobiye Dön"
            >
              <RotateCcw size={13} className="text-amber-400" />
              <span>Lobiye Dön</span>
            </button>
          ) : (
            <div className="w-16" />
          )}
        </header>

        {/* 1. Üst Skor Paneli */}
        <ScoreBoard teams={teams} currentTeamId={activeTeam.id} currentNarrator={currentNarrator} />

        {/* 2. Zamanlayıcı */}
        <div className="relative z-20 shrink-0">
          <GameTimer timeLeft={timeLeft} totalTime={gameSettings.roundTime} isActive={true} onTimeUp={() => {}} />
        </div>

        {/* 3. Ana Kart Alanı */}
        <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center max-w-lg w-full mx-auto py-1">
          {/* Rol Göstergesi */}
          <div className="mb-3 flex flex-col items-center shrink-0">
            <span className={`px-4 py-1 rounded-full border text-xs font-black tracking-[0.2em] uppercase font-mono ${roleBadge}`}>
              {roleText}
            </span>
            {currentNarrator && (
              <span className="text-[11px] text-slate-400 font-medium mt-1">
                Anlatan Savaşçı: <strong className="text-white font-bold">{currentNarrator.name}</strong>
              </span>
            )}
          </div>

          {/* Kart */}
          <div className="w-full flex-1 min-h-0 max-h-[460px]">
            {isProcessingTurn || !currentCard ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin text-rose-400 mb-2" size={32} />
                <span className="text-xs text-slate-400">Sonraki Kart Hazırlanıyor...</span>
              </div>
            ) : (
              <CardErrorBoundary>
                <GameCard card={currentCard} isMasked={shouldMaskCard} />
              </CardErrorBoundary>
            )}
          </div>
        </main>

        {/* 4. Alt Kontroller (Yalnızca Anlatan Oyuncu için) */}
        <div className="relative z-20 shrink-0 pb-1">
          {isMeNarrator && !isProcessingTurn ? (
            <GameControls 
              onCorrect={handleCorrect} 
              onTaboo={handleTaboo} 
              onPass={handlePass} 
              passCount={passCount} 
              passLimit={gameSettings.passLimit} 
            />
          ) : (
            <div className="h-12 flex items-center justify-center text-[11px] text-slate-500 font-mono">
              <span>{isMyTeamActive ? 'Kelimeleri dikkatlice dinle ve tahmin et' : 'Yasaklı kelime kullanılırsa VETO hakkı doğar'}</span>
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={showLeaveDialog}
          title="Düellodan Ayrıl"
          message="Devam eden düellodan ayrılmak istediğinize emin misiniz? Lobiden çıkarılacaksınız."
          confirmText="Ayrıl"
          cancelText="Vazgeç"
          onConfirm={async () => {
            setShowLeaveDialog(false);
            await handleLeaveLobby();
          }}
          onCancel={() => setShowLeaveDialog(false)}
          variant="danger"
        />

      </div>
    );
  }

  return null;
};

export default VetoGame;
