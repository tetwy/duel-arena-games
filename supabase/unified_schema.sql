-- ==============================================================================
-- 🎮 ÇOKLU OYUN PLATFORMU - BİRLEŞİK & GÜVENLİ SUPABASE VERİTABANI ŞEMASI
-- Tek veritabanında VETO ve HARFBAZ oyunlarını tam güvenlik ve izolasyonla çalıştırır.
-- ==============================================================================

-- UUID uzantısını etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 🅰️ BÖLÜM 1: VETO (TABU) OYUNU
-- ==============================================================================

-- 1.1 VETO Kartlar Havuzu
CREATE TABLE IF NOT EXISTS public.veto_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL,
    taboo_words JSONB NOT NULL DEFAULT '[]'::jsonb,
    category TEXT DEFAULT 'Genel' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.2 VETO Odalar
CREATE TABLE IF NOT EXISTS public.veto_rooms (
    code VARCHAR(6) PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'LOBBY' NOT NULL, -- LOBBY, PLAYING, GAME_OVER
    target_score INT DEFAULT 50 NOT NULL,
    round_time INT DEFAULT 60 NOT NULL,
    pass_limit INT DEFAULT 3 NOT NULL,
    team_a_name TEXT DEFAULT 'A Takımı' NOT NULL,
    team_b_name TEXT DEFAULT 'B Takımı' NOT NULL,
    team_a_score INT DEFAULT 0 NOT NULL,
    team_b_score INT DEFAULT 0 NOT NULL,
    deck_order JSONB DEFAULT '[]'::jsonb NOT NULL,
    current_card_index INT DEFAULT 0 NOT NULL,
    pass_count INT DEFAULT 0 NOT NULL,
    active_team_index INT DEFAULT 0 NOT NULL, -- 0: A, 1: B
    narrator_index_a INT DEFAULT 0 NOT NULL,
    narrator_index_b INT DEFAULT 0 NOT NULL,
    turn_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.3 VETO Oyuncular
CREATE TABLE IF NOT EXISTS public.veto_players (
    id TEXT PRIMARY KEY,
    room_code VARCHAR(6) REFERENCES public.veto_rooms(code) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_host BOOLEAN DEFAULT false NOT NULL,
    team VARCHAR(1) DEFAULT 'A' NOT NULL, -- 'A' veya 'B'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- İndeksler (Hızlı sorgulama için)
CREATE INDEX IF NOT EXISTS idx_veto_players_room ON public.veto_players(room_code);
CREATE INDEX IF NOT EXISTS idx_veto_rooms_created ON public.veto_rooms(created_at);

-- 1.4 VETO RPC Güvenli Fonksiyonları
CREATE OR REPLACE FUNCTION veto_increment_card(p_room_code VARCHAR, p_amount INT DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE public.veto_rooms
    SET current_card_index = current_card_index + p_amount,
        updated_at = timezone('utc'::text, now())
    WHERE code = p_room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION veto_increment_score_a(p_room_code VARCHAR, p_amount INT DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE public.veto_rooms
    SET team_a_score = GREATEST(0, team_a_score + p_amount),
        current_card_index = current_card_index + 1,
        updated_at = timezone('utc'::text, now())
    WHERE code = p_room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION veto_increment_score_b(p_room_code VARCHAR, p_amount INT DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE public.veto_rooms
    SET team_b_score = GREATEST(0, team_b_score + p_amount),
        current_card_index = current_card_index + 1,
        updated_at = timezone('utc'::text, now())
    WHERE code = p_room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION veto_increment_pass(p_room_code VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE public.veto_rooms
    SET pass_count = pass_count + 1,
        current_card_index = current_card_index + 1,
        updated_at = timezone('utc'::text, now())
    WHERE code = p_room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION veto_start_next_turn_atomic(
    p_room_code VARCHAR,
    p_next_team VARCHAR,
    p_round_time INT,
    p_next_narrator_a INT DEFAULT NULL,
    p_next_narrator_b INT DEFAULT NULL,
    p_is_game_start BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.veto_rooms
    SET 
        status = 'PLAYING',
        active_team_index = CASE WHEN p_next_team = 'A' THEN 0 ELSE 1 END,
        pass_count = 0,
        round_time = p_round_time,
        turn_expires_at = timezone('utc'::text, now()) + (p_round_time || ' seconds')::interval,
        narrator_index_a = COALESCE(p_next_narrator_a, narrator_index_a),
        narrator_index_b = COALESCE(p_next_narrator_b, narrator_index_b),
        updated_at = timezone('utc'::text, now())
    WHERE code = p_room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Örnek VETO Kartları
INSERT INTO public.veto_cards (word, taboo_words, category) VALUES
('GÖZLÜK', '["Göz", "Görmek", "Çerçeve", "Cam", "Güneş"]'::jsonb, 'Nesne'),
('BİLGİSAYAR', '["Klavye", "Fare", "Ekran", "İnternet", "Oyun"]'::jsonb, 'Teknoloji'),
('DENİZ', '["Su", "Mavi", "Yüzmek", "Balık", "Sahil"]'::jsonb, 'Doğa'),
('KİTAP', '["Okumak", "Sayfa", "Yazar", "Roman", "Kütüphane"]'::jsonb, 'Kültür'),
('FUTBOL', '["Top", "Gol", "Hakem", "Maç", "Kale"]'::jsonb, 'Spor'),
('PİYANO', '["Tuş", "Müzik", "Çalmak", "Nota", "Enstrüman"]'::jsonb, 'Sanat'),
('KAHVE', '["Fincan", "Sıcak", "İçmek", "Kafein", "Türk"]'::jsonb, 'Yiyecek-İçecek'),
('TELEFON', '["Aramak", "Alo", "Mesaj", "Akıllı", "Konuşmak"]'::jsonb, 'Teknoloji'),
('UZAY', '["Gezegen", "Yıldız", "Astronot", "Roket", "Karanlık"]'::jsonb, 'Bilim'),
('PİKNİK', '["Sepet", "Çimen", "Örtü", "Mangal", "Ağaç"]'::jsonb, 'Aktivite')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 🅱️ BÖLÜM 2: HARFBAZ (ONLINE İSİM-ŞEHİR) OYUNU
-- ==============================================================================

-- 2.1 HARFBAZ Odalar
CREATE TABLE IF NOT EXISTS public.harfbaz_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(6) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'LOBBY' NOT NULL, -- LOBBY, WAITING, PLAYING, VOTING, SCORING, GAME_OVER
    current_letter VARCHAR(4) DEFAULT 'A',
    current_round INT DEFAULT 1 NOT NULL,
    current_game_id TEXT,
    voting_category_index INT DEFAULT 0 NOT NULL,
    revealed_players JSONB DEFAULT '[]'::jsonb NOT NULL,
    round_start_time TIMESTAMPTZ,
    settings JSONB DEFAULT '{"roundTime": 60, "totalRounds": 5}'::jsonb NOT NULL,
    is_public BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 HARFBAZ Oyuncular
CREATE TABLE IF NOT EXISTS public.harfbaz_players (
    id UUID PRIMARY KEY,
    room_id UUID REFERENCES public.harfbaz_rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🦊',
    is_host BOOLEAN DEFAULT false NOT NULL,
    score INT DEFAULT 0 NOT NULL,
    is_ready BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3 HARFBAZ Cevaplar
CREATE TABLE IF NOT EXISTS public.harfbaz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.harfbaz_rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.harfbaz_players(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    game_id TEXT,
    answers_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_harfbaz_answer UNIQUE (room_id, player_id, round_number)
);

-- 2.4 HARFBAZ Oylar
CREATE TABLE IF NOT EXISTS public.harfbaz_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.harfbaz_rooms(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    voter_id UUID NOT NULL,
    target_player_id UUID NOT NULL,
    category TEXT NOT NULL,
    game_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_harfbaz_players_room ON public.harfbaz_players(room_id);
CREATE INDEX IF NOT EXISTS idx_harfbaz_answers_lookup ON public.harfbaz_answers(room_id, round_number);
CREATE INDEX IF NOT EXISTS idx_harfbaz_votes_lookup ON public.harfbaz_votes(room_id, round_number);

-- 2.5 HARFBAZ Güvenli RPC Fonksiyonları
CREATE OR REPLACE FUNCTION harfbaz_create_room_secure(
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
    v_room_code := '';
    FOR v_i IN 1..6 LOOP
        v_room_code := v_room_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;

    INSERT INTO public.harfbaz_rooms (code, status, settings)
    VALUES (v_room_code, 'LOBBY', p_settings)
    RETURNING id INTO v_room_id;

    INSERT INTO public.harfbaz_players (id, room_id, name, avatar, is_host)
    VALUES (v_player_id, v_room_id, p_host_name, p_avatar, true);

    SELECT to_jsonb(r) INTO v_room FROM public.harfbaz_rooms r WHERE r.id = v_room_id;
    SELECT to_jsonb(p) INTO v_player FROM public.harfbaz_players p WHERE p.id = v_player_id;

    RETURN jsonb_build_object('room', v_room, 'player', v_player);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION harfbaz_join_room_secure(
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
    SELECT id INTO v_room_id FROM public.harfbaz_rooms WHERE code = p_room_code;
    IF v_room_id IS NULL THEN
        RAISE EXCEPTION 'Oda bulunamadı';
    END IF;

    INSERT INTO public.harfbaz_players (id, room_id, name, avatar, is_host)
    VALUES (v_player_id, v_room_id, p_player_name, p_avatar, false)
    ON CONFLICT (id) DO UPDATE SET
        room_id = v_room_id,
        name = p_player_name,
        avatar = p_avatar;

    SELECT to_jsonb(r) INTO v_room FROM public.harfbaz_rooms r WHERE r.id = v_room_id;
    SELECT to_jsonb(p) INTO v_player FROM public.harfbaz_players p WHERE p.id = v_player_id;
    SELECT jsonb_agg(to_jsonb(p)) INTO v_players FROM public.harfbaz_players p WHERE p.room_id = v_room_id;

    RETURN jsonb_build_object('room', v_room, 'player', v_player, 'players', v_players);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION harfbaz_start_game_secure(p_room_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_game_id TEXT := gen_random_uuid()::text;
    v_letters TEXT[] := ARRAY['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','R','S','T','U','V','Y','Z'];
    v_letter TEXT := v_letters[floor(random() * array_length(v_letters, 1) + 1)];
BEGIN
    UPDATE public.harfbaz_rooms
    SET 
        status = 'PLAYING',
        current_game_id = v_game_id,
        current_round = 1,
        current_letter = v_letter,
        voting_category_index = 0,
        revealed_players = '[]'::jsonb,
        round_start_time = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE id = p_room_id;

    RETURN v_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 📡 BÖLÜM 3: REALTIME SENKRONİZASYON YAYINLARI
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.veto_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.veto_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.harfbaz_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.harfbaz_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.harfbaz_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.harfbaz_votes;
