import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GamePhase from './components/GamePhase';
import VotingPhase from './components/VotingPhase';
import Scoreboard from './components/Scoreboard';
import ConfirmDialog from './components/ConfirmDialog';
import ConnectionStatus from './components/ConnectionStatus';
import LoadingScreen from './components/LoadingScreen';
import { GameStatus, Player, Room, RoundAnswers, Vote, RoomSettings } from './types';
import { gameService } from './services/gameService';
import { supabase } from './services/supabase';
import { CATEGORIES } from './constants';
import { ThemeProvider } from './contexts/ThemeContext';

interface HarfbazGameProps {
  onBackToMenu: () => void;
}

const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const HarfbazGame: React.FC<HarfbazGameProps> = ({ onBackToMenu }) => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOBBY);
  const [room, setRoom] = useState<Room | null>(null);
  const [me, setMe] = useState<Player | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [roundAnswers, setRoundAnswers] = useState<RoundAnswers>({});
  const [currentVotes, setCurrentVotes] = useState<Vote[]>([]);

  const [loading, setLoading] = useState(false);
  const processingRef = useRef(false);
  const processedRoundsRef = useRef<Set<number>>(new Set());
  const submittedRoundsRef = useRef<Set<number>>(new Set());
  const isLeavingRef = useRef(false);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dialog state
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [playerToKick, setPlayerToKick] = useState<string | null>(null);

  // Connection state
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const meRef = useRef(me);
  const roomRef = useRef(room);
  const statusRef = useRef(status);

  useEffect(() => {
    meRef.current = me;
    roomRef.current = room;
    statusRef.current = status;
  }, [me, room, status]);

  // Session recovery
  useEffect(() => {
    const session = localStorage.getItem('harfbaz_session');
    if (!session || activeRoomId) return;

    let roomId: string | undefined;
    let playerId: string | undefined;
    try {
      const parsed = JSON.parse(session);
      if (typeof parsed?.roomId === 'string' && typeof parsed?.playerId === 'string') {
        roomId = parsed.roomId;
        playerId = parsed.playerId;
      }
    } catch { /**/ }

    if (!roomId || !playerId) {
      localStorage.removeItem('harfbaz_session');
      return;
    }

    gameService.reconnect(roomId, playerId).then(async (data) => {
      if (data) {
        setRoom(data.room);
        setMe(data.player);
        setActiveRoomId(data.room.id);
        let recoveredStatus = data.room.status as GameStatus;
        if (data.room.status === 'LOBBY') recoveredStatus = GameStatus.WAITING;
        setStatus(recoveredStatus);

        if (recoveredStatus === GameStatus.VOTING && data.room.currentRound && data.room.currentGameId) {
          try {
            const answers = await gameService.getRoundAnswers(roomId, data.room.currentRound, data.room.currentGameId);
            setRoundAnswers(answers);
            const votes = await gameService.getVotes(roomId, data.room.currentRound);
            setCurrentVotes(votes);
          } catch (e) {
            console.error('Reconnect sonrası veri yükleme hatası:', e);
          }
        }
      } else {
        localStorage.removeItem('harfbaz_session');
      }
    });
  }, []);

  useEffect(() => {
    if (!activeRoomId) return;

    const refreshPlayers = async () => {
      const freshPlayers = await gameService.getPlayers(activeRoomId);
      setRoom((prev: Room | null) => prev ? { ...prev, players: freshPlayers } : null);

      const currentMe = meRef.current;
      if (currentMe) {
        const myFreshData = freshPlayers.find(p => p.id === currentMe.id);
        if (!myFreshData) {
          setStatus(GameStatus.LOBBY);
          setActiveRoomId(null);
          setRoom(null);
          setMe(null);
          localStorage.removeItem('harfbaz_session');
        } else {
          if (myFreshData.isHost !== currentMe.isHost || myFreshData.score !== currentMe.score) {
            setMe(myFreshData);
          }
        }
      }
    };

    const debouncedRefreshPlayers = debounce(refreshPlayers, 300);

    const refreshVotes = async (round: number) => {
      const votes = await gameService.getVotes(activeRoomId, round);
      setCurrentVotes(votes);
    };

    refreshPlayers();

    const handleConnectionChange = (s: 'connected' | 'disconnected' | 'reconnecting') => {
      setIsConnected(s === 'connected');
      setIsReconnecting(s === 'reconnecting');
    };

    const unsubscribe = gameService.subscribeToRoom(activeRoomId, async (update) => {
      if (update.type === 'ROOM_UPDATE') {
        const newRoomData = update.data;
        let dbStatus = newRoomData.status as string;
        let uiStatus = dbStatus as GameStatus;
        if (dbStatus === 'LOBBY' && activeRoomId) uiStatus = GameStatus.WAITING;
        if (dbStatus === 'PODIUM') uiStatus = GameStatus.SCORING;

        if (uiStatus !== statusRef.current) {
          setStatus(uiStatus);

          if (uiStatus === GameStatus.WAITING) {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
            }
            setRoundAnswers({});
            setCurrentVotes([]);
            processedRoundsRef.current = new Set();
            submittedRoundsRef.current = new Set();
          }

          if (uiStatus === GameStatus.PLAYING) {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
            }
            setRoundAnswers({});
            setCurrentVotes([]);
            setTimeout(() => {
              refreshPlayers();
            }, 500);
          }

          if (uiStatus === GameStatus.VOTING) {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
            }
            setRoundAnswers({});
            const answers = await gameService.getRoundAnswers(activeRoomId, newRoomData.current_round, newRoomData.current_game_id);
            setRoundAnswers(answers);
            refreshVotes(newRoomData.current_round);
          }
          if (uiStatus === GameStatus.SCORING || uiStatus === GameStatus.GAME_OVER) {
            refreshPlayers();
          }
        }

        setRoom((prev: Room | null) => prev ? {
          ...prev,
          status: newRoomData.status,
          currentLetter: newRoomData.current_letter,
          currentRound: newRoomData.current_round,
          currentGameId: newRoomData.current_game_id,
          settings: {
            ...newRoomData.settings,
            categories: newRoomData.settings?.categories ?? prev.settings?.categories,
          },
          votingCategoryIndex: newRoomData.voting_category_index,
          revealedPlayers: newRoomData.revealed_players,
          roundStartTime: newRoomData.round_start_time,
          isPublic: newRoomData.is_public === true
        } : null);
      }

      if (update.type === 'PLAYER_UPDATE') {
        debouncedRefreshPlayers();
      }

      if (update.type === 'VOTES_UPDATE') {
        const { eventType, new: newRecord, old: oldRecord } = update.payload;

        setCurrentVotes((prevVotes: Vote[]) => {
          if (eventType === 'DELETE' && oldRecord?.id) {
            return prevVotes.filter((v: Vote) => v.id !== oldRecord.id);
          }

          if (eventType === 'INSERT' && newRecord) {
            const cleanVotes = prevVotes.filter((v: Vote) =>
              !(v.voterId === newRecord.voter_id &&
                v.targetPlayerId === newRecord.target_player_id &&
                v.category === newRecord.category)
            );

            const newVote: Vote = {
              id: newRecord.id,
              voterId: newRecord.voter_id,
              targetPlayerId: newRecord.target_player_id,
              category: newRecord.category,
              isVeto: newRecord.is_veto
            };
            return [...cleanVotes, newVote];
          }
          return prevVotes;
        });
      }

      if (update.type === 'ANSWERS_UPDATE') {
        const { new: newRecord, eventType } = update.payload;
        if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRecord) {
          setRoundAnswers((prev: RoundAnswers) => ({
            ...prev,
            [newRecord.player_id]: newRecord.answers_json
          }));
        }
      }
    }, handleConnectionChange);

    return () => { unsubscribe(); };
  }, [activeRoomId]);

  // ACTIONS
  const handleJoinRoom = (roomData: Room, playerData: Player) => {
    setRoom(roomData);
    setMe(playerData);
    setActiveRoomId(roomData.id);
    setStatus(GameStatus.WAITING);
    localStorage.setItem('harfbaz_session', JSON.stringify({ roomId: roomData.id, playerId: playerData.id }));
  };

  const handleLeaveRoom = () => {
    setLeaveDialogOpen(true);
  };

  const confirmLeaveRoom = async () => {
    setLeaveDialogOpen(false);
    isLeavingRef.current = true;
    localStorage.removeItem('harfbaz_session');
    if (me?.id) await gameService.leaveRoom(me.id);
    setActiveRoomId(null);
    setRoom(null);
    setMe(null);
    setStatus(GameStatus.LOBBY);
  };

  const handleKickPlayer = async (playerId: string) => {
    if (me?.isHost && activeRoomId) {
      setPlayerToKick(playerId);
      setKickDialogOpen(true);
    }
  };

  const confirmKickPlayer = async () => {
    setKickDialogOpen(false);
    if (playerToKick && activeRoomId) {
      try {
        await gameService.kickPlayer(activeRoomId, playerToKick);
      } catch (e) {
        console.error("Oyuncu atma hatası:", e);
      }
      setPlayerToKick(null);
    }
  };

  const handleUpdateSettings = async (newSettings: RoomSettings) => {
    if (activeRoomId) {
      setRoom((prev: any) => prev ? { ...prev, settings: newSettings } : null);
      await gameService.updateSettings(activeRoomId, newSettings);
    }
  };

  const handleSetPublic = async (isPublic: boolean) => {
    if (!activeRoomId || !me?.isHost) return;
    setRoom((prev: Room | null) => prev ? { ...prev, isPublic } : null);
    try {
      await gameService.setRoomPublic(activeRoomId, isPublic);
    } catch (e) {
      console.error('Online mod değiştirme hatası:', e);
      setRoom((prev: Room | null) => prev ? { ...prev, isPublic: !isPublic } : null);
    }
  };

  const handleStartGame = async () => {
    if (!activeRoomId || loading) return;
    setLoading(true);
    try {
      await gameService.startGame(activeRoomId);
      const freshPlayers = await gameService.getPlayers(activeRoomId);
      setRoom((prev: Room | null) => prev ? { ...prev, players: freshPlayers } : null);
    } finally {
      setLoading(false);
    }
  };

  // Aktif Tur İzleme ve Otomatik Oylamaya Geçiş Mekanizması
  useEffect(() => {
    if (status !== GameStatus.PLAYING || !activeRoomId || !room) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    const currentRoundNumber = room.currentRound;
    const roundDuration = room.settings.roundDuration || 60;
    const currentGameId = room.currentGameId;

    const interval = setInterval(async () => {
      const { data: freshRoom, error } = await supabase
        .from('harfbaz_rooms')
        .select('current_round, round_start_time, status, current_game_id')
        .eq('id', activeRoomId)
        .maybeSingle();

      if (error || !freshRoom || freshRoom.status !== 'PLAYING' || freshRoom.current_round !== currentRoundNumber) {
        return;
      }

      const freshPlayers = await gameService.getPlayers(activeRoomId);
      const playerCount = Math.max(1, freshPlayers.length);

      const allSubmitted = await gameService.checkAllAnswersSubmitted(
        activeRoomId,
        currentRoundNumber,
        playerCount,
        freshRoom.current_game_id || currentGameId
      );

      const startTime = freshRoom.round_start_time ? new Date(freshRoom.round_start_time).getTime() : Date.now();
      const elapsed = (Date.now() - startTime) / 1000;
      const isTimeExpired = elapsed >= roundDuration;

      if (allSubmitted || isTimeExpired) {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }

        if (me?.isHost || elapsed >= roundDuration + 2) {
          if (!allSubmitted) {
            try {
              await gameService.fillMissingAnswers(
                activeRoomId,
                currentRoundNumber,
                freshRoom.current_game_id || currentGameId
              );
            } catch (e) {
              console.error('Eksik cevap ekleme hatası:', e);
            }
          }

          await gameService.updateStatus(activeRoomId, GameStatus.VOTING);
        }
      }
    }, 1000);

    checkIntervalRef.current = interval;
    return () => {
      clearInterval(interval);
      checkIntervalRef.current = null;
    };
  }, [status, activeRoomId, me?.isHost, room?.currentRound, room?.settings.roundDuration, room?.currentGameId]);

  const handleRoundTimeUp = async (myAnswers: Record<string, string>) => {
    if (!me || !activeRoomId || !room) return;

    const currentRoundNumber = room.currentRound;
    const playerCount = Math.max(1, room.players.length);

    if (submittedRoundsRef.current.has(currentRoundNumber)) {
      return;
    }
    submittedRoundsRef.current.add(currentRoundNumber);

    await gameService.submitAnswers(activeRoomId, me.id, currentRoundNumber, myAnswers, room.currentGameId);

    // Tek oyuncu veya tüm oyuncular cevapladıysa anında beklemeden oylamaya geç
    if (me.isHost) {
      const allSubmitted = await gameService.checkAllAnswersSubmitted(
        activeRoomId,
        currentRoundNumber,
        playerCount,
        room.currentGameId
      );

      if (allSubmitted) {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        await gameService.updateStatus(activeRoomId, GameStatus.VOTING);
      }
    }
  };

  const handleNextCategory = async () => {
    if (!room || !activeRoomId || !me?.isHost) return;
    if (processingRef.current) return;

    processingRef.current = true;
    setLoading(true);

    try {
      const currentIndex = room.votingCategoryIndex || 0;
      const currentCategories = room.settings.categories || CATEGORIES;

      if (currentIndex < currentCategories.length - 1) {
        await gameService.updateVotingIndex(activeRoomId, currentIndex + 1);
      } else {
        if (!processedRoundsRef.current.has(room.currentRound)) {
          await gameService.calculateScores(activeRoomId, room.currentRound);
          processedRoundsRef.current.add(room.currentRound);
          const freshPlayers = await gameService.getPlayers(activeRoomId);
          setRoom((prev: Room | null) => prev ? { ...prev, players: freshPlayers } : null);
        }

        const isLastRound = room.currentRound >= room.settings.totalRounds;
        await gameService.updateStatus(activeRoomId, isLastRound ? GameStatus.GAME_OVER : GameStatus.SCORING);
      }
    } catch (e) {
      console.error("Kategori geçiş hatası:", e);
    } finally {
      processingRef.current = false;
      setLoading(false);
    }
  };

  const handleToggleVote = async (targetPlayerId: string) => {
    if (!activeRoomId || !me || !room) return;
    const currentCat = (room.settings.categories || CATEGORIES)[room.votingCategoryIndex || 0];
    await gameService.toggleVote(activeRoomId, room.currentRound, targetPlayerId, currentCat);
  };

  const handleNextRound = async () => {
    if (!activeRoomId || !me?.isHost) return;
    await gameService.nextRound(activeRoomId);
  };

  const handleReset = async () => {
    if (!activeRoomId || !me?.isHost) return;
    await gameService.resetGame(activeRoomId);
    setStatus(GameStatus.WAITING);
  };

  const renderContent = () => {
    switch (status) {
      case GameStatus.LOBBY:
        return (
          <Lobby 
            onJoin={handleJoinRoom} 
            onBackToMenu={onBackToMenu} 
          />
        );

      case GameStatus.WAITING:
        return room && me ? (
          <WaitingRoom
            room={room}
            currentPlayer={me}
            onStart={handleStartGame}
            onUpdateSettings={handleUpdateSettings}
            onLeave={handleLeaveRoom}
            onKick={handleKickPlayer}
            onSetPublic={handleSetPublic}
          />
        ) : null;

      case GameStatus.PLAYING:
        return room && me ? (
          <GamePhase
            letter={room.currentLetter}
            roundDuration={room.settings.roundDuration}
            roomId={room.id}
            playerId={me.id}
            gameId={room.currentGameId || room.id}
            roundNumber={room.currentRound}
            onTimeUp={handleRoundTimeUp}
            onLeave={handleLeaveRoom}
            categories={room.settings.categories?.length ? room.settings.categories : CATEGORIES}
            roundStartTime={room.roundStartTime}
          />
        ) : null;

      case GameStatus.VOTING:
        return room && me ? (
          <VotingPhase
            players={room.players}
            answers={roundAnswers}
            currentLetter={room.currentLetter}
            currentPlayerId={me.id}
            currentVotes={currentVotes}
            currentCategoryIndex={room.votingCategoryIndex || 0}
            isHost={me.isHost}
            onNextCategory={handleNextCategory}
            onToggleVote={handleToggleVote}
            onLeave={handleLeaveRoom}
            roundStartTime={room.roundStartTime}
            categories={room.settings.categories?.length ? room.settings.categories : CATEGORIES}
          />
        ) : null;

      case GameStatus.SCORING:
      case GameStatus.GAME_OVER:
        return room ? (
          <Scoreboard
            players={room.players}
            onNextRound={status === GameStatus.GAME_OVER ? handleReset : handleNextRound}
            isGameOver={status === GameStatus.GAME_OVER}
            roundNumber={room.currentRound}
            isHost={me?.isHost || false}
            onLeave={handleLeaveRoom}
            currentPlayerId={me?.id}
          />
        ) : null;

      default:
        return (
          <div className="min-h-screen bg-[#04070e] text-white flex items-center justify-center font-mono">
            Yükleniyor...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#04070e] text-white select-none">
      {renderContent()}

      {activeRoomId && (
        <ConnectionStatus isConnected={isConnected} isReconnecting={isReconnecting} />
      )}

      <ConfirmDialog
        isOpen={leaveDialogOpen}
        title="Oyundan Ayrıl"
        message="Oyundan ayrılmak istediğinize emin misiniz?"
        confirmText="Ayrıl"
        cancelText="İptal"
        onConfirm={confirmLeaveRoom}
        onCancel={() => setLeaveDialogOpen(false)}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={kickDialogOpen}
        title="Oyuncuyu Çıkar"
        message="Bu oyuncuyu odadan çıkarmak istediğinize emin misiniz?"
        confirmText="Çıkar"
        cancelText="İptal"
        onConfirm={confirmKickPlayer}
        onCancel={() => { setKickDialogOpen(false); setPlayerToKick(null); }}
        variant="warning"
      />
    </div>
  );
};

export default HarfbazGame;
