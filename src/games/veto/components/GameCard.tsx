import React from 'react';
import { CardData } from '../types';
import { AlertTriangle, EyeOff, ShieldAlert, Lock } from 'lucide-react';

interface GameCardProps {
  card: CardData;
  isLoading?: boolean;
  isMasked?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ card, isLoading = false, isMasked = false }) => {
  if (isLoading || !card) {
    return (
      <div className="w-full max-w-sm md:max-w-md h-[460px] bg-[#12070e] rounded-2xl border border-white/[0.08] mx-auto flex items-center justify-center text-slate-500 text-xs font-medium">
        Kart Hazırlanıyor...
      </div>
    );
  }

  const forbiddenWords = Array.isArray(card.forbidden_words) && card.forbidden_words.length > 0
    ? card.forbidden_words
    : Array.isArray(card.taboo_words) && card.taboo_words.length > 0
      ? card.taboo_words
      : [];

  return (
    <div className="w-full max-w-sm md:max-w-md mx-auto h-full max-h-[520px] flex flex-col bg-[#12070e] rounded-2xl border border-white/[0.09] overflow-hidden relative">
      
      {/* ÜST BÖLÜM: HEDEF KELİME PLAKASI */}
      <div className="relative z-10 shrink-0 p-5 text-center bg-[#1a0a14] overflow-hidden">
        {isMasked ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 mb-2">
              <EyeOff size={22} />
            </div>
            <h2 className="text-lg font-black text-slate-300 tracking-normal font-['Plus_Jakarta_Sans',sans-serif]">
              KART GİZLİ
            </h2>
            <span className="text-xs text-rose-300 font-medium mt-1">
              Anlatan arkadaşını dinle ve doğru kelimeyi tahmin et!
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-rose-600/20 text-rose-300 border border-rose-500/30">
                {card.category || 'Veto Düellosu'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-none font-['Plus_Jakarta_Sans',sans-serif]">
              {card.word}
            </h2>
          </div>
        )}
      </div>

      {/* ORTA BÖLÜM: 5 YASAKLI SÖZ */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto min-h-0 bg-[#0d050a]">
        
        {/* Uyarı Başlığı */}
        <div className="flex items-center justify-center gap-2 text-rose-400 mb-2 shrink-0">
          <ShieldAlert size={14} />
          <span className="text-xs font-semibold">
            5 Yasaklı Söz (Kullanılamaz)
          </span>
        </div>

        {/* 5 Yasaklı Kelime Yuvaları */}
        <div className="flex-1 flex flex-col justify-around gap-2 my-1">
          {forbiddenWords.map((forbidden, index) => (
            <div 
              key={index} 
              className={`w-full py-2.5 px-4 rounded-xl text-center font-bold text-sm sm:text-base transition-colors border ${
                isMasked 
                  ? 'bg-white/[0.02] border-white/[0.04] text-slate-600' 
                  : 'bg-[#180b14] border-white/[0.07] hover:border-rose-500/40 text-slate-100'
              }`}
            >
              {isMasked ? (
                <span className="tracking-widest text-slate-600 text-sm">•••••••••</span>
              ) : (
                <span>{forbidden}</span>
              )}
            </div>
          ))}
        </div>

        {/* Alt Bilgi */}
        <div className="shrink-0 pt-2 text-center text-xs text-slate-500">
          <span>Yasak söz söylenirse rakip VETO basar</span>
        </div>

      </div>

    </div>
  );
};

export default GameCard;
