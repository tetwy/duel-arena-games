import React from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeLeft: number;
  totalTime: number;
  isActive?: boolean;
  onTimeUp: () => void;
}

export const GameTimer: React.FC<GameTimerProps> = ({ timeLeft, totalTime }) => {
  const progress = Math.max(0, Math.min(100, (timeLeft / (totalTime || 60)) * 100));
  const isUrgent = timeLeft <= 10;

  return (
    <div className="w-full max-w-sm md:max-w-md mx-auto my-1 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-1.5">
        <Clock size={14} className={isUrgent ? 'text-amber-400' : 'text-rose-400'} />
        <span className={`text-2xl font-black font-mono tabular-nums tracking-tight ${
          isUrgent ? 'text-amber-400' : 'text-white'
        }`}>
          {timeLeft}s
        </span>
      </div>

      {/* İlerleme Çubuğu */}
      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/[0.04]">
        <div 
          className={`h-full rounded-full transition-[width] duration-500 ease-linear ${
            isUrgent 
              ? 'bg-amber-400' 
              : 'bg-rose-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default GameTimer;
