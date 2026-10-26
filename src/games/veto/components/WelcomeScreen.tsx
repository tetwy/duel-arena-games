import React, { useState } from 'react';
import { PlayerAvatar, PROFILE_AVATARS } from './Avatar';
import { Swords, Dices, ArrowLeft, HelpCircle, X, Hash, Loader2, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onCreateRoom: (playerName: string, avatar?: string) => void;
  onJoinRoom: (playerName: string, roomCode: string, avatar?: string) => Promise<boolean>;
  isJoining?: boolean;
  onBackToMenu?: () => void;
}

const RANDOM_NAMES = [
  'YasakAvcısı', 'GölgeHakimi', 'SözUstası', 'VetoRonini',
  'GizliKılıç', 'KelimeMuhafızı', 'SiberŞogun', 'HarfCelladı'
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateRoom, onJoinRoom, isJoining = false, onBackToMenu }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [showRules, setShowRules] = useState(false);
  
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem('veto_player_name') || 'YasakAvcısı';
    } catch {
      return 'YasakAvcısı';
    }
  });

  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem('veto_avatar') || 'mask';
    } catch {
      return 'mask';
    }
  });

  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const selectedProfile = PROFILE_AVATARS.find((p) => p.id === avatar) || PROFILE_AVATARS[2];

  const handleNameChange = (val: string) => {
    setName(val);
    setError('');
    try {
      localStorage.setItem('veto_player_name', val);
    } catch {}
  };

  const handleAvatarSelect = (avId: string) => {
    setAvatar(avId);
    try {
      localStorage.setItem('veto_avatar', avId);
    } catch {}
  };

  const handleRandomize = () => {
    const randomAv = PROFILE_AVATARS[Math.floor(Math.random() * PROFILE_AVATARS.length)];
    handleAvatarSelect(randomAv.id);
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    handleNameChange(randomName);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Lütfen bir oyuncu adı girin.');
      return;
    }
    onCreateRoom(name.trim(), avatar);
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Lütfen bir oyuncu adı girin.');
      return;
    }
    if (!roomCode.trim() || roomCode.length < 4) {
      setError('Geçerli bir 6 haneli oda kodu girin.');
      return;
    }
    const success = await onJoinRoom(name.trim(), roomCode.trim().toUpperCase(), avatar);
    if (!success) {
      setError('Oda bulunamadı veya kod hatalı!');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    if (activeTab === 'create') handleCreate();
    else handleJoin();
  };

  return (
    <div className="relative h-dvh max-h-dvh w-full bg-[#080206] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 box-border overflow-hidden select-none font-sans">
      
      {/* 1. SİNEMATİK ARKA PLAN SANATI */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/banners/veto-cover.jpg"
          alt="Veto Cover Art"
          className="w-full h-full object-cover object-center filter brightness-[0.4] saturate-[1.1] select-none"
        />
        <div className="absolute inset-0 bg-[#080206]/85" />
      </div>

      {/* 2. ÜST GEZİNTİ VE BAŞLIK BARI */}
      <header className="relative z-20 shrink-0 flex items-center justify-between max-w-6xl w-full mx-auto pb-2">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-colors active:translate-y-0.5 cursor-pointer"
              title="Arena Menüsüne Dön"
            >
              <ArrowLeft size={14} className="text-slate-300" />
              <span>Arena Menüsü</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center font-bold text-sm text-rose-300">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-wide text-white font-['Bebas_Neue',sans-serif] leading-none">
                  VETO
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-600/20 text-rose-300 border border-rose-500/30">
                  Yasaklı Söz Düellosu
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kurallar Butonu */}
        <button
          onClick={() => setShowRules(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors active:translate-y-0.5 cursor-pointer"
        >
          <HelpCircle size={14} className="text-rose-400" />
          <span>Nasıl Oynanır?</span>
        </button>
      </header>

      {/* 3. ANA SAHNE: KARAKTER KÜRSÜSÜ & DÜELLO EYLEM MASASI */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 max-w-6xl w-full mx-auto py-2">
        
        {/* SOL KANAT: SAVAŞÇI VE KARAKTER VİTRİNİ */}
        <section className="w-full lg:w-[480px] h-full max-h-[540px] flex flex-col justify-between bg-[#12070e] rounded-2xl p-6 border border-white/[0.08] relative">
          
          {/* Başlık ve Rastgele Buton */}
          <div className="shrink-0 flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight leading-none font-['Plus_Jakarta_Sans',sans-serif]">
                Savaşçı Profili
              </h2>
              <span className="text-xs text-slate-400 mt-1 block">
                Düelloda seni temsil edecek karakter ve kod adın
              </span>
            </div>
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer active:translate-y-0.5"
              title="Rastgele Karakter ve İsim"
            >
              <Dices size={14} className="text-rose-400" />
              <span>Rastgele</span>
            </button>
          </div>

          {/* Aktif Karakter Vitrini (Büyük Portre & Bilgi) */}
          <div className="flex-1 flex flex-col justify-center items-center py-4">
            <div className="relative mb-3">
              <PlayerAvatar
                avatar={selectedProfile.id}
                size={110}
                showGlow={false}
                className="ring-4 ring-rose-500/40 rounded-2xl"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold tracking-wider uppercase border border-rose-400">
                {selectedProfile.tag}
              </span>
            </div>
            <h3 className="text-lg font-black text-white m-0 tracking-tight mt-1">
              {selectedProfile.name}
            </h3>
            <p className="text-xs text-slate-400 m-0 mt-0.5">
              {selectedProfile.title}
            </p>
          </div>

          {/* Oyuncu Adı Giriş Kutusu */}
          <div className="shrink-0 p-3 rounded-xl bg-black/50 border border-white/10 mb-3">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Savaşçı Adın:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={20}
              placeholder="Oyuncu adını gir..."
              className="w-full box-border px-3.5 py-2.5 rounded-lg bg-[#180a13] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-rose-400 transition-colors"
            />
          </div>

          {/* 8'li Karakter Seçim Galerisi */}
          <div className="shrink-0 pt-2 border-t border-white/[0.06]">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Karakter Seçimi:
            </span>
            <div className="grid grid-cols-8 gap-2">
              {PROFILE_AVATARS.map((p) => {
                const isSelected = p.id === avatar;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAvatarSelect(p.id)}
                    className={`p-1 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-400'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                    title={`${p.name} · ${p.title}`}
                  >
                    <PlayerAvatar avatar={p.id} size={32} />
                  </button>
                );
              })}
            </div>
          </div>

        </section>

        {/* SAĞ KANAT: DÜELLO EYLEM MASASI (ODA KUR / KATIL) */}
        <section className="w-full lg:w-[480px] h-full max-h-[540px] flex flex-col justify-between bg-[#12070e] rounded-2xl p-6 border border-white/[0.08] relative">
          
          {/* Üst Sekme Başlığı */}
          <div className="shrink-0 pb-3 border-b border-white/[0.06]">
            <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight leading-none font-['Plus_Jakarta_Sans',sans-serif]">
              Düello Masası
            </h2>
            <span className="text-xs text-slate-400 mt-1 block">
              Arkadaşlarınla özel oda kur veya paylaşılan koda katıl
            </span>
          </div>

          {/* Mod Seçim Sekmesi */}
          <div className="shrink-0 my-3">
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => { setActiveTab('create'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Oda Kur
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('join'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'join'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Koda Katıl
              </button>
            </div>
          </div>

          {/* Dinamik Eylem İçeriği */}
          <div className="flex-1 flex flex-col justify-center">
            {activeTab === 'create' && (
              <div className="flex flex-col gap-4">
                {/* Ayar Önizleme Kartları */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Hedef Puan</span>
                    <span className="text-base font-black text-amber-300">50 Puan</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Tur Süresi</span>
                    <span className="text-base font-black text-rose-300">60 Saniye</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Pas Hakkı</span>
                    <span className="text-base font-black text-slate-200">3 Hak</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 m-0 leading-relaxed text-center">
                  Takımlar ve ince ayarlar lobi kurulduktan sonra özelleştirilebilir.
                </p>

                <button
                  onClick={handleCreate}
                  disabled={isJoining || !name.trim()}
                  className={`w-full h-13 rounded-xl font-bold text-sm tracking-normal transition-colors flex items-center justify-center gap-2.5 cursor-pointer border ${
                    name.trim() && !isJoining
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 active:translate-y-0.5'
                      : 'bg-white/10 text-slate-500 border-transparent cursor-not-allowed'
                  }`}
                >
                  {isJoining ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Swords size={18} />
                      <span>Düello Odası Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'join' && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-slate-400 m-0 leading-relaxed text-center">
                  Oda kurucusundan aldığın 6 haneli kodu girerek düelloya dahil ol.
                </p>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => {
                        setRoomCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      onKeyDown={handleKeyDown}
                      maxLength={6}
                      placeholder="6 HANELİ KOD"
                      className="w-full box-border pl-10 pr-3 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-sm font-semibold tracking-widest uppercase focus:outline-none focus:border-rose-400 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={isJoining || !name.trim() || !roomCode.trim()}
                    className={`h-12 px-6 rounded-xl font-bold text-xs cursor-pointer transition-colors border ${
                      name.trim() && roomCode.trim() && !isJoining
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 active:translate-y-0.5'
                        : 'bg-white/10 text-slate-500 border-transparent cursor-not-allowed'
                    }`}
                  >
                    Katıl
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hata Bildirimi */}
          {error && (
            <div className="shrink-0 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}

          {/* Alt Özet Bilgi */}
          <div className="shrink-0 pt-3 border-t border-white/[0.06] text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Kurallar: İhlalde Rakip VETO Eder (-1), Doğru Tahminde (+1)
            </span>
          </div>

        </section>

      </main>

      {/* 4. ALT ÇUBUK */}
      <footer className="relative z-20 shrink-0 flex items-center justify-between text-xs text-slate-500 max-w-6xl w-full mx-auto px-2 select-none">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Arena</span>
          <span>·</span>
          <span>Veto</span>
        </div>
        <span className="text-[11px] text-slate-500">
          5 Yasaklı Söz · Tabu & Kelime Düellosu
        </span>
      </footer>

      {/* 5. NASIL OYNANIR MODALI */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-[#12070e] rounded-2xl border border-white/10 p-6 flex flex-col gap-4 relative">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-lg font-black text-white m-0">Nasıl Oynanır?</h3>
              <button
                onClick={() => setShowRules(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
                <span className="w-6 h-6 rounded-md bg-rose-600/20 text-rose-300 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="text-xs font-bold text-white m-0">Kart Açılır, 5 Yasak Kilitlenir</h4>
                  <p className="text-xs text-slate-400 m-0 mt-1">Hedef kelimeyi anlatırken altındaki 5 yasaklı kelimeyi asla kullanamazsın.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="text-xs font-bold text-white m-0">Hikaye ve Benzetmeyle Anlat</h4>
                  <p className="text-xs text-slate-400 m-0 mt-1">Doğrudan tanımdan kaçın. Günlük hikayeler ve benzetmelerle takımına buldur.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="text-xs font-bold text-white m-0">Veto Kılıcı & Doğru Puan</h4>
                  <p className="text-xs text-slate-400 m-0 mt-1">Rakip gözlemci kural ihlali yakalarsa VETO basar (-1). Doğru tahminde takımın +1 puan kazanır.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Anladım, Düelloya Hazırım
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default WelcomeScreen;
