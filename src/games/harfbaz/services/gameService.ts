import { supabase, isSupabaseConfigured } from './supabase';
import { Player, RoomSettings, RoundAnswers, Vote, GameStatus } from '../types';
import { CATEGORIES } from '../constants';

const mapDbPlayer = (dbPlayer: any): Player => ({
  id: dbPlayer.id,
  name: dbPlayer.name,
  avatar: dbPlayer.avatar,
  isHost: dbPlayer.is_host ?? dbPlayer.isHost ?? false,
  score: dbPlayer.score ?? 0,
  isReady: dbPlayer.is_ready ?? dbPlayer.isReady ?? true,
  joinedAt: dbPlayer.created_at ?? dbPlayer.joinedAt ?? new Date().toISOString()
});

const mapDbRoom = (roomData: any, players: Player[]) => ({
  ...roomData,
  currentLetter: roomData.current_letter ?? roomData.currentLetter ?? '',
  currentRound: roomData.current_round ?? roomData.currentRound ?? 1,
  currentGameId: roomData.current_game_id ?? roomData.currentGameId ?? 'game_1',
  votingCategoryIndex: roomData.voting_category_index ?? roomData.votingCategoryIndex ?? 0,
  revealedPlayers: roomData.revealed_players ?? roomData.revealedPlayers ?? [],
  roundStartTime: roomData.round_start_time ?? roomData.roundStartTime ?? null,
  isPublic: roomData.is_public === true || roomData.isPublic === true,
  players
});

// YARDIMCI: Anonim Auth / Misafir Kimliği Kontrolü
const ensureAuth = async () => {
  if (!isSupabaseConfigured) return 'local-user';
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session.user.id;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (!error && data?.user) return data.user.id;
  } catch {
    // Anonim giriş Supabase panelinde kapalıysa sessizce session UUID fallback'e geçer
  }

  let guestId = sessionStorage.getItem('harfbaz_guest_uid');
  if (!guestId) {
    guestId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : '00000000-0000-4000-8000-' + Math.random().toString(16).slice(2, 14);
    sessionStorage.setItem('harfbaz_guest_uid', guestId);
  }
  return guestId;
};

// --- YEREL MOCK ENGINE (Çevrimdışı / Yapılandırılmamış Supabase Desteği) ---
interface LocalStore {
  room: any | null;
  players: Player[];
  answers: Record<string, Record<string, string>>;
  votes: Vote[];
  listeners: ((payload: any) => void)[];
}

const localStore: LocalStore = {
  room: null,
  players: [],
  answers: {},
  votes: [],
  listeners: []
};

const notifySubscribers = (type: string, data?: any) => {
  localStore.listeners.forEach(cb => {
    try {
      cb({ type, data });
    } catch (e) {
      console.error('Subscriber callback hatası:', e);
    }
  });
};

const RANDOM_LETTERS = ['A', 'B', 'C', 'D', 'E', 'K', 'M', 'S', 'T', 'Y', 'O', 'R', 'V'];

export const gameService = {
  // --- ODA YÖNETİMİ ---
  createRoom: async (hostName: string, avatar: string, settings: RoomSettings) => {
    if (isSupabaseConfigured) {
      try {
        await ensureAuth();

        const initialSettings = {
          ...settings,
          isHiddenMode: settings.isHiddenMode || false,
          categories: CATEGORIES
        };

        const { data, error } = await supabase.rpc('harfbaz_create_room_secure', {
          p_host_name: hostName,
          p_avatar: avatar,
          p_settings: initialSettings
        });

        if (!error && data?.room && data?.player) {
          const player = mapDbPlayer(data.player);
          const room = mapDbRoom(data.room, [player]);
          return { room, player };
        }
      } catch (err) {
        console.warn("Supabase createRoom çağrısı başarısız, yerel odaya geçiliyor:", err);
      }
    }

    // Yerel Fallback
    const hostPlayer: Player = {
      id: `p_${Date.now()}`,
      name: hostName || 'Gölge Savaşçı',
      avatar: avatar || 'samurai-1',
      isHost: true,
      score: 0,
      isReady: true,
      joinedAt: new Date().toISOString()
    };

    localStore.players = [hostPlayer];
    localStore.answers = {};
    localStore.votes = [];

    const roomObj = {
      id: `room_${Math.random().toString(36).substring(2, 9)}`,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      host_id: hostPlayer.id,
      status: 'LOBBY',
      settings: {
        ...settings,
        totalRounds: settings.totalRounds || 3,
        roundDuration: settings.roundDuration || 60,
        categories: CATEGORIES
      },
      current_letter: '',
      current_round: 1,
      current_game_id: `game_${Date.now()}`,
      voting_category_index: 0,
      revealed_players: [],
      round_start_time: null,
      is_public: true
    };

    localStore.room = roomObj;
    return {
      room: mapDbRoom(roomObj, localStore.players),
      player: hostPlayer
    };
  },

  joinRoom: async (roomCode: string, playerName: string, avatar: string) => {
    if (isSupabaseConfigured) {
      try {
        await ensureAuth();

        const { data, error } = await supabase.rpc('harfbaz_join_room_secure', {
          p_room_code: roomCode,
          p_player_name: playerName,
          p_avatar: avatar
        });

        if (!error && data?.room && data?.player) {
          const player = mapDbPlayer(data.player);
          const allPlayers = (data.players || []).map(mapDbPlayer);
          const room = mapDbRoom(data.room, allPlayers);
          return { room, player };
        }
      } catch (err) {
        console.warn("Supabase joinRoom başarısız, yerel katılıma geçiliyor:", err);
      }
    }

    // Yerel Fallback
    const newPlayer: Player = {
      id: `p_${Date.now()}`,
      name: playerName || 'Misafir Oyuncu',
      avatar: avatar || 'samurai-2',
      isHost: false,
      score: 0,
      isReady: true,
      joinedAt: new Date().toISOString()
    };

    if (!localStore.room) {
      // Mock oda kurup içine dahil et
      const host: Player = {
        id: 'host_default',
        name: 'Oda Kurucu',
        avatar: 'samurai-1',
        isHost: true,
        score: 0,
        isReady: true,
        joinedAt: new Date().toISOString()
      };
      localStore.players = [host, newPlayer];
      localStore.room = {
        id: `room_${roomCode.toLowerCase()}`,
        code: roomCode.toUpperCase(),
        host_id: host.id,
        status: 'LOBBY',
        settings: { totalRounds: 3, roundDuration: 60, categories: CATEGORIES },
        current_letter: '',
        current_round: 1,
        current_game_id: `game_${Date.now()}`,
        voting_category_index: 0,
        revealed_players: [],
        round_start_time: null,
        is_public: true
      };
    } else {
      localStore.players.push(newPlayer);
    }

    notifySubscribers('PLAYER_UPDATE');
    return {
      room: mapDbRoom(localStore.room, localStore.players),
      player: newPlayer
    };
  },

  joinRandomRoom: async (playerName: string, avatar: string) => {
    return gameService.joinRoom('ARENA1', playerName, avatar);
  },

  setRoomPublic: async (roomId: string, isPublic: boolean) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('set_room_public_secure', {
          p_room_id: roomId,
          p_is_public: isPublic
        });
        return;
      } catch (err) { /**/ }
    }
    if (localStore.room) {
      localStore.room.is_public = isPublic;
      notifySubscribers('ROOM_UPDATE', localStore.room);
    }
  },

  reconnect: async (roomId: string, playerId: string) => {
    if (isSupabaseConfigured) {
      try {
        await ensureAuth();
        const { data: roomData } = await supabase.from('harfbaz_rooms').select('*').eq('id', roomId).maybeSingle();
        if (roomData) {
          const { data: playerData } = await supabase.from('harfbaz_players').select('*').eq('id', playerId).maybeSingle();
          if (playerData) {
            const { data: allPlayers } = await supabase.from('harfbaz_players').select('*').eq('room_id', roomId);
            const players = (allPlayers || []).map(mapDbPlayer);
            return { room: mapDbRoom(roomData, players), player: mapDbPlayer(playerData) };
          }
        }
      } catch (err) { /**/ }
    }

    if (localStore.room) {
      const foundPlayer = localStore.players.find(p => p.id === playerId) || localStore.players[0];
      return { room: mapDbRoom(localStore.room, localStore.players), player: foundPlayer };
    }
    return null;
  },

  leaveRoom: async (playerId: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('harfbaz_players').delete().eq('id', playerId);
      } catch (err) { /**/ }
    }
    localStore.players = localStore.players.filter(p => p.id !== playerId);
    notifySubscribers('PLAYER_UPDATE');
  },

  kickPlayer: async (roomId: string, playerId: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('harfbaz_players').delete().eq('id', playerId);
        return;
      } catch (err) { /**/ }
    }
    localStore.players = localStore.players.filter(p => p.id !== playerId);
    notifySubscribers('PLAYER_UPDATE');
  },

  getPlayers: async (roomId: string): Promise<Player[]> => {
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('harfbaz_players').select('*').eq('room_id', roomId);
        if (data) return data.map(mapDbPlayer);
      } catch (err) { /**/ }
    }
    return localStore.players;
  },

  startGame: async (roomId: string) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('harfbaz_start_game_secure', { p_room_id: roomId });
        if (!error && data) return data as string;
      } catch (err) { /**/ }
    }

    if (localStore.room) {
      const letter = RANDOM_LETTERS[Math.floor(Math.random() * RANDOM_LETTERS.length)];
      localStore.room.current_letter = letter;
      localStore.room.status = 'PLAYING';
      localStore.room.round_start_time = new Date().toISOString();
      localStore.answers = {};
      localStore.votes = [];
      notifySubscribers('ROOM_UPDATE', localStore.room);
      return localStore.room.current_game_id;
    }
    return 'game_1';
  },

  nextRound: async (roomId: string) => {
    const letter = RANDOM_LETTERS[Math.floor(Math.random() * RANDOM_LETTERS.length)];
    if (isSupabaseConfigured) {
      try {
        const { data: currentRoom } = await supabase.from('harfbaz_rooms').select('current_round').eq('id', roomId).maybeSingle();
        const nextR = (currentRoom?.current_round || 1) + 1;
        await supabase.from('harfbaz_rooms').update({
          status: 'PLAYING',
          current_round: nextR,
          voting_category_index: 0,
          current_letter: letter,
          round_start_time: new Date().toISOString()
        }).eq('id', roomId);
        return;
      } catch (err) { /**/ }
    }

    if (localStore.room) {
      localStore.room.current_round += 1;
      localStore.room.voting_category_index = 0;
      localStore.answers = {};
      localStore.votes = [];
      localStore.room.current_letter = letter;
      localStore.room.status = 'PLAYING';
      localStore.room.round_start_time = new Date().toISOString();
      notifySubscribers('ROOM_UPDATE', localStore.room);
    }
  },

  revealCard: async (roomId: string, playerId: string) => {
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('harfbaz_rooms').select('revealed_players').eq('id', roomId).maybeSingle();
        const existing = (data?.revealed_players as string[]) || [];
        if (!existing.includes(playerId)) {
          await supabase.from('harfbaz_rooms').update({
            revealed_players: [...existing, playerId]
          }).eq('id', roomId);
        }
        return;
      } catch (err) { /**/ }
    }
    if (localStore.room) {
      if (!localStore.room.revealed_players) localStore.room.revealed_players = [];
      if (!localStore.room.revealed_players.includes(playerId)) {
        localStore.room.revealed_players.push(playerId);
        notifySubscribers('ROOM_UPDATE', localStore.room);
      }
    }
  },

  updateStatus: async (roomId: string, status: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('harfbaz_rooms').update({
          status,
          ...(status === 'VOTING' ? { voting_category_index: 0 } : {})
        }).eq('id', roomId);
        return;
      } catch (err) { /**/ }
    }

    if (localStore.room) {
      localStore.room.status = status;
      if (status === 'VOTING') {
        localStore.room.voting_category_index = 0;
      }
      notifySubscribers('ROOM_UPDATE', localStore.room);
    }
  },

  updateSettings: async (roomId: string, newSettings: RoomSettings) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('harfbaz_rooms').update({ settings: newSettings }).eq('id', roomId);
        return;
      } catch (err) { /**/ }
    }

    if (localStore.room) {
      localStore.room.settings = { ...localStore.room.settings, ...newSettings };
      notifySubscribers('ROOM_UPDATE', localStore.room);
    }
  },

  updateVotingIndex: async (roomId: string, index: number) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('harfbaz_rooms').update({ voting_category_index: index }).eq('id', roomId);
        return;
      } catch (err) { /**/ }
    }

    if (localStore.room) {
      localStore.room.voting_category_index = index;
      notifySubscribers('ROOM_UPDATE', localStore.room);
    }
  },

  resetGame: async (roomId: string) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('harfbaz_rooms').update({ status: 'WAITING', current_round: 1 }).eq('id', roomId);
        await supabase.from('harfbaz_players').update({ score: 0 }).eq('room_id', roomId);
        return;
      } catch (err) { /**/ }
    }

    if (localStore.room) {
      localStore.room.status = 'WAITING';
      localStore.room.current_round = 1;
      localStore.players.forEach(p => p.score = 0);
      notifySubscribers('ROOM_UPDATE', localStore.room);
    }
  },

  fillMissingAnswers: async (roomId: string, roundNumber: number, gameId: string) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.rpc('fill_missing_answers_secure', {
          p_room_id: roomId,
          p_round_number: roundNumber,
          p_game_id: gameId
        });
        if (!error) return;
      } catch (err) { /**/ }

      // Güvenli istemci taraflı yedek (RPC eksikse):
      try {
        const [playersRes, answersRes] = await Promise.all([
          supabase.from('harfbaz_players').select('id').eq('room_id', roomId),
          supabase.from('harfbaz_answers').select('player_id').eq('room_id', roomId).eq('round_number', roundNumber)
        ]);

        const allPids = (playersRes.data || []).map((p: any) => p.id);
        const answeredPids = new Set((answersRes.data || []).map((a: any) => a.player_id));
        const missingPids = allPids.filter(id => !answeredPids.has(id));

        for (const pid of missingPids) {
          await supabase.from('harfbaz_answers').insert([{
            room_id: roomId,
            player_id: pid,
            round_number: roundNumber,
            game_id: gameId,
            answers_json: {}
          }]);
        }
        return;
      } catch (e) {
        console.warn('Eksik cevap tamamlama hatası:', e);
      }
    }
  },

  submitAnswers: async (roomId: string, playerId: string, roundNumber: number, answers: Record<string, string>, gameId: string) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('harfbaz_answers').upsert({
          room_id: roomId,
          player_id: playerId,
          round_number: roundNumber,
          game_id: gameId,
          answers_json: answers
        }, {
          onConflict: 'room_id,player_id,round_number'
        });
        if (!error) return;
      } catch (err) { /**/ }
    }

    localStore.answers[playerId] = answers;
    notifySubscribers('ANSWERS_UPDATE');
  },

  checkAllAnswersSubmitted: async (roomId: string, roundNumber: number, playerCount: number, gameId: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const query = supabase
          .from('harfbaz_answers')
          .select('id', { count: 'exact', head: true })
          .eq('room_id', roomId)
          .eq('round_number', roundNumber);

        const { count, error } = await query;
        if (!error && count !== null) {
          return count >= playerCount;
        }
      } catch (err) { /**/ }
    }

    return Object.keys(localStore.answers).length >= playerCount;
  },

  getRoundAnswers: async (roomId: string, roundNumber: number, gameId: string): Promise<RoundAnswers> => {
    if (isSupabaseConfigured) {
      try {
        let retries = 3;
        let data: any[] | null = null;
        while (retries > 0) {
          const result = await supabase
            .from('harfbaz_answers')
            .select('player_id, answers_json')
            .eq('room_id', roomId)
            .eq('round_number', roundNumber);

          data = result.data;
          if (data && data.length > 0) break;
          retries--;
          if (retries > 0) await new Promise(r => setTimeout(r, 200));
        }

        if (data && data.length > 0) {
          const result: RoundAnswers = {};
          data.forEach((item: any) => { result[item.player_id] = item.answers_json || {}; });
          return result;
        }
      } catch (err) { /**/ }
    }

    return localStore.answers;
  },

  toggleVote: async (roomId: string, roundNumber: number, targetPlayerId: string, category: string) => {
    if (isSupabaseConfigured) {
      try {
        const voterId = await ensureAuth();
        const { data: existing } = await supabase.from('harfbaz_votes')
          .select('id')
          .eq('room_id', roomId)
          .eq('round_number', roundNumber)
          .eq('voter_id', voterId)
          .eq('target_player_id', targetPlayerId)
          .eq('category', category)
          .maybeSingle();

        if (existing) {
          await supabase.from('harfbaz_votes').delete().eq('id', existing.id);
        } else {
          await supabase.from('harfbaz_votes').insert([{
            room_id: roomId,
            round_number: roundNumber,
            voter_id: voterId,
            target_player_id: targetPlayerId,
            category
          }]);
        }
        return;
      } catch (err) { /**/ }
    }

    const idx = localStore.votes.findIndex(v => v.targetPlayerId === targetPlayerId && v.category === category);
    if (idx >= 0) {
      localStore.votes.splice(idx, 1);
    } else {
      localStore.votes.push({
        id: `v_${Date.now()}`,
        voterId: 'me',
        targetPlayerId,
        category,
        isVeto: true
      });
    }
    notifySubscribers('VOTES_UPDATE');
  },

  getVotes: async (roomId: string, roundNumber: number): Promise<Vote[]> => {
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('harfbaz_votes').select('id, voter_id, target_player_id, category, is_veto').eq('room_id', roomId).eq('round_number', roundNumber);
        if (data) {
          return data.map((v: any) => ({
            id: v.id,
            voterId: v.voter_id,
            targetPlayerId: v.target_player_id,
            category: v.category,
            isVeto: v.is_veto
          }));
        }
      } catch (err) { /**/ }
    }
    return localStore.votes;
  },

  calculateScores: async (roomId: string, roundNumber: number) => {
    if (isSupabaseConfigured) {
      try {
        const [playersRes, answersRes, votesRes] = await Promise.all([
          supabase.from('harfbaz_players').select('*').eq('room_id', roomId),
          supabase.from('harfbaz_answers').select('*').eq('room_id', roomId).eq('round_number', roundNumber),
          supabase.from('harfbaz_votes').select('*').eq('room_id', roomId).eq('round_number', roundNumber)
        ]);

        const dbPlayers = playersRes.data || [];
        const dbAnswers = answersRes.data || [];
        const dbVotes = votesRes.data || [];

        for (const p of dbPlayers) {
          const pAnsObj = (dbAnswers.find((a: any) => a.player_id === p.id)?.answers_json || {}) as Record<string, string>;
          let gain = 0;
          CATEGORIES.forEach(cat => {
            const val = pAnsObj[cat];
            const isVetoed = dbVotes.some((v: any) => v.target_player_id === p.id && v.category === cat);
            if (val && val.trim() && !isVetoed) gain += 10;
          });
          if (gain > 0) {
            await supabase.from('harfbaz_players').update({ score: (p.score || 0) + gain }).eq('id', p.id);
          }
        }
        await supabase.from('harfbaz_rooms').update({ status: 'SCORING' }).eq('id', roomId);
        return;
      } catch (err) { /**/ }
    }

    // Yerel Skor Hesaplama
    localStore.players.forEach(player => {
      const pAnswers = localStore.answers[player.id] || {};
      let roundGain = 0;
      CATEGORIES.forEach(catName => {
        const ans = pAnswers[catName];
        const isVetoed = localStore.votes.some(v => v.targetPlayerId === player.id && v.category === catName);
        if (ans && ans.trim() && !isVetoed) {
          roundGain += 10;
        }
      });
      player.score += roundGain;
    });

    if (localStore.room) {
      localStore.room.status = 'SCORING';
      notifySubscribers('ROOM_UPDATE', localStore.room);
    }
  },

  subscribeToRoom: (roomId: string, onUpdate: (payload: any) => void, onConnectionChange?: (status: 'connected' | 'disconnected' | 'reconnecting') => void) => {
    if (isSupabaseConfigured) {
      try {
        const channel = supabase.channel(`room:${roomId}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'harfbaz_rooms', filter: `id=eq.${roomId}` }, (payload) => onUpdate({ type: 'ROOM_UPDATE', data: payload.new }))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'harfbaz_players', filter: `room_id=eq.${roomId}` }, () => onUpdate({ type: 'PLAYER_UPDATE' }))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'harfbaz_votes', filter: `room_id=eq.${roomId}` }, (payload) => onUpdate({ type: 'VOTES_UPDATE', payload }))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'harfbaz_answers', filter: `room_id=eq.${roomId}` }, (payload) => onUpdate({ type: 'ANSWERS_UPDATE', payload }))
          .subscribe((status) => {
            if (onConnectionChange) {
              if (status === 'SUBSCRIBED') onConnectionChange('connected');
              else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') onConnectionChange('disconnected');
              else if (status === 'TIMED_OUT') onConnectionChange('reconnecting');
            }
          });

        return () => { supabase.removeChannel(channel); };
      } catch (e) {
        console.warn("Supabase realtime abonelik kurulamadı, yerel abonelik kullanılıyor:", e);
      }
    }

    localStore.listeners.push(onUpdate);
    if (onConnectionChange) {
      setTimeout(() => onConnectionChange('connected'), 100);
    }

    return () => {
      localStore.listeners = localStore.listeners.filter(cb => cb !== onUpdate);
    };
  },

  getLobbyStats: async (): Promise<{ roomCount: number; playerCount: number }> => {
    if (isSupabaseConfigured) {
      try {
        const [roomsRes, playersRes] = await Promise.all([
          supabase.from('harfbaz_rooms').select('id', { count: 'exact', head: true }).in('status', ['LOBBY', 'WAITING']),
          supabase.from('harfbaz_players').select('id', { count: 'exact', head: true }).gt('created_at', new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()),
        ]);
        return {
          roomCount: roomsRes.count ?? 12,
          playerCount: playersRes.count ?? 48,
        };
      } catch (err) { /**/ }
    }
    return {
      roomCount: 16,
      playerCount: 64,
    };
  },
};
