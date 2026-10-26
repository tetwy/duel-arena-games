import React from 'react';
import { Check, X, SkipForward } from 'lucide-react';

interface GameControlsProps {
  onCorrect: () => void;
  onTaboo: () => void;
  onPass: () => void;
  disabled?: boolean;
  passCount: number;
  passLimit: number;
}

export const GameControls: React.FC<GameControlsProps> = ({ 
  onCorrect, onTaboo, onPass, disabled = false, passCount, passLimit
}) => {
  const isPassLimitReached = passLimit > 0 && passCount >= passLimit;
  const remainingPasses = passLimit > 0 ? passLimit - passCount : 999;

  return (
    <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto py-2">
      
      {/* YASAK / VETO (-1) */}
      <button
        type="button"
        onClick={onTaboo}
        disabled={disabled}
        className="flex-1 h-13 sm:h-14 flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs border border-rose-500 transition-colors active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <X size={18} strokeWidth={3} />
        <span>Veto (-1)</span>
      </button>

      {/* PAS (0) */}
      <button
        type="button"
        onClick={onPass}
        disabled={disabled || isPassLimitReached}
        className="px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 font-bold text-xs border border-white/[0.08] transition-colors active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer relative"
      >
        <SkipForward size={16} />
        <span>Pas</span>
        {passLimit > 0 && (
          <span className="w-5 h-5 rounded-md bg-black/60 border border-white/10 text-[10px] tabular-nums flex items-center justify-center text-slate-300">
            {remainingPasses}
          </span>
        )}
      </button>

      {/* DOĞRU (+1) */}
      <button
        type="button"
        onClick={onCorrect}
        disabled={disabled}
        className="flex-1 h-13 sm:h-14 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs border border-emerald-400 transition-colors active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Check size={18} strokeWidth={3} />
        <span>Doğru (+1)</span>
      </button>

    </div>
  );
};

export default GameControls;
