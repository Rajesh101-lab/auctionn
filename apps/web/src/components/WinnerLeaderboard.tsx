import React, { useEffect } from 'react';
import { TeamLeaderboardEntry } from '@ipl/shared-types';
import { Trophy, Award, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinnerLeaderboardProps {
  leaderboard: TeamLeaderboardEntry[];
  myTeamId?: string;
  onPlayAgain: () => void;
}

export const WinnerLeaderboard: React.FC<WinnerLeaderboardProps> = ({
  leaderboard,
  myTeamId,
  onPlayAgain
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}
  }, []);

  const champion = leaderboard[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      {/* Champion Banner */}
      {champion && (
        <div className="relative overflow-hidden rounded-3xl p-8 border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-surface-900 to-surface-950 text-center space-y-4 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-widest">
            <Trophy className="w-4 h-4 text-amber-400" /> Auctionn Champion
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {champion.teamName}
            </h1>
            <p className="text-sm text-zinc-400">
              Commanded by <span className="text-zinc-200 font-bold">{champion.ownerName}</span> {champion.isAI && '(AI Franchise Bot)'}
            </p>
          </div>

          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-surface-950/80 border border-white/10 font-mono">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Total Power Score</div>
              <div className="text-3xl font-black text-emerald-400">{champion.breakdown.totalScore}/100</div>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Remaining Purse</div>
              <div className="text-xl font-bold text-amber-300">₹{champion.remainingPurse.toFixed(2)} Cr</div>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div>
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Squad Size</div>
              <div className="text-xl font-bold text-white">{champion.squadSize} Players</div>
            </div>
          </div>
        </div>
      )}

      {/* Ranked Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Official Franchise Championship Standings
          </h2>
          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-xs font-bold text-zinc-200 border border-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Start New Simulation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leaderboard.map((team) => {
            const isUser = team.teamId === myTeamId;
            return (
              <div
                key={team.teamId}
                className={`rounded-2xl glass-card p-5 space-y-3 border transition-all ${
                  isUser
                    ? 'border-emerald-500/60 bg-emerald-950/10'
                    : team.rank === 1
                    ? 'border-amber-500/40'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-md"
                      style={{ backgroundColor: team.color, color: team.textColor }}
                    >
                      #{team.rank}
                    </div>
                    <div>
                      <div className="font-black text-base text-white flex items-center gap-2">
                        <span>{team.teamName}</span>
                        {isUser && (
                          <span className="px-2 py-0.5 rounded bg-emeraldBid-500 text-zinc-950 text-[10px] font-black">
                            YOU
                          </span>
                        )}
                        {team.isAI && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px] font-bold">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {team.ownerName} • Purse Left: ₹{team.remainingPurse.toFixed(2)} Cr
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-zinc-400">XI SCORE</div>
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      {team.breakdown.totalScore}/100
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono pt-1">
                  <div className="bg-surface-950/80 p-1.5 rounded-lg border border-white/5">
                    <div className="text-zinc-500">Quality</div>
                    <div className="font-bold text-amber-400">{team.breakdown.qualityScore}/55</div>
                  </div>
                  <div className="bg-surface-950/80 p-1.5 rounded-lg border border-white/5">
                    <div className="text-zinc-500">Bat Depth</div>
                    <div className="font-bold text-sky-400">{team.breakdown.battingDepthScore}/15</div>
                  </div>
                  <div className="bg-surface-950/80 p-1.5 rounded-lg border border-white/5">
                    <div className="text-zinc-500">Bowl Depth</div>
                    <div className="font-bold text-rose-400">{team.breakdown.bowlingDepthScore}/15</div>
                  </div>
                  <div className="bg-surface-950/80 p-1.5 rounded-lg border border-white/5">
                    <div className="text-zinc-500">Role Fit</div>
                    <div className="font-bold text-emerald-400">{team.breakdown.roleFitScore}/15</div>
                  </div>
                </div>

                {/* Playing XI Roster */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                  {team.playingXI && team.playingXI.length > 0 ? (
                    team.playingXI.map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded-md bg-surface-950 border border-white/10 text-[10px] text-zinc-200 font-medium"
                      >
                        {p.name} <span className="text-emerald-400 font-mono">({p.rating} pts)</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">No lineup submitted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

