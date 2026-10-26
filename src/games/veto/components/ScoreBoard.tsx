import React from 'react';
import { Team, Player } from '../types';
import { Trophy } from 'lucide-react';

interface ScoreBoardProps {
  teams: Team[];
  currentTeamId: string;
  currentNarrator: Player | null;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ teams, currentTeamId }) => {
  const maxScore = Math.max(...teams.map(t => t.score));
  const hasScore = maxScore > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-3 pb-1 relative z-20">
      <div className="bg-[#12070e] rounded-xl p-2.5 sm:p-3 border border-white/[0.08] flex items-center justify-between gap-3">
        {teams.map((team) => {
          const isActive = team.id === currentTeamId;
          const isLeading = hasScore && team.score === maxScore;
          const isTeamA = team.id === 'A';

          return (
            <div 
              key={team.id}
              className={`flex-1 rounded-lg p-2.5 flex items-center justify-between gap-3 transition-colors border ${
                isActive 
                  ? isTeamA 
                    ? 'bg-rose-950/40 border-rose-500/40' 
                    : 'bg-sky-950/40 border-sky-500/40'
                  : 'bg-white/[0.02] border-white/[0.05] opacity-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs border ${
                  isTeamA ? 'bg-rose-600/20 text-rose-300 border-rose-500/30' : 'bg-sky-600/20 text-sky-300 border-sky-500/30'
                }`}>
                  {team.id}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white truncate block">
                    {team.name}
                  </span>
                  {isActive && (
                    <span className="text-[11px] text-emerald-400 font-semibold block">
                      Sıra Bu Takımda
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLeading && (
                  <Trophy size={14} className="text-amber-400 shrink-0" />
                )}
                <span className="text-2xl font-black tabular-nums text-white tracking-tight">
                  {team.score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBoard;
