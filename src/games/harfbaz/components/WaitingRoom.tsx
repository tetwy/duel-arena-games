import React, { useState } from 'react';
import { Room, Player, RoomSettings } from '../types';
import { CATEGORIES } from '../constants';
import { PlayerAvatar, PROFILE_AVATARS } from './Avatar';
import { 
  Copy, 
  Check, 
  Clock, 
  RotateCcw, 
  Crown, 
  Play, 
  ArrowLeft, 
  Users, 
  X, 
  UserPlus, 
  Sparkles,
  Layers,
  ShieldAlert
} from 'lucide-react';

interface WaitingRoomProps {
  room: Room;
  currentPlayer: Player;
  onStart: () => void;
  onUpdateSettings: (settings: RoomSettings) => void;
  onLeave: () => void;
  onKick: (playerId: string) => void;
  onSetPublic: (isPublic: boolean) => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  currentPlayer,
  onStart,
  onUpdateSettings,
  onLeave,
  onKick,
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = currentPlayer.isHost;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSettingChange = (key: keyof RoomSettings, val: any) => {
    if (!isHost) return;
    onUpdateSettings({
      ...room.settings,
      [key]: val,
    });
  };

  const totalPlayers = room.players.length;
  const categoriesList = room.settings.categories?.length ? room.settings.categories : CATEGORIES;

  // En az 4 kutu göstermek için boş slot sayısı hesapla
  const minSlots = Math.max(4, Math.ceil((totalPlayers + 1) / 2) * 2);
  const emptySlotsCount = Math.max(0, minSlots - totalPlayers);

  return (
    <div className="relative min-h-dvh w-full bg-[#050811] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 box-border overflow-x-hidden select-none font-sans">
      
      {/* 1. ZEMİN */}
      <div className="absolute inset-0 z-0 bg-[#050811] pointer-events-none" />

      {/* 2. ÜST TELEMETRİ BARI */}
      <header className="relative z-20 shrink-0 flex items-center justify-between max-w-7xl w-full mx-auto pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-slate-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all active:translate-y-0.5 cursor-pointer group"
            title="Lobiden Ayrıl"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-rose-300" />
            <span>Ayrıl</span>
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                Harfbaz Bekleme Odası
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                {isHost ? 'Oda Kurucusu' : 'Katılımcı'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-normal mt-0.5">
              {totalPlayers} Savaşçı Bağlandı · {isHost ? 'Kuralları belirle ve düelloyu başlat' : 'Kurucunun düelloyu başlatması bekleniyor'}
            </span>
          </div>
        </div>

        {/* 1-Tık Oda Kodu Kapsülü */}
        <button
          onClick={copyCode}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0b101c] hover:bg-[#111728] border border-cyan-400/30 text-white transition-all cursor-pointer active:translate-y-0.5 group shadow-lg"
          title="Oda Kodunu Kopyala"
        >
          <span className="text-xs text-cyan-400 font-bold">ODA:</span>
          <span className="text-base sm:text-lg font-black tracking-widest font-mono text-white">{room.code}</span>
          <span className="w-6 h-6 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </span>
        </button>
      </header>

      {/* 3. ANA SAHNE: OYUNCU KADROSU & DÜELLO AYARLARI */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch justify-between gap-6 max-w-7xl w-full mx-auto py-6">
        
        {/* SOL: OYUNCU LİSTESİ & KATEGORİ ÖNİZLEMESİ */}
        <div className="flex-1 bg-[#0b101c] rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between relative min-h-[460px]">
          
          {/* Kadro Başlığı */}
          <div className="shrink-0 flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/25 flex items-center justify-center text-cyan-300">
                <Users size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white m-0 tracking-tight leading-none">
                  Savaşçı Kadrosu ({totalPlayers})
                </h3>
                <span className="text-xs text-slate-400 font-normal">
                  Tek başına pratik yapabilir veya arkadaşlarınla yarışabilirsin
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Lobi Hazır</span>
            </div>
          </div>

          {/* Oyuncu Kartları Izgarası */}
          <div className="flex-1 my-4 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[340px] pr-1">
            {room.players.map((p) => {
              const isMe = p.id === currentPlayer.id;
              const avatarDef = PROFILE_AVATARS.find(a => a.id === p.avatar) || PROFILE_AVATARS[0];

              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-xl flex items-center justify-between gap-3 border transition-all ${
                    isMe
                      ? 'bg-cyan-950/25 border-cyan-400/40 shadow-sm'
                      : 'bg-[#101524] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <PlayerAvatar avatar={p.avatar} size={48} showGlow={isMe} />
                      {p.isHost && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                          <Crown size={11} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white truncate">
                          {p.name}
                        </span>
                        {isMe && (
                          <span className="text-[11px] text-cyan-400 font-bold px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/40">
                            Sen
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 block truncate">
                        {avatarDef.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.isHost && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-400/20 text-xs font-semibold">
                        Kurucu
                      </span>
                    )}
                    {isHost && !p.isHost && (
                      <button
                        onClick={() => onKick(p.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center transition-colors cursor-pointer"
                        title="Odadan Çıkar"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Boş Bekleme Slotları */}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="p-3.5 rounded-xl border border-dashed border-white/10 bg-white/[0.01] flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center text-slate-500">
                  <UserPlus size={18} className="opacity-40" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-400">
                    Savaşçı Bekleniyor...
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Oda Kodunu Paylaş: <strong className="text-slate-300 font-mono">{room.code}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Kategori Önizleme Şeridi */}
          <div className="shrink-0 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-400" />
                <span>Düello Kategorileri ({categoriesList.length})</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-mono font-medium">Klasik Kural Seti</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categoriesList.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* SAĞ: ODA AYARLARI & BAŞLATMA KONSOLU */}
        <div className="w-full lg:w-[380px] shrink-0 bg-[#0b101c] rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between relative">
          
          <div className="shrink-0 mb-4 pb-3 border-b border-white/5">
            <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight leading-tight">
              Düello Ayarları
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isHost ? 'Yarış süresini ve toplam tur sayısını belirle.' : 'Kurucunun belirlediği oda kuralları.'}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-around gap-4 py-2">
            
            {/* Tur Sayısı */}
            <div className="p-3.5 rounded-xl bg-[#101524] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <RotateCcw size={14} className="text-cyan-400" />
                  <span>Toplam Tur</span>
                </span>
                <span className="text-xs font-bold text-cyan-300 tabular-nums">{room.settings.totalRounds || 5} Tur</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 5, 7, 10].map((r) => (
                  <button
                    key={r}
                    disabled={!isHost}
                    onClick={() => handleSettingChange('totalRounds', r)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      room.settings.totalRounds === r
                        ? 'bg-cyan-400 text-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    } ${!isHost ? 'cursor-default' : 'cursor-pointer active:translate-y-0.5'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Tur Süresi */}
            <div className="p-3.5 rounded-xl bg-[#101524] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Clock size={14} className="text-amber-400" />
                  <span>Tur Süresi</span>
                </span>
                <span className="text-xs font-bold text-amber-300 tabular-nums">{room.settings.roundDuration || 60} sn</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[45, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    disabled={!isHost}
                    onClick={() => handleSettingChange('roundDuration', sec)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      room.settings.roundDuration === sec
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    } ${!isHost ? 'cursor-default' : 'cursor-pointer active:translate-y-0.5'}`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Bilgilendirme Notu */}
            <div className="p-3 rounded-xl bg-[#13192a] border border-white/5 flex items-start gap-2.5">
              <Sparkles size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 m-0 leading-relaxed">
                Her turda çark rastgele bir Türk harfi seçer. 10 kutuyu ilk bitiren <strong className="text-cyan-300">STOP</strong> diyerek süreyi kilitler.
              </p>
            </div>

          </div>

          {/* Aksiyon Alanı */}
          <div className="shrink-0 pt-4 border-t border-white/5 mt-2">
            {isHost ? (
              <button
                onClick={onStart}
                className="w-full h-12 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black active:translate-y-0.5 cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                <span>Kelime Düellosunu Başlat</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#101524] border border-white/5 text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-xs text-slate-400 font-medium">
                  Kurucu düelloyu başlattığında otomatik oyuna geçilecek...
                </span>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* 4. ALT BİLGİ */}
      <footer className="relative z-20 shrink-0 flex items-center justify-between text-[11px] text-slate-500 px-2 max-w-7xl w-full mx-auto border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">HARFBAZ</span>
          <span>·</span>
          <span>BEKLEME LOBİSİ</span>
        </div>
        <span className="text-slate-500 font-mono">10 Kategori · Çark Sistemi</span>
      </footer>

    </div>
  );
};

export default WaitingRoom;
