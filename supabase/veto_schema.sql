-- ========================================================
-- VETO OYUNU (Tabu) - SUPABASE VERİTABANI VE RPC ŞEMASI
-- ========================================================

-- 1. Kartlar Tablosu (Hedef kelime ve yasaklı kelimeler)
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL,
    taboo_words JSONB NOT NULL DEFAULT '[]'::jsonb,
    category TEXT DEFAULT 'Genel',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Odalar Tablosu
CREATE TABLE IF NOT EXISTS public.rooms (
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
    active_team_index INT DEFAULT 0 NOT NULL, -- 0: A Takımı, 1: B Takımı
    narrator_index_a INT DEFAULT 0 NOT NULL,
    narrator_index_b INT DEFAULT 0 NOT NULL,
    turn_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Oyuncular Tablosu
CREATE TABLE IF NOT EXISTS public.players (
    id TEXT PRIMARY KEY,
    room_code VARCHAR(6) REFERENCES public.rooms(code) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_host BOOLEAN DEFAULT false NOT NULL,
    team VARCHAR(1) DEFAULT 'A' NOT NULL, -- 'A' veya 'B'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Realtime Etkinleştirme
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;

-- 5. RPC Fonksiyonları

-- Kart İndeksini İlerletme
CREATE OR REPLACE FUNCTION increment_card_index(room_code VARCHAR, amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rooms
    SET current_card_index = current_card_index + amount
    WHERE code = room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- A Takımı Skor Artırma
CREATE OR REPLACE FUNCTION increment_score_a(room_code VARCHAR, amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rooms
    SET team_a_score = GREATEST(0, team_a_score + amount)
    WHERE code = room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B Takımı Skor Artırma
CREATE OR REPLACE FUNCTION increment_score_b(room_code VARCHAR, amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rooms
    SET team_b_score = GREATEST(0, team_b_score + amount)
    WHERE code = room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pas Sayısını Artırma
CREATE OR REPLACE FUNCTION increment_pass(room_code VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rooms
    SET pass_count = pass_count + 1
    WHERE code = room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomik Tur Başlatma
CREATE OR REPLACE FUNCTION start_next_turn_atomic(
    p_room_code VARCHAR,
    p_next_team VARCHAR,
    p_round_time INT,
    p_next_narrator_a INT DEFAULT NULL,
    p_next_narrator_b INT DEFAULT NULL,
    p_is_game_start BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rooms
    SET 
        status = 'PLAYING',
        active_team_index = CASE WHEN p_next_team = 'A' THEN 0 ELSE 1 END,
        pass_count = 0,
        round_time = p_round_time,
        turn_expires_at = timezone('utc'::text, now()) + (p_round_time || ' seconds')::interval,
        narrator_index_a = COALESCE(p_next_narrator_a, narrator_index_a),
        narrator_index_b = COALESCE(p_next_narrator_b, narrator_index_b)
    WHERE code = p_room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Örnek Başlangıç Kartları (Tabu Kelimeleri)
INSERT INTO public.cards (word, taboo_words, category) VALUES
('GÖZLÜK', '["Göz", "Görmek", "Çerçeve", "Cam", "Güneş"]'::jsonb, 'Nesne'),
('BİLGİSAYAR', '["Klavye", "Fare", "Ekran", "İnternet", "Oyun"]'::jsonb, 'Teknoloji'),
('DENİZ', '["Su", "Mavi", "Yüzmek", "Balık", "Sahil"]'::jsonb, 'Doğa'),
('KİTAP', '["Okumak", "Sayfa", "Yazar", "Roman", "Kütüphane"]'::jsonb, 'Kültür'),
('FUTBOL', '["Top", "Gol", "Hakem", "Maç", "Kale"]'::jsonb, 'Spor'),
('PİYANO', '["Tuş", "Müzik", "Çalmak", "Nota", "Enstrüman"]'::jsonb, 'Sanat'),
('KAHVE', '["Fincan", "Sıcak", "İçmek", "Kafein", "Türk"]'::jsonb, 'Yiyecek-İçecek'),
('TELEFON', '["Aramak", "Alo", "Mesaj", "Akıllı", "Konuşmak"]'::jsonb, 'Teknoloji')
ON CONFLICT DO NOTHING;
