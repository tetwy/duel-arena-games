-- ========================================================
-- HARFBAZ OYUNU (Online İsim-Şehir) - SUPABASE ŞEMASI
-- ========================================================

-- 1. Odalar Tablosu
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(6) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'LOBBY' NOT NULL, -- LOBBY, WAITING, PLAYING, VOTING, SCORING, GAME_OVER
    current_letter VARCHAR(4) DEFAULT 'A',
    current_round INT DEFAULT 1 NOT NULL,
    current_game_id TEXT,
    voting_category_index INT DEFAULT 0 NOT NULL,
    revealed_players JSONB DEFAULT '[]'::jsonb NOT NULL,
    round_start_time TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_public BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Oyuncular Tablosu
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    is_host BOOLEAN DEFAULT false NOT NULL,
    score INT DEFAULT 0 NOT NULL,
    is_ready BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cevaplar Tablosu
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    game_id TEXT,
    answers_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_room_player_round UNIQUE (room_id, player_id, round_number)
);

-- 4. Oylar Tablosu
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    voter_id UUID NOT NULL,
    target_player_id UUID NOT NULL,
    category TEXT NOT NULL,
    game_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Realtime Yayınlama
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- 6. RPC Fonksiyonları

-- Oda Oluşturma (create_room_secure)
CREATE OR REPLACE FUNCTION create_room_secure(
    p_host_name TEXT,
    p_avatar TEXT,
    p_settings JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_room_id UUID;
    v_room_code VARCHAR(6);
    v_player_id UUID := auth.uid();
    v_room JSONB;
    v_player JSONB;
    v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    v_i INT;
BEGIN
    -- 6 haneli rastgele kod üret
    v_room_code := '';
    FOR v_i IN 1..6 LOOP
        v_room_code := v_room_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;

    INSERT INTO public.rooms (code, status, settings)
    VALUES (v_room_code, 'LOBBY', p_settings)
    RETURNING id INTO v_room_id;

    INSERT INTO public.players (id, room_id, name, avatar, is_host)
    VALUES (v_player_id, v_room_id, p_host_name, p_avatar, true);

    SELECT to_jsonb(r) INTO v_room FROM public.rooms r WHERE r.id = v_room_id;
    SELECT to_jsonb(p) INTO v_player FROM public.players p WHERE p.id = v_player_id;

    RETURN jsonb_build_object('room', v_room, 'player', v_player);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Odaya Katılma (join_room_secure)
CREATE OR REPLACE FUNCTION join_room_secure(
    p_room_code VARCHAR,
    p_player_name TEXT,
    p_avatar TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_room_id UUID;
    v_player_id UUID := auth.uid();
    v_room JSONB;
    v_player JSONB;
    v_players JSONB;
BEGIN
    SELECT id INTO v_room_id FROM public.rooms WHERE code = p_room_code;
    IF v_room_id IS NULL THEN
        RAISE EXCEPTION 'Oda bulunamadı';
    END IF;

    INSERT INTO public.players (id, room_id, name, avatar, is_host)
    VALUES (v_player_id, v_room_id, p_player_name, p_avatar, false)
    ON CONFLICT (id) DO UPDATE SET
        room_id = v_room_id,
        name = p_player_name,
        avatar = p_avatar;

    SELECT to_jsonb(r) INTO v_room FROM public.rooms r WHERE r.id = v_room_id;
    SELECT to_jsonb(p) INTO v_player FROM public.players p WHERE p.id = v_player_id;
    SELECT jsonb_agg(to_jsonb(p)) INTO v_players FROM public.players p WHERE p.room_id = v_room_id;

    RETURN jsonb_build_object('room', v_room, 'player', v_player, 'players', v_players);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Oyunu Başlatma (start_game_secure)
CREATE OR REPLACE FUNCTION start_game_secure(p_room_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_game_id TEXT := gen_random_uuid()::text;
    v_letters TEXT[] := ARRAY['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','R','S','T','U','V','Y','Z'];
    v_letter TEXT := v_letters[floor(random() * array_length(v_letters, 1) + 1)];
BEGIN
    UPDATE public.rooms
    SET 
        status = 'PLAYING',
        current_game_id = v_game_id,
        current_round = 1,
        current_letter = v_letter,
        voting_category_index = 0,
        revealed_players = '[]'::jsonb,
        round_start_time = timezone('utc'::text, now())
    WHERE id = p_room_id;

    RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Durum Güncelleme
CREATE OR REPLACE FUNCTION update_room_status_secure(p_room_id UUID, p_status VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rooms SET status = p_status WHERE id = p_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Oyuncu Atma
CREATE OR REPLACE FUNCTION kick_player_secure(p_room_id UUID, p_target_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.players WHERE id = p_target_id AND room_id = p_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
