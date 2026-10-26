-- ==============================================================================
-- 🛡️ SUPABASE GÜVENLİK VE RLS İYİLEŞTİRME SQL SKRİPTİ
-- Tüm Security Advisor (Linter) uyarılarını çözer ve RLS izinlerini yapılandırır.
-- ==============================================================================

-- 1. rls_auto_enable() Fonksiyonunu Güvene Al
-- (Anon ve Authenticated rollerinden REST API üzerinden çalıştırılma yetkisini kaldırır)
ALTER FUNCTION public.rls_auto_enable() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- ==============================================================================
-- 2. VETO OYUNU RLS POLİTİKALARI (Oyun odaları ve oyuncuların etkileşimi için)
-- ==============================================================================
ALTER TABLE public.veto_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view veto cards" ON public.veto_cards;
CREATE POLICY "Public can view veto cards" ON public.veto_cards
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.veto_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can manage veto rooms" ON public.veto_rooms;
CREATE POLICY "Public can manage veto rooms" ON public.veto_rooms
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.veto_players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can manage veto players" ON public.veto_players;
CREATE POLICY "Public can manage veto players" ON public.veto_players
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 3. HARFBAZ OYUNU RLS POLİTİKALARI
-- ==============================================================================
ALTER TABLE public.harfbaz_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can manage harfbaz rooms" ON public.harfbaz_rooms;
CREATE POLICY "Public can manage harfbaz rooms" ON public.harfbaz_rooms
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.harfbaz_players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can manage harfbaz players" ON public.harfbaz_players;
CREATE POLICY "Public can manage harfbaz players" ON public.harfbaz_players
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.harfbaz_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can manage harfbaz answers" ON public.harfbaz_answers;
CREATE POLICY "Public can manage harfbaz answers" ON public.harfbaz_answers
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.harfbaz_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can manage harfbaz votes" ON public.harfbaz_votes;
CREATE POLICY "Public can manage harfbaz votes" ON public.harfbaz_votes
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. VETO RPC FONKSİYONLARI (SECURITY INVOKER + search_path = public)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.veto_increment_card(p_room_code VARCHAR, p_amount INT DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    UPDATE public.veto_rooms
    SET current_card_index = current_card_index + p_amount,
        updated_at = timezone('utc'::text, now())
    WHERE code = p_room_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.veto_increment_score_a(p_room_code VARCHAR, p_amount INT DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    UPDATE public.veto_rooms
    SET team_a_score = GREATEST(0, team_a_score + p_amount),
        current_card_index = current_card_index + 1,
        updated_at = timezone('utc'::text, now())
    WHERE code = p_room_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.veto_increment_score_b(p_room_code VARCHAR, p_amount INT DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    UPDATE public.veto_rooms
    SET team_b_score = GREATEST(0, team_b_score + p_amount),
        current_card_index = current_card_index + 1,
        updated_at = timezone('utc'::text, now())
    WHERE code = p_room_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.veto_increment_pass(p_room_code VARCHAR)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    UPDATE public.veto_rooms
    SET pass_count = pass_count + 1,
        current_card_index = current_card_index + 1,
        updated_at = timezone('utc'::text, now())
    WHERE code = p_room_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.veto_start_next_turn_atomic(
    p_room_code VARCHAR,
    p_next_team VARCHAR,
    p_round_time INT,
    p_next_narrator_a INT DEFAULT NULL,
    p_next_narrator_b INT DEFAULT NULL,
    p_is_game_start BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
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
$$;

-- ==============================================================================
-- 5. HARFBAZ RPC FONKSİYONLARI (SECURITY INVOKER + search_path = public)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.harfbaz_create_room_secure(
    p_host_name TEXT,
    p_avatar TEXT,
    p_settings JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_room_id UUID;
    v_room_code VARCHAR(6);
    v_player_id UUID := gen_random_uuid();
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
$$;

CREATE OR REPLACE FUNCTION public.harfbaz_join_room_secure(
    p_room_code VARCHAR,
    p_player_name TEXT,
    p_avatar TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_room_id UUID;
    v_player_id UUID := gen_random_uuid();
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
$$;

CREATE OR REPLACE FUNCTION public.harfbaz_start_game_secure(p_room_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
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
$$;

-- Yetkilendirme
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
