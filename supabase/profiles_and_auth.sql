-- ==============================================================================
-- 👤 KULLANICI PROFİLLERİ, ELO VE AUTH ENTEGRASYONU ŞEMASI
-- ==============================================================================

-- 1. Profiles Tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT DEFAULT '⚔️' NOT NULL,
    elo_rating INT DEFAULT 1200 NOT NULL,
    total_matches INT DEFAULT 0 NOT NULL,
    wins INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Etkinleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politikalar
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_elo ON public.profiles(elo_rating DESC);

-- 2. Yeni Kullanıcı Kaydolduğunda Otomatik Profil Oluşturma Tetikleyicisi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_username TEXT;
    v_base_username TEXT;
    v_count INT := 0;
BEGIN
    -- Kullanıcı adı metadata'dan veya e-posta başından üretilir
    v_base_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );
    
    -- Boşlukları temizle ve geçerli kıl
    v_base_username := regexp_replace(v_base_username, '[^a-zA-Z0-9_]', '', 'g');
    IF length(v_base_username) < 3 THEN
        v_base_username := 'Oyuncu_' || substr(md5(random()::text), 1, 4);
    END IF;

    v_username := v_base_username;

    -- Benzersiz kullanıcı adı sağlama döngüsü
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
        v_count := v_count + 1;
        v_username := v_base_username || '_' || v_count;
    END LOOP;

    INSERT INTO public.profiles (id, username, avatar, elo_rating, total_matches, wins)
    VALUES (
        NEW.id,
        v_username,
        COALESCE(NEW.raw_user_meta_data->>'avatar', '⚔️'),
        1200,
        0,
        0
    )
    ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$;

-- Tetikleyiciyi auth.users tablosuna bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Canlı Liderlik Görünümü
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
    id,
    username,
    avatar,
    elo_rating,
    total_matches,
    wins,
    RANK() OVER (ORDER BY elo_rating DESC, wins DESC) as rank
FROM public.profiles;

GRANT SELECT ON public.leaderboard_view TO anon, authenticated;
