import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { CardData, Player, GameSettings } from '../types';
import { MOCK_CARDS } from '../constants';

// --- YARDIMCI: Gerçek Karıştırma (Fisher-Yates Shuffle) ---
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// --- YEREL MOCK DEPO (Çevrimdışı / Geliştirme Desteği) ---
interface LocalRoomData {
  code: string;
  status: string;
  target_score: number;
  round_time: number;
  pass_limit: number;
  team_a_name: string;
  team_b_name: string;
  team_a_score: number;
  team_b_score: number;
  current_card_index: number;
  pass_count: number;
  deck_order: string[];
  active_team: 'A' | 'B';
  turn_expires_at: string | null;
  current_narrator_a: number;
  current_narrator_b: number;
}

const localRooms = new Map<string, LocalRoomData>();
const localPlayers = new Map<string, Player[]>();
let localListeners: ((payload: any) => void)[] = [];

const notifyLocal = (event: string, payload?: any) => {
  localListeners.forEach(cb => {
    try {
      cb({ event, new: payload, data: payload });
    } catch (e) {
      console.error(e);
    }
  });
};

const normalizeCard = (item: any): CardData => {
  const words = Array.isArray(item.forbidden_words)
    ? item.forbidden_words
    : Array.isArray(item.taboo_words)
      ? item.taboo_words
      : [];

  return {
    id: String(item.id),
    word: String(item.word || '').toUpperCase(),
    forbidden_words: words,
    taboo_words: words,
    category: item.category || 'Genel',
    difficulty: item.difficulty || 'medium',
  };
};

// 1. Tüm kartları ham olarak çeker (Supabase veya Dahili MOCK_CARDS)
export const getAllCardsRaw = async (): Promise<CardData[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('veto_cards').select('*');
      if (!error && data && data.length > 0) {
        return data.map(normalizeCard);
      }
    } catch (e) { /**/ }
  }
  return MOCK_CARDS.map(normalizeCard);
};

// 2. Kart ID'lerini alır, karıştırır ve bir liste olarak döndürür
export const generateNewDeckOrder = async (): Promise<string[]> => {
  const cards = await getAllCardsRaw();
  const ids = cards.map(c => c.id);
  return shuffleArray(ids);
};

export const getPlayersInRoom = async (roomCode: string): Promise<Player[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('veto_players').select('*').eq('room_code', roomCode);
      if (data && data.length > 0) {
        return data.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.is_host,
          team: p.team,
          avatar: p.avatar,
          ...p
        })) as Player[];
      }
    } catch (e) { /**/ }
  }
  return localPlayers.get(roomCode) || [];
};

export const getRoomDetails = async (roomCode: string) => {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('veto_rooms').select('*').eq('code', roomCode).single();
      if (data) return data;
    } catch (e) { /**/ }
  }
  return localRooms.get(roomCode) || null;
};

// Odayı kurarken desteyi karıştırıp kaydeder
export const createRoom = async (
  hostName: string, 
  hostId: string, 
  settings: GameSettings,
  teamNames: { teamA: string, teamB: string },
  avatar?: string
): Promise<string | null> => {
  const code = generateRoomCode();
  const initialDeckOrder = await generateNewDeckOrder();

  if (isSupabaseConfigured) {
    try {
      const { error: roomError } = await supabase
        .from('veto_rooms')
        .insert([{ 
           code, 
           status: 'LOBBY', 
           target_score: settings.targetScore,
           round_time: settings.roundTime,
           pass_limit: settings.passLimit,
           team_a_name: teamNames.teamA,
           team_b_name: teamNames.teamB,
           deck_order: initialDeckOrder
        }]);

      if (!roomError) {
        const playerPayload: any = {
          id: hostId,
          room_code: code,
          name: hostName,
          is_host: true,
          team: 'A'
        };
        if (avatar) playerPayload.avatar = avatar;

        const { error: pError } = await supabase.from('veto_players').insert([playerPayload]);
        if (pError && pError.message?.includes('avatar')) {
          delete playerPayload.avatar;
          await supabase.from('veto_players').insert([playerPayload]);
        }
        return code;
      }
    } catch (err) { /**/ }
  }

  // Yerel Depo Fallback
  localRooms.set(code, {
    code,
    status: 'LOBBY',
    target_score: settings.targetScore,
    round_time: settings.roundTime,
    pass_limit: settings.passLimit,
    team_a_name: teamNames.teamA,
    team_b_name: teamNames.teamB,
    team_a_score: 0,
    team_b_score: 0,
    current_card_index: 0,
    pass_count: 0,
    deck_order: initialDeckOrder,
    active_team: 'A',
    turn_expires_at: null,
    current_narrator_a: 0,
    current_narrator_b: 0
  });

  localPlayers.set(code, [{
    id: hostId,
    name: hostName,
    isHost: true,
    team: 'A',
    avatar: avatar || 'samurai-1'
  }]);

  notifyLocal('PLAYER_UPDATE');
  return code;
};

export const joinRoom = async (code: string, playerName: string, playerId: string, avatar?: string): Promise<'SUCCESS' | 'NOT_FOUND' | 'ERROR'> => {
  if (isSupabaseConfigured) {
    try {
      const { data: room } = await supabase.from('veto_rooms').select('code').eq('code', code).single();
      if (!room) return 'NOT_FOUND';

      const { data: players } = await supabase.from('veto_players').select('team').eq('room_code', code);
      const countA = players?.filter(p => p.team === 'A').length || 0;
      const countB = players?.filter(p => p.team === 'B').length || 0;
      const assignedTeam = countA <= countB ? 'A' : 'B';
      
      const playerPayload: any = {
        id: playerId,
        room_code: code,
        name: playerName,
        is_host: false,
        team: assignedTeam
      };
      if (avatar) playerPayload.avatar = avatar;

      let { error } = await supabase.from('veto_players').insert([playerPayload]);
      if (error && error.message?.includes('avatar')) {
        delete playerPayload.avatar;
        const retry = await supabase.from('veto_players').insert([playerPayload]);
        error = retry.error;
      }
      return error ? 'ERROR' : 'SUCCESS';
    } catch (err) { /**/ }
  }

  // Yerel Depo
  const existingRoom = localRooms.get(code);
  if (!existingRoom) {
    const defaultDeck = await generateNewDeckOrder();
    localRooms.set(code, {
      code,
      status: 'LOBBY',
      target_score: 25,
      round_time: 60,
      pass_limit: 3,
      team_a_name: 'GÖLGE TAKIMI',
      team_b_name: 'IŞIK TAKIMI',
      team_a_score: 0,
      team_b_score: 0,
      current_card_index: 0,
      pass_count: 0,
      deck_order: defaultDeck,
      active_team: 'A',
      turn_expires_at: null,
      current_narrator_a: 0,
      current_narrator_b: 0
    });
  }

  const currentList = localPlayers.get(code) || [];
  const countA = currentList.filter(p => p.team === 'A').length;
  const countB = currentList.filter(p => p.team === 'B').length;
  const assignedTeam: 'A' | 'B' = countA <= countB ? 'A' : 'B';

  const newP: Player = {
    id: playerId,
    name: playerName,
    isHost: currentList.length === 0,
    team: assignedTeam,
    avatar: avatar || 'samurai-2'
  };

  currentList.push(newP);
  localPlayers.set(code, currentList);
  notifyLocal('PLAYER_UPDATE');

  return 'SUCCESS';
};

export const switchPlayerTeam = async (playerId: string, newTeam: 'A' | 'B') => {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('veto_players').update({ team: newTeam }).eq('id', playerId);
    } catch (err) { /**/ }
  }

  localPlayers.forEach((players) => {
    const found = players.find(p => p.id === playerId);
    if (found) {
      found.team = newTeam;
      notifyLocal('PLAYER_UPDATE');
    }
  });
};

export const leaveRoom = async (roomCode: string, playerId: string) => {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('veto_players').delete().eq('id', playerId);
      const { count } = await supabase.from('veto_players').select('*', { count: 'exact', head: true }).eq('room_code', roomCode);
      if (count === 0) {
        await supabase.from('veto_rooms').delete().eq('code', roomCode);
      }
    } catch (err) { /**/ }
  }

  const list = localPlayers.get(roomCode);
  if (list) {
    const updated = list.filter(p => p.id !== playerId);
    localPlayers.set(roomCode, updated);
    if (updated.length === 0) localRooms.delete(roomCode);
    notifyLocal('PLAYER_UPDATE');
  }
};

export const startNextTurn = async (
  roomCode: string, 
  nextTeam: 'A' | 'B', 
  roundTime: number, 
  newNarratorIndices?: { indexA: number, indexB: number },
  isGameStart = false
) => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.rpc('veto_start_next_turn_atomic', {
        p_room_code: roomCode,
        p_next_team: nextTeam,
        p_round_time: roundTime,
        p_next_narrator_a: newNarratorIndices?.indexA ?? null,
        p_next_narrator_b: newNarratorIndices?.indexB ?? null,
        p_is_game_start: isGameStart
      });
      if (!error) return;
    } catch (err) { /**/ }
  }

  const room = localRooms.get(roomCode);
  if (room) {
    room.status = 'PLAYING';
    room.active_team = nextTeam;
    room.pass_count = 0;
    room.turn_expires_at = new Date(Date.now() + roundTime * 1000).toISOString();
    if (newNarratorIndices) {
      room.current_narrator_a = newNarratorIndices.indexA;
      room.current_narrator_b = newNarratorIndices.indexB;
    }
    notifyLocal('ROOM_UPDATE', room);
  }
};

export const updateGameState = async (roomCode: string, updates: { 
  scoreA?: number, scoreB?: number, cardIndex?: number, passCount?: number 
}) => {
  if (isSupabaseConfigured) {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.scoreA !== undefined) dbUpdates.team_a_score = updates.scoreA;
      if (updates.scoreB !== undefined) dbUpdates.team_b_score = updates.scoreB;
      if (updates.cardIndex !== undefined) dbUpdates.current_card_index = updates.cardIndex;
      if (updates.passCount !== undefined) dbUpdates.pass_count = updates.passCount;

      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('veto_rooms').update(dbUpdates).eq('code', roomCode);
      }
    } catch (err) { /**/ }
  }

  const room = localRooms.get(roomCode);
  if (room) {
    if (updates.scoreA !== undefined) room.team_a_score = updates.scoreA;
    if (updates.scoreB !== undefined) room.team_b_score = updates.scoreB;
    if (updates.cardIndex !== undefined) room.current_card_index = updates.cardIndex;
    if (updates.passCount !== undefined) room.pass_count = updates.passCount;
    notifyLocal('ROOM_UPDATE', room);
  }
};

export const resetGame = async (roomCode: string) => {
  const newDeckOrder = await generateNewDeckOrder();
  
  if (isSupabaseConfigured) {
    try {
      await supabase.from('veto_rooms').update({
        status: 'LOBBY',
        team_a_score: 0,
        team_b_score: 0,
        current_card_index: 0,
        pass_count: 0,
        deck_order: newDeckOrder 
      }).eq('code', roomCode);
    } catch (err) { /**/ }
  }

  const room = localRooms.get(roomCode);
  if (room) {
    room.status = 'LOBBY';
    room.team_a_score = 0;
    room.team_b_score = 0;
    room.current_card_index = 0;
    room.pass_count = 0;
    room.deck_order = newDeckOrder;
    notifyLocal('ROOM_UPDATE', room);
  }
};

export const updateRoomSettings = async (roomCode: string, settings: GameSettings) => {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('veto_rooms').update({
        round_time: settings.roundTime,
        target_score: settings.targetScore,
        pass_limit: settings.passLimit
      }).eq('code', roomCode);
    } catch (err) { /**/ }
  }

  const room = localRooms.get(roomCode);
  if (room) {
    room.round_time = settings.roundTime;
    room.target_score = settings.targetScore;
    room.pass_limit = settings.passLimit;
    notifyLocal('ROOM_UPDATE', room);
  }
};

export const finishGame = async (roomCode: string, winningTeam: 'A' | 'B', finalScore: number) => {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('veto_rooms').update({
        status: 'FINISHED',
        [winningTeam === 'A' ? 'team_a_score' : 'team_b_score']: finalScore
      }).eq('code', roomCode);
    } catch (err) { /**/ }
  }

  const room = localRooms.get(roomCode);
  if (room) {
    room.status = 'FINISHED';
    if (winningTeam === 'A') room.team_a_score = finalScore;
    else room.team_b_score = finalScore;
    notifyLocal('ROOM_UPDATE', room);
  }
};

export const subscribeToRoom = (roomCode: string, onUpdate: (payload: any) => void) => {
  if (isSupabaseConfigured) {
    try {
      const channel = supabase.channel(`room_channel_${roomCode}`);
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'veto_players', filter: `room_code=eq.${roomCode}` }, onUpdate);
      channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'veto_rooms', filter: `code=eq.${roomCode}` }, onUpdate);
      return channel.subscribe();
    } catch (err) { /**/ }
  }

  localListeners.push(onUpdate);
  return {
    unsubscribe: () => {
      localListeners = localListeners.filter(cb => cb !== onUpdate);
    }
  };
};

export const safeIncrementCard = async (roomCode: string) => {
  if (isSupabaseConfigured) {
    try {
      await supabase.rpc('veto_increment_card', { p_room_code: roomCode, p_amount: 1 });
      return;
    } catch (err) { /**/ }
  }

  const room = localRooms.get(roomCode);
  if (room) {
    room.current_card_index = (room.current_card_index || 0) + 1;
    notifyLocal('ROOM_UPDATE', room);
  }
};

export const safeScorePoint = async (roomCode: string, team: 'A' | 'B') => {
  if (isSupabaseConfigured) {
    try {
      if (team === 'A') {
        await supabase.rpc('veto_increment_score_a', { p_room_code: roomCode, p_amount: 1 });
      } else {
        await supabase.rpc('veto_increment_score_b', { p_room_code: roomCode, p_amount: 1 });
      }
      return;
    } catch (err) { /**/ }
  }

  const room = localRooms.get(roomCode);
  if (room) {
    if (team === 'A') room.team_a_score = (room.team_a_score || 0) + 1;
    else room.team_b_score = (room.team_b_score || 0) + 1;
    room.current_card_index = (room.current_card_index || 0) + 1;
    notifyLocal('ROOM_UPDATE', room);
  }
};

export const safeLosePoint = async (roomCode: string, team: 'A' | 'B') => {
  if (isSupabaseConfigured) {
    try {
      if (team === 'A') {
        await supabase.rpc('veto_increment_score_a', { p_room_code: roomCode, p_amount: -1 });
      } else {
        await supabase.rpc('veto_increment_score_b', { p_room_code: roomCode, p_amount: -1 });
      }
      return;
    } catch (err) { /**/ }
  }

  const room = localRooms.get(roomCode);
  if (room) {
    if (team === 'A') room.team_a_score = Math.max(0, (room.team_a_score || 0) - 1);
    else room.team_b_score = Math.max(0, (room.team_b_score || 0) - 1);
    room.current_card_index = (room.current_card_index || 0) + 1;
    notifyLocal('ROOM_UPDATE', room);
  }
};

export const safePass = async (roomCode: string) => {
  if (isSupabaseConfigured) {
    try {
      await supabase.rpc('veto_increment_pass', { p_room_code: roomCode });
      return;
    } catch (err) { /**/ }
  }

  const room = localRooms.get(roomCode);
  if (room) {
    room.pass_count = (room.pass_count || 0) + 1;
    room.current_card_index = (room.current_card_index || 0) + 1;
    notifyLocal('ROOM_UPDATE', room);
  }
};
