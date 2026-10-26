import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../constants';
import { Clock, Check, AlertCircle, ArrowLeft, Send, Sparkles, LogOut } from 'lucide-react';

interface GamePhaseProps {
  letter: string;
  roundDuration: number;
  roomId: string;
  playerId: string;
  gameId: string;
  roundNumber: number;
  onTimeUp: (answers: Record<string, string>) => void;
  onLeave: () => void;
  categories: string[];
  roundStartTime?: string;
}

export const GamePhase: React.FC<GamePhaseProps> = ({
  letter,
  roundDuration,
  gameId,
  roundNumber,
  onTimeUp,
  onLeave,
  categories,
  roundStartTime,
}) => {
  const storageKey = `harfbaz_answers_${gameId}_${roundNumber}`;

  const calcTime = () => {
    if (!roundStartTime) return roundDuration;
    const elapsed = (Date.now() - new Date(roundStartTime).getTime()) / 1000;
    return Math.max(0, Math.ceil(roundDuration - elapsed));
  };

  const loadAnswers = (): Record<string, string> => {
    try {
      const s = localStorage.getItem(storageKey);
      if (s) return JSON.parse(s);
    } catch { /**/ }
    return {};
  };

  const [timeLeft, setTimeLeft] = useState(calcTime);
  const [answers, setAnswers] = useState<Record<string, string>>(loadAnswers);
  const [submitted, setSubmitted] = useState(false);

  const answersRef = useRef(answers);
  const submittedRef = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

  useEffect(() => {
    try {
      if (Object.keys(answers).length > 0)
        localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch { /**/ }
  }, [answers, storageKey]);

  useEffect(() => {
    setAnswers(loadAnswers());
    setSubmitted(false);
    submittedRef.current = false;
    setTimeLeft(calcTime());
  }, [gameId, roundNumber]);

  const doSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    onTimeUpRef.current(answersRef.current);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const r = calcTime();
      setTimeLeft(r);
      if (r <= 0) {
        clearInterval(timer);
        doSubmit();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [roundStartTime, roundDuration]);

  const displayCats = categories?.length > 0 ? categories : CATEGORIES;
  const filledCount = displayCats.filter(c => answers[c]?.trim()).length;
  const allFilled = filledCount === displayCats.length;
  const isUrgent = timeLeft <= 10 && !submitted;
  const upperLetter = letter?.toLocaleUpperCase('tr-TR') || 'A';

  const handleInputChange = (cat: string, val: string) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [cat]: val,
    }));
  };

  return (
    <div className="relative min-h-dvh w-full bg-[#06080d] text-white flex flex-col justify-between p-3 sm:p-5 lg:p-6 box-border overflow-x-hidden select-none font-sans">
      
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
      {/* 1. ÜST HUD: HARF MÜHRÜ, TUR VE GERİ SAYIM                                 */}
      {/* ========================================================================= */}
      <header className="relative z-20 shrink-0 max-w-7xl w-full mx-auto bg-[#0b0e17]/90 rounded-2xl p-3 sm:p-4 border border-white/[0.08] flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Sol: Harf Göstergesi & Çıkış Butonu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-slate-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer active:translate-y-0.5 shrink-0"
            title="Düellodan Ayrıl"
          >
            <LogOut size={13} className="text-rose-400" />
            <span className="hidden sm:inline">Ayrıl</span>
          </button>

          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0e1420] text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-black text-2xl font-mono shrink-0">
            {upperLetter}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                HARF: <strong className="text-cyan-300 font-mono text-sm font-black">"{upperLetter}"</strong>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 font-mono border border-white/[0.08]">
                TUR {roundNumber}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-normal hidden md:inline">
              Tüm kelimeler <strong className="text-cyan-300 font-mono">"{upperLetter}"</strong> harfi ile başlamalıdır.
            </span>
          </div>
        </div>

        {/* Orta: Doluluk Oranı */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <span className="text-[11px] text-slate-400 font-mono">DURUM:</span>
          <span className={`text-xs font-mono font-bold tabular-nums ${allFilled ? 'text-emerald-400' : 'text-cyan-300'}`}>
            {filledCount} / {displayCats.length} DOLU
          </span>
        </div>

        {/* Sağ: Sayaç */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            isUrgent 
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' 
              : 'bg-white/[0.03] border-white/[0.08] text-white'
          }`}>
            <Clock size={16} className={isUrgent ? 'text-rose-400' : 'text-cyan-400'} />
            <span className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tight">
              {timeLeft}s
            </span>
          </div>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. ANA SAHNE: 10 KATEGORİ BENTO GRID                                      */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto my-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pb-24">
          {displayCats.map((cat) => {
            const val = answers[cat] || '';
            const isFilled = val.trim().length > 0;
            const firstLetterMatch = isFilled && val.trim()[0].toLocaleUpperCase('tr-TR') === upperLetter;
            const isBadStart = isFilled && !firstLetterMatch;

            return (
              <div
                key={cat}
                className={`rounded-2xl p-4 border transition-colors flex flex-col justify-between bg-[#0b0e17]/80 ${
                  isBadStart
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isFilled
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : 'border-white/[0.07] hover:border-white/[0.14]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-300">
                    {cat}
                  </span>
                  {isFilled && (
                    firstLetterMatch ? (
                      <span className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-rose-400 font-mono font-bold">
                        <AlertCircle size={12} />
                        <span>"{upperLetter}" ile başla</span>
                      </span>
                    )
                  )}
                </div>

                <input
                  type="text"
                  disabled={submitted}
                  value={val}
                  onChange={(e) => handleInputChange(cat, e.target.value)}
                  placeholder={`"${upperLetter}" ile bir ${cat.toLowerCase()}...`}
                  className={`w-full box-border px-3.5 py-2.5 rounded-xl bg-[#06080e] border text-white placeholder-slate-600 text-xs font-semibold focus:outline-none transition-colors ${
                    isBadStart
                      ? 'border-rose-500/50 focus:border-rose-400'
                      : 'border-white/[0.09] focus:border-cyan-400 focus:bg-[#080c14]'
                  } disabled:opacity-50`}
                />
              </div>
            );
          })}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. ALT SABİT AKSİYON BARI (DOKUNSAL BUTON)                                */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-[#070910] border-t border-white/10 flex items-center justify-between max-w-7xl mx-auto">
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Tüm kutuları doldurunca STOP ile süreyi kilitleyebilirsin.
          </span>
        </div>

        {submitted ? (
          <div className="px-6 py-3 rounded-xl bg-[#111624] border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2">
            <Check size={16} />
            <span>Cevapların Kaydedildi · Oylama Bekleniyor</span>
          </div>
        ) : (
          <button
            onClick={doSubmit}
            className={`px-7 py-3 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 border cursor-pointer active:translate-y-0.5 ${
              allFilled
                ? 'bg-amber-400 hover:bg-amber-300 text-black border-amber-300'
                : 'bg-cyan-400 hover:bg-cyan-300 text-black border-cyan-300'
            }`}
          >
            <Send size={14} />
            <span>{allFilled ? 'STOP! Süreyi Kilitle' : 'Cevapları Gönder'}</span>
          </button>
        )}

      </footer>

    </div>
  );
};

export default GamePhase;
