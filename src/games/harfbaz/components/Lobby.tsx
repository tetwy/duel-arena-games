import React, { useState } from 'react';
import { CATEGORIES, DEFAULT_SETTINGS } from '../constants';
import { gameService } from '../services/gameService';
import { Player, Room } from '../types';
import { PROFILE_AVATARS, PlayerAvatar } from './Avatar';
import { Swords, Zap, Dices, ArrowLeft, HelpCircle, X, Hash, Loader2 } from 'lucide-react';

interface LobbyProps {
  onJoin: (room: Room, player: Player) => void;
  onBackToMenu?: () => void;
}

const RANDOM_NAMES = [
  'KelimeRonini', 'HızlıKoşucu', 'SözAvcısı', 'GölgeŞair', 'HarfbazMaster',
  'DilFırtınası', 'SözKılıcı', 'HarfKralı', 'AlfabeŞampiyonu', 'KinetikBeyin',
  'SözMuhafızı', 'NeonKâtip', 'HızlıKalem', 'DilUstası', 'HarfŞogunu'
];

export const Lobby: React.FC<LobbyProps> = ({ onJoin, onBackToMenu }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'quick' | 'join'>('create');
  const [showRules, setShowRules] = useState(false);
  
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem('harfbaz_player_name') || 'KelimeRonini';
    } catch {
      return 'KelimeRonini';
    }
  });

  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem('harfbaz_avatar') || PROFILE_AVATARS[0].id;
    } catch {
      return PROFILE_AVATARS[0].id;
    }
  });

  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedProfile = PROFILE_AVATARS.find((p) => p.id === avatar) || PROFILE_AVATARS[0];

  const handleNameChange = (val: string) => {
    setName(val);
    setError('');
    try {
      localStorage.setItem('harfbaz_player_name', val);
    } catch {}
  };

  const handleAvatarSelect = (avId: string) => {
    setAvatar(avId);
    try {
      localStorage.setItem('harfbaz_avatar', avId);
    } catch {}
  };

  const handleRandomize = () => {
    const randomAvatar = PROFILE_AVATARS[Math.floor(Math.random() * PROFILE_AVATARS.length)];
    handleAvatarSelect(randomAvatar.id);
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    handleNameChange(randomName);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Lütfen bir oyuncu adı girin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { room, player } = await gameService.createRoom(name.trim(), avatar, DEFAULT_SETTINGS);
      onJoin(room, player);
    } catch (e) {
      setError('Oda oluşturulamadı. Lütfen tekrar deneyin.');
      console.error(e);
    } finally {
      setLoading(false);
    }
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
    setLoading(true);
    setError('');
    try {
      const { room, player } = await gameService.joinRoom(roomCode.trim().toUpperCase(), name.trim(), avatar);
      onJoin(room, player);
    } catch {
      setError('Odaya katılamadı. Kod hatalı veya oda dolu olabilir.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickJoin = async () => {
    if (!name.trim()) {
      setError('Lütfen bir oyuncu adı girin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { room, player } = await gameService.joinRandomRoom(name.trim(), avatar);
      onJoin(room, player);
    } catch (e: any) {
      setError(e?.message || 'Aktif oda bulunamadı. Yeni bir oda kurabilirsiniz!');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    if (activeTab === 'create') handleCreate();
    else if (activeTab === 'quick') handleQuickJoin();
    else handleJoin();
  };

  return (
    <div className="relative h-dvh max-h-dvh w-full bg-[#04070e] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 box-border overflow-hidden select-none font-sans">
      
      {/* 1. SİNEMATİK ARKA PLAN */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/banners/harfbaz-cover.jpg"
          alt="Harfbaz Cover Art"
          className="w-full h-full object-cover object-center filter brightness-[0.4] saturate-[1.1] select-none"
        />
        <div className="absolute inset-0 bg-[#04070e]/85" />
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
            <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center font-bold text-sm text-cyan-300">
              H
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                  Harfbaz
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                  Söz Düellosu
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
          <HelpCircle size={14} className="text-cyan-400" />
          <span>Nasıl Oynanır?</span>
        </button>
      </header>

      {/* 3. ANA SAHNE: SAVAŞÇI KÜRSÜSÜ & EYLEM MASASI */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 max-w-6xl w-full mx-auto py-2">
        
        {/* SOL KANAT: SAVAŞÇI PROFİLİ VE KARAKTER VİTRİNİ */}
        <section className="w-full lg:w-[480px] h-full max-h-[540px] flex flex-col justify-between bg-[#0b0e17] rounded-2xl p-6 border border-white/10 relative">
          
          {/* Başlık ve Rastgele Buton */}
          <div className="shrink-0 flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight leading-none">
                Söz Savaşçısı
              </h2>
              <span className="text-xs text-slate-400 mt-1 block">
                Harf yarışında seni temsil edecek karakter ve adın
              </span>
            </div>
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer active:translate-y-0.5"
              title="Rastgele Karakter ve İsim"
            >
              <Dices size={14} className="text-cyan-400" />
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
                className="ring-4 ring-cyan-400/40 rounded-2xl"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-cyan-400 text-black text-[10px] font-black tracking-wider uppercase border border-cyan-300">
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
              className="w-full box-border px-3.5 py-2.5 rounded-lg bg-[#070910] border border-white/10 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-cyan-400 transition-colors"
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
                        ? 'bg-cyan-400/20 border-cyan-400 ring-2 ring-cyan-400'
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

        {/* SAĞ KANAT: HARFBAZ EYLEM MASASI (ODA KUR / HIZLI / KOD) */}
        <section className="w-full lg:w-[480px] h-full max-h-[540px] flex flex-col justify-between bg-[#0b0e17] rounded-2xl p-6 border border-white/10 relative">
          
          {/* Üst Sekme Başlığı */}
          <div className="shrink-0 pb-3 border-b border-white/[0.06]">
            <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight leading-none">
              Düello Masası
            </h2>
            <span className="text-xs text-slate-400 mt-1 block">
              Yeni oda kur, hızlı maç bul veya 6 haneli kodla katıl
            </span>
          </div>

          {/* Mod Seçim Sekmesi */}
          <div className="shrink-0 my-3">
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => { setActiveTab('create'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-cyan-400 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Oda Kur
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('quick'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'quick'
                    ? 'bg-cyan-400 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hızlı Oyna
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('join'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'join'
                    ? 'bg-cyan-400 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kodu Gir
              </button>
            </div>
          </div>

          {/* Dinamik Eylem İçeriği */}
          <div className="flex-1 flex flex-col justify-center">
            {activeTab === 'create' && (
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold text-slate-400 text-center block">
                  10 Söz Kategorisi:
                </span>
                
                {/* 10 Kategori Rozetleri */}
                <div className="grid grid-cols-5 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <div 
                      key={cat} 
                      className="px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center text-[10px] font-semibold text-slate-300 truncate"
                    >
                      {cat}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 m-0 leading-relaxed text-center mt-1">
                  Özel lobi kurularak arkadaşların davet edilir. Tur ve süre ayarları bekleme lobisinde değiştirilebilir.
                </p>

                <button
                  onClick={handleCreate}
                  disabled={loading || !name.trim()}
                  className={`w-full h-13 rounded-xl font-bold text-sm tracking-normal transition-colors flex items-center justify-center gap-2.5 cursor-pointer border ${
                    name.trim() && !loading
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-black border-cyan-300 active:translate-y-0.5'
                      : 'bg-white/10 text-slate-500 border-transparent cursor-not-allowed'
                  }`}
                >
                  {loading ? (
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

            {activeTab === 'quick' && (
              <div className="flex flex-col gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mx-auto">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white m-0">Hızlı Eşleşme</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    Oyuncu bekleyen en uygun odaya bağlanır. Açık oda yoksa senin için anında yeni bir oda açılır.
                  </p>
                </div>
                <button
                  onClick={handleQuickJoin}
                  disabled={loading || !name.trim()}
                  className={`w-full h-13 rounded-xl font-bold text-sm tracking-normal transition-colors flex items-center justify-center gap-2 cursor-pointer border ${
                    name.trim() && !loading
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-black border-cyan-300 active:translate-y-0.5'
                      : 'bg-white/10 text-slate-500 border-transparent cursor-not-allowed'
                  }`}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Hemen Eşleş</span>}
                </button>
              </div>
            )}

            {activeTab === 'join' && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-slate-400 m-0 leading-relaxed text-center">
                  Arkadaşının kurduğu odanın 6 haneli kodunu girerek lobiye katıl.
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
                      className="w-full box-border pl-10 pr-3 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-sm font-semibold tracking-widest uppercase focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={loading || !name.trim() || !roomCode.trim()}
                    className={`h-12 px-6 rounded-xl font-bold text-xs cursor-pointer transition-colors border ${
                      name.trim() && roomCode.trim() && !loading
                        ? 'bg-cyan-400 hover:bg-cyan-300 text-black border-cyan-300 active:translate-y-0.5'
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
              10 Kategori · Çekilen Harfle Kelimeleri Yaz · STOP ile Kilitle
            </span>
          </div>

        </section>

      </main>

      {/* 4. ALT ÇUBUK */}
      <footer className="relative z-20 shrink-0 flex items-center justify-between text-xs text-slate-500 max-w-6xl w-full mx-auto px-2 select-none">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Arena</span>
          <span>·</span>
          <span>Harfbaz</span>
        </div>
        <span className="text-[11px] text-slate-500">
          Zamana Karşı Kelime Düellosu
        </span>
      </footer>

      {/* 5. NASIL OYNANIR MODALI */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-[#0b0e17] rounded-2xl border border-white/10 p-6 flex flex-col gap-4 relative">
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
                <span className="w-6 h-6 rounded-md bg-cyan-400/20 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="text-xs font-bold text-white m-0">Harf Çekilir, Sayaç Başlar</h4>
                  <p className="text-xs text-slate-400 m-0 mt-1">Rastgele bir Türk harfi seçilir ve 60 saniyelik geri sayım başlar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="text-xs font-bold text-white m-0">10 Kutuyu Doldur, STOP De</h4>
                  <p className="text-xs text-slate-400 m-0 mt-1">İsimden şehre 10 kategoriyi o harfle doldur. Hepsini bitiren STOP diyerek süreyi kilitler.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02]">
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="text-xs font-bold text-white m-0">Oylama & Özgün Kelimeler (+10)</h4>
                  <p className="text-xs text-slate-400 m-0 mt-1">Yalnızca sende olan özgün kelimeler +10 puan, başkasıyla aynı cevaplar +5 puan kazandırır.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="w-full h-10 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition-colors cursor-pointer"
            >
              Anladım, Düelloya Hazırım
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Lobby;
