import React, { useMemo } from 'react';
import { Player, RoundAnswers, Vote } from '../types';
import { PlayerAvatar } from './Avatar';
import { ThumbsDown, ArrowRight, ShieldAlert, Check, Copy, AlertTriangle, Users, LogOut } from 'lucide-react';

interface VotingPhaseProps {
  players: Player[];
  answers: RoundAnswers;
  currentLetter: string;
  currentPlayerId: string;
  currentVotes: Vote[];
  currentCategoryIndex: number;
  isHost: boolean;
  onNextCategory: () => void;
  onToggleVote: (targetPlayerId: string) => void;
  onLeave: () => void;
  isHiddenMode?: boolean;
  revealedPlayers?: string[];
  onRevealCard?: (playerId: string) => void;
  isLoading?: boolean;
  roundStartTime?: string;
  categories: string[];
}

export const VotingPhase: React.FC<VotingPhaseProps> = ({
  players,
  answers,
  currentLetter,
  currentPlayerId,
  currentVotes,
  currentCategoryIndex,
  isHost,
  onNextCategory,
  onToggleVote,
  onLeave,
  categories,
  isLoading = false,
  roundStartTime,
}) => {
  const category = categories[currentCategoryIndex];
  const isLastCat = currentCategoryIndex === categories.length - 1;

  const activePlayers = useMemo(() => {
    if (!roundStartTime) return players;
    const start = new Date(roundStartTime).getTime();
    const filtered = players.filter(p => new Date(p.joinedAt).getTime() <= start + 5000);
    return filtered.length > 0 ? filtered : players;
  }, [players, roundStartTime]);

  const totalActive = activePlayers.length;

  const getVoteCount = (pid: string) =>
    currentVotes.filter(v => v.targetPlayerId === pid && v.category === category && v.isVeto).length;

  const iVetoed = (pid: string) =>
    currentVotes.some(v => v.voterId === currentPlayerId && v.targetPlayerId === pid && v.category === category && v.isVeto);

  const isRejected = (pid: string) => getVoteCount(pid) > totalActive / 2;

  // Duplicate kelime kontrolü
  const answerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activePlayers.forEach(p => {
      const a = (answers[p.id]?.[category] || '').trim().toLocaleLowerCase('tr-TR');
      if (a) counts[a] = (counts[a] || 0) + 1;
    });
    return counts;
  }, [activePlayers, answers, category]);

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

      {/* ========================================================================= */}
      {/* 1. ÜST TELEMETRİ BARI: KATEGORİ SAHNESİ                                   */}
      {/* ========================================================================= */}
      <header className="relative z-20 shrink-0 max-w-7xl w-full mx-auto bg-[#0b0e17] rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 sm:gap-3.5">
          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-slate-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer active:translate-y-0.5 shrink-0"
            title="Düellodan Ayrıl"
          >
            <LogOut size={13} className="text-rose-400" />
            <span className="hidden sm:inline">Ayrıl</span>
          </button>

          <div className="w-12 h-12 rounded-xl bg-[#0e1420] text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-bold text-2xl font-mono shrink-0">
            {currentLetter.toLocaleUpperCase('tr-TR')}
          </div>
          <div>
            <span className="text-xs font-semibold text-cyan-300 block mb-0.5">
              Kategori {currentCategoryIndex + 1} / {categories.length} · Oylama
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight m-0">
              {category}
            </h1>
          </div>
        </div>

        {/* Kurucu İlerleme Aksiyonu */}
        {isHost ? (
          <button
            onClick={onNextCategory}
            disabled={isLoading}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center justify-center gap-2 border border-cyan-300 transition-colors active:translate-y-0.5 cursor-pointer"
          >
            <span>{isLastCat ? 'Skorları Göster' : 'Sonraki Kategori'}</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-[#111624] border border-white/5 text-xs text-slate-400">
            Kurucunun sonraki kategoriye geçmesi bekleniyor...
          </div>
        )}

      </header>

      {/* ========================================================================= */}
      {/* 2. CEVAP KARTLARI IZGARASI                                                */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto my-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePlayers.map((player) => {
            const rawAnswer = (answers[player.id]?.[category] || '').trim();
            const lowerAnswer = rawAnswer.toLocaleLowerCase('tr-TR');
            const hasAnswer = rawAnswer.length > 0;
            const isDuplicate = hasAnswer && (answerCounts[lowerAnswer] || 0) > 1;
            const vetoCount = getVoteCount(player.id);
            const rejected = isRejected(player.id);
            const isMe = player.id === currentPlayerId;
            const userVetoed = iVetoed(player.id);

            return (
              <div
                key={player.id}
                className={`rounded-2xl p-4 sm:p-5 border transition-colors flex flex-col justify-between ${
                  rejected
                    ? 'border-rose-500/40 bg-rose-950/20'
                    : isDuplicate
                      ? 'border-amber-500/30 bg-amber-950/20'
                      : hasAnswer
                        ? 'border-white/10 bg-[#0b0e17]'
                        : 'border-white/5 bg-[#090c14] opacity-50'
                }`}
              >
                {/* Üst Satır: Oyuncu Kimliği */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar avatar={player.avatar} size={36} />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {player.name} {isMe && <span className="text-cyan-400 font-semibold">(Sen)</span>}
                      </span>
                      <span className="text-xs text-slate-400">Savaşçı</span>
                    </div>
                  </div>

                  {/* Durum Rozeti */}
                  {rejected ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/40 text-xs font-semibold tabular-nums">
                      Veto Edildi (0)
                    </span>
                  ) : isDuplicate ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/40 text-xs font-semibold tabular-nums">
                      Benzer (+5)
                    </span>
                  ) : hasAnswer ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-xs font-semibold tabular-nums">
                      Özgün (+10)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-500 text-xs">
                      Boş (0)
                    </span>
                  )}
                </div>

                {/* Orta Satır: Yazılan Kelime */}
                <div className="py-4 text-center">
                  {hasAnswer ? (
                    <h3 className={`text-2xl font-black uppercase tracking-wide m-0 ${
                      rejected ? 'line-through text-rose-400/80' : 'text-white'
                    }`}>
                      {rawAnswer}
                    </h3>
                  ) : (
                    <span className="text-xs text-slate-600 italic">Cevap verilmedi</span>
                  )}
                </div>

                {/* Alt Satır: Veto Kontrolü */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 tabular-nums">
                    {vetoCount > 0 && <span className="text-rose-400 font-bold">{vetoCount} Veto Oyu</span>}
                  </span>

                  {!isMe && hasAnswer && (
                    <button
                      onClick={() => onToggleVote(player.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border cursor-pointer active:translate-y-0.5 ${
                        userVetoed
                          ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                          : 'bg-[#111624] hover:bg-rose-950/30 text-slate-300 hover:text-rose-300 border-white/10'
                      }`}
                    >
                      <ThumbsDown size={12} />
                      <span>{userVetoed ? 'VETO EDİLDİ' : 'VETO ET'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </main>

      {/* 3. ALT BİLGİ */}
      <footer className="relative z-20 shrink-0 text-center text-xs text-slate-500 font-mono max-w-7xl mx-auto w-full pt-3 border-t border-white/[0.06]">
        Kelimeler kural dışı veya uydurmaysa diğer oyuncular veto edebilir. Çoğunluk oyu ile kelime iptal edilir.
      </footer>

    </div>
  );
};

export default VotingPhase;
