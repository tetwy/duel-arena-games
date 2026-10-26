import React from 'react';
import { Team } from '../types';
import { Trophy, RotateCcw, Home, Sparkles, ArrowRight } from 'lucide-react';

interface GameOverScreenProps {
  teams: Team[];
  onRestart: () => void;
  onReturnToLobby: () => void;
  onHome: () => void;
  isHost: boolean;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  teams, onRestart, onReturnToLobby, onHome, isHost 
}) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  const isDraw = sortedTeams[0].score === sortedTeams[1].score;
  const isWinnerA = !isDraw && winner.id === 'A';

  return (
    <div className="relative min-h-dvh w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#080206] text-white select-none font-sans">
      
      {/* Zafer Kartı */}
      <div className="relative z-10 w-full max-w-lg bg-[#12070e] rounded-2xl p-6 sm:p-8 border border-white/[0.09] flex flex-col items-center text-center">
        
        {/* Üst Kupa */}
        <div className="relative mb-5">
          <Trophy size={64} className="text-amber-400" />
        </div>

        {/* Başlık & Kazanan Takım */}
        <span className="text-xs font-semibold text-rose-300 mb-1">
          {isDraw ? 'Düello Berabere Bitti' : 'Düello Şampiyonu'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-['Plus_Jakarta_Sans',sans-serif] m-0">
          {isDraw ? 'BERABERE!' : `${winner.name}`}
        </h1>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          {isDraw 
            ? 'İki takım da eşit kelime avı performansı sergiledi.' 
            : `${winner.name} stratejik anlatım ve sıfır hata ile zafere ulaştı!`}
        </p>

        {/* Skor Karşılaştırma Kutusu */}
        <div className="w-full grid grid-cols-2 gap-3 my-6 p-3 rounded-xl bg-[#090307] border border-white/[0.07]">
          {sortedTeams.map((t) => (
            <div key={t.id} className="p-3 rounded-lg bg-white/[0.02] flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400">
                {t.name}
              </span>
              <span className="text-3xl font-black tabular-nums text-white mt-1">
                {t.score}
              </span>
              <span className="text-xs text-slate-500">Puan</span>
            </div>
          ))}
        </div>

        {/* Aksiyon Butonları */}
        <div className="w-full flex flex-col gap-2.5">
          {isHost ? (
            <button
              onClick={onRestart}
              className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 border border-rose-500 transition-colors active:translate-y-0.5 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Yeni Düello Başlat</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 py-1">
              Kurucunun yeni tur başlatması bekleniyor...
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReturnToLobby}
              className="h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:translate-y-0.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Lobiye Dön</span>
            </button>

            <button
              onClick={onHome}
              className="h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:translate-y-0.5 cursor-pointer"
            >
              <Home size={13} />
              <span>Arena Menüsü</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default GameOverScreen;
