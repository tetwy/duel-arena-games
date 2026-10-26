import React, { useState } from 'react';
import { Team, GameSettings, Player } from '../types';
import { PlayerAvatar, PROFILE_AVATARS } from './Avatar';
import { 
  Copy, 
  Check, 
  Clock, 
  Award, 
  Ban, 
  Crown, 
  Play, 
  ArrowLeft, 
  Users, 
  Gamepad2, 
  Sparkles, 
  Shield,
  Swords,
  UserPlus
} from 'lucide-react';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

interface LobbyScreenProps {
  roomCode: string;
  teams: Team[];
  currentUser: Player;
  settings: GameSettings;
  onStartGame: () => void;
  onSwitchTeam: (teamId: 'A' | 'B') => void;
  onLeave: () => void;
  onUpdateSettings?: (newSettings: GameSettings) => void;
  onAddBot?: (teamId: 'A' | 'B') => void;
  isHost: boolean;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ 
  roomCode, teams, currentUser, settings, 
  onStartGame, onSwitchTeam, onLeave, onUpdateSettings, onAddBot, isHost 
}) => {
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (key: keyof GameSettings, value: number) => {
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, [key]: value });
    }
  };

  const totalPlayers = teams.reduce((acc, t) => acc + t.players.length, 0);

  return (
    <div className="relative min-h-dvh w-full bg-[#08020a] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 box-border overflow-x-hidden select-none font-sans">
      
      {/* 1. ZEMİN */}
      <div className="absolute inset-0 z-0 bg-[#08020a] pointer-events-none" />

      {/* 2. ÜST TELEMETRİ BARI */}
      <header className="relative z-20 shrink-0 flex items-center justify-between max-w-7xl w-full mx-auto pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-slate-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all active:translate-y-0.5 cursor-pointer group"
            title="Lobiden Ayrıl"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-rose-300" />
            <span>Ayrıl</span>
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                Veto Bekleme Odası
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/40">
                {isHost ? 'Oda Kurucusu' : 'Katılımcı'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-normal mt-0.5">
              {totalPlayers} Savaşçı Lobide · {isHost ? 'Takımları dengele ve düelloyu başlat' : 'Kurucunun oyunu başlatması bekleniyor'}
            </span>
          </div>
        </div>

        {/* 1-Tık Oda Kodu Kapsülü */}
        <button
          onClick={copyCode}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#12070e] hover:bg-[#1a0c16] border border-rose-500/30 text-white transition-all cursor-pointer active:translate-y-0.5 group shadow-lg"
          title="Oda Kodunu Kopyala"
        >
          <span className="text-xs text-rose-300 font-bold">ODA:</span>
          <span className="text-base sm:text-lg font-black tracking-widest font-mono text-white">{roomCode}</span>
          <span className="w-6 h-6 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </span>
        </button>
      </header>

      {/* 3. ANA SAHNE: TAKIMLAR & ODA AYARLARI */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch justify-between gap-6 max-w-7xl w-full mx-auto py-6">
        
        {/* SOL: 2 TAKIM ARENASI */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[460px]">
          {teams.map((team, idx) => {
            const isTeamA = idx === 0;
            const isMyTeam = team.players.some(p => p.id === currentUser.id);

            return (
              <div 
                key={team.id}
                className={`bg-[#12070e] rounded-2xl p-5 sm:p-6 flex flex-col justify-between border relative overflow-hidden transition-all ${
                  isTeamA 
                    ? 'border-rose-500/30 shadow-rose-950/20' 
                    : 'border-sky-500/30 shadow-sky-950/20'
                }`}
              >
                {/* Takım Başlığı */}
                <div className="shrink-0 flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isTeamA 
                        ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-sky-600/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {team.id}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white m-0 tracking-tight leading-none">
                        {team.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {team.players.length} Savaşçı
                      </span>
                    </div>
                  </div>

                  {/* Takıma Katıl / Senin Takımın */}
                  {!isMyTeam ? (
                    <button
                      onClick={() => onSwitchTeam(team.id as 'A' | 'B')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isTeamA 
                          ? 'bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border-rose-500/30' 
                          : 'bg-sky-600/15 hover:bg-sky-600/25 text-sky-300 border-sky-500/30'
                      } active:translate-y-0.5`}
                    >
                      Bu Takıma Geç
                    </button>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Senin Takımın
                    </span>
                  )}
                </div>

                {/* Oyuncu Listesi */}
                <div className="flex-1 my-4 flex flex-col gap-2.5 overflow-y-auto max-h-[300px] pr-1">
                  {team.players.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-10 border border-dashed border-white/10 rounded-xl my-2">
                      <Users size={28} className="mb-2 opacity-30" />
                      <span>Bu takımda henüz savaşçı yok</span>
                      {isHost && onAddBot && (
                        <button
                          onClick={() => onAddBot(team.id)}
                          className="mt-3 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 font-medium transition-colors cursor-pointer flex items-center gap-1.5 active:translate-y-0.5 border border-white/10"
                        >
                          <Gamepad2 size={13} className="text-rose-400" />
                          <span>+ Test Rakibi (AI) Ekle</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    team.players.map((player) => {
                      const isMe = player.id === currentUser.id;
                      const avatarDef = PROFILE_AVATARS.find(a => a.id === player.avatar) || PROFILE_AVATARS[0];

                      return (
                        <div 
                          key={player.id}
                          className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all border ${
                            isMe 
                              ? isTeamA 
                                ? 'bg-rose-950/20 border-rose-500/30' 
                                : 'bg-sky-950/20 border-sky-500/30'
                              : 'bg-white/[0.03] border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <PlayerAvatar avatar={player.avatar || 'mask'} size={42} showGlow={isMe} />
                              {player.isHost && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                                  <Crown size={10} strokeWidth={3} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs sm:text-sm font-bold text-white truncate">
                                  {player.name}
                                </span>
                                {isMe && (
                                  <span className="text-[10px] text-slate-300 font-bold px-1.5 py-0.2 rounded bg-white/10">
                                    Sen
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {avatarDef.title}
                              </span>
                            </div>
                          </div>

                          {player.isHost && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-400/20 text-xs font-semibold shrink-0">
                              Kurucu
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Alt Takım Notu */}
                <div className="shrink-0 pt-3 border-t border-white/5 text-xs text-slate-400 flex justify-between items-center">
                  <span>Denge: Serbest Seçim</span>
                  <span className={isTeamA ? 'text-rose-400 font-bold font-mono' : 'text-sky-400 font-bold font-mono'}>
                    {isTeamA ? 'Kızıl Klan' : 'Gök Lejyonu'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* SAĞ: ODA AYARLARI & BAŞLATMA KONSOLU */}
        <div className="w-full lg:w-[380px] shrink-0 bg-[#12070e] rounded-2xl p-5 sm:p-6 border border-white/[0.08] flex flex-col justify-between relative">
          
          <div className="shrink-0 mb-4 pb-3 border-b border-white/5">
            <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight leading-tight">
              Oda Ayarları
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isHost ? 'Oyun temposunu ve hedef puanı belirleyin.' : 'Oda kurucusunun belirlediği kurallar.'}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-around gap-4 py-2">
            
            {/* 1. Hedef Puan */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Award size={14} className="text-amber-400" />
                  <span>Hedef Puan</span>
                </span>
                <span className="text-xs font-bold text-amber-300 tabular-nums">{settings.targetScore} Puan</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[25, 50, 75].map((score) => (
                  <button
                    key={score}
                    disabled={!isHost}
                    onClick={() => handleChange('targetScore', score)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      settings.targetScore === score
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white'
                    } ${!isHost ? 'cursor-default' : 'cursor-pointer active:translate-y-0.5'}`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Tur Süresi */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Clock size={14} className="text-rose-400" />
                  <span>Tur Süresi</span>
                </span>
                <span className="text-xs font-bold text-rose-300 tabular-nums">{settings.roundTime} sn</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    disabled={!isHost}
                    onClick={() => handleChange('roundTime', sec)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      settings.roundTime === sec
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white'
                    } ${!isHost ? 'cursor-default' : 'cursor-pointer active:translate-y-0.5'}`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Pas Hakkı */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Ban size={14} className="text-slate-400" />
                  <span>Pas Hakkı</span>
                </span>
                <span className="text-xs font-bold text-slate-300">
                  {settings.passLimit === 0 ? 'Sınırsız' : `${settings.passLimit} Pas`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 0].map((pass) => (
                  <button
                    key={pass}
                    disabled={!isHost}
                    onClick={() => handleChange('passLimit', pass)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      settings.passLimit === pass
                        ? 'bg-white text-black shadow-md'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white'
                    } ${!isHost ? 'cursor-default' : 'cursor-pointer active:translate-y-0.5'}`}
                  >
                    {pass === 0 ? '∞' : pass}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Aksiyon Alanı */}
          <div className="shrink-0 pt-4 border-t border-white/5 mt-2">
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={totalPlayers === 0}
                className="w-full h-12 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 active:translate-y-0.5 cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                <span>{totalPlayers < 2 ? 'Pratik Düelloyu Başlat' : 'Düelloyu Başlat'}</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-xs text-slate-400 font-medium">
                  Kurucu ayarları tamamladığında düello başlayacak...
                </span>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* 4. ALT BİLGİ */}
      <footer className="relative z-20 shrink-0 flex items-center justify-between text-[11px] text-slate-500 px-2 max-w-7xl w-full mx-auto border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">VETO</span>
          <span>·</span>
          <span>DÜELLO LOBİSİ</span>
        </div>
        <span className="text-slate-500 font-mono">Yasaklı Kelime Avı</span>
      </footer>

      {/* Ayrıl Onay Dialogu */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="Lobiden Ayrıl"
        message="Lobiden ayrılmak istediğinize emin misiniz?"
        confirmText="Ayrıl"
        cancelText="İptal"
        onConfirm={() => {
          setShowLeaveConfirm(false);
          onLeave();
        }}
        onCancel={() => setShowLeaveConfirm(false)}
        variant="danger"
      />

    </div>
  );
};

export default LobbyScreen;
