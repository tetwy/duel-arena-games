import React from 'react';
import { Player } from '../types';
import { PlayerAvatar } from './Avatar';
import { Trophy, RotateCcw, Home, Crown, ArrowRight, Award } from 'lucide-react';

interface ScoreboardProps {
  players: Player[];
  onNextRound: () => void;
  isGameOver: boolean;
  roundNumber: number;
  isHost: boolean;
  onLeave: () => void;
  currentPlayerId?: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  onNextRound,
  isGameOver,
  roundNumber,
  isHost,
  onLeave,
  currentPlayerId,
}) => {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="relative min-h-dvh w-full bg-[#06080d] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 box-border overflow-x-hidden select-none font-sans">
      
      {/* İnce Atmosferik Zemin & Dokusal Izgara */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: 'transparent'
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'none',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* ÜST BİLGİ */}
      <header className="relative z-20 shrink-0 max-w-4xl w-full mx-auto text-center pt-2">
        <span className="text-xs font-semibold text-cyan-300 block mb-1">
          {isGameOver ? 'Düello Tamamlandı' : `Tur ${roundNumber} Sonuçları`}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight m-0">
          {isGameOver ? 'Şampiyonluk Kürsüsü' : 'Liderlik Tablosu'}
        </h1>
      </header>

      {/* ORTA SAHNE: KÜRSÜ & PUAN DURUMU */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto my-6 flex flex-col items-center justify-center">
        
        {/* TOP 3 PODIUM */}
        <div className="w-full flex items-end justify-center gap-3 sm:gap-6 mb-8 max-w-lg mx-auto">
          
          {/* 2. Sıra (Gümüş) */}
          {sorted[1] && (
            <div className="flex-1 flex flex-col items-center">
              <div className="relative mb-2">
                <PlayerAvatar avatar={sorted[1].avatar} size={48} />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-slate-300 text-black text-[10px] font-black flex items-center justify-center border border-black font-mono">
                  2
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-[100px] block">
                {sorted[1].name}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">
                {sorted[1].score} Puan
              </span>
              <div className="w-full h-20 bg-[#0c101a] rounded-t-xl border-t border-x border-slate-400/30 mt-2 flex items-center justify-center text-slate-400 font-mono text-sm font-bold">
                2.
              </div>
            </div>
          )}

          {/* 1. Sıra (Altın) */}
          {winner && (
            <div className="flex-1 flex flex-col items-center">
              <Crown size={22} className="text-amber-400 mb-1" />
              <div className="relative mb-2">
                <PlayerAvatar avatar={winner.avatar} size={60} showGlow={true} />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md bg-amber-400 text-black text-xs font-black flex items-center justify-center border border-black font-mono ">
                  1
                </span>
              </div>
              <span className="text-sm font-black text-white truncate max-w-[120px] block">
                {winner.name}
              </span>
              <span className="text-sm font-mono font-black text-amber-300 tabular-nums">
                {winner.score} Puan
              </span>
              <div className="w-full h-28 bg-[#111624] rounded-t-xl border-t border-x border-amber-400/40 mt-2 flex items-center justify-center text-amber-300 font-mono text-lg font-black ">
                1.
              </div>
            </div>
          )}

          {/* 3. Sıra (Bronz) */}
          {sorted[2] && (
            <div className="flex-1 flex flex-col items-center">
              <div className="relative mb-2">
                <PlayerAvatar avatar={sorted[2].avatar} size={44} />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-amber-700 text-white text-[10px] font-black flex items-center justify-center border border-black font-mono">
                  3
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-[100px] block">
                {sorted[2].name}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">
                {sorted[2].score} Puan
              </span>
              <div className="w-full h-14 bg-[#0a0d16] rounded-t-xl border-t border-x border-amber-800/40 mt-2 flex items-center justify-center text-amber-600 font-mono text-sm font-bold">
                3.
              </div>
            </div>
          )}

        </div>

        {/* TÜM OYUNCULAR LİSTESİ */}
        <div className="w-full max-w-lg flex flex-col gap-2">
          {sorted.map((p, idx) => {
            const isMe = p.id === currentPlayerId;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl flex items-center justify-between border transition-colors ${
                  isMe
                    ? 'bg-cyan-950/20 border-cyan-400/30'
                    : 'bg-[#0b0e17]/80 border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-mono font-bold text-xs text-slate-400 tabular-nums">
                    #{idx + 1}
                  </span>
                  <PlayerAvatar avatar={p.avatar} size={32} />
                  <span className="text-xs font-bold text-white">
                    {p.name} {isMe && <span className="text-cyan-400 font-mono">(Sen)</span>}
                  </span>
                </div>
                <span className="text-base font-black font-mono text-white tabular-nums">
                  {p.score} P
                </span>
              </div>
            );
          })}
        </div>

      </main>

      {/* ALT BUTONLAR */}
      <footer className="relative z-20 shrink-0 max-w-md w-full mx-auto flex flex-col gap-2.5">
        {isHost ? (
          <button
            onClick={onNextRound}
            className="w-full h-12 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center justify-center gap-2 border border-cyan-300 transition-colors active:translate-y-0.5 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>{isGameOver ? 'Yeni Oyun Başlat' : 'Sonraki Tura Geç'}</span>
          </button>
        ) : (
          <div className="text-center text-xs text-slate-400 py-1">
            Kurucunun sonraki tura geçmesi bekleniyor...
          </div>
        )}

        <button
          onClick={onLeave}
          className="h-10 rounded-xl bg-[#111624] hover:bg-[#161d30] text-slate-300 hover:text-white border border-white/5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:translate-y-0.5 cursor-pointer"
        >
          <Home size={14} />
          <span>Arena Menüsüne Dön</span>
        </button>
      </footer>

    </div>
  );
};

export default Scoreboard;
