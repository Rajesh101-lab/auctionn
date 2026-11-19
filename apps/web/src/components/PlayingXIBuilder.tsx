import React, { useState, useMemo } from 'react';
import {
  TeamState,
  Player,
  AcquiredPlayer,
  calculatePlayingXIScore,
  PlayingXIScoreBreakdown,
  autoSelectBestXI
} from '@ipl/shared-types';
import { Trophy, CheckCircle2, AlertTriangle, Users, Award } from 'lucide-react';

interface PlayingXIBuilderProps {
  myTeam: TeamState;
  onSubmit: (playerIds: string[]) => void;
  hasSubmitted: boolean;
  savedBreakdown?: PlayingXIScoreBreakdown;
}

export const PlayingXIBuilder: React.FC<PlayingXIBuilderProps> = ({
  myTeam,
  onSubmit,
  hasSubmitted,
  savedBreakdown
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // default to auto-selected best 11
    const auto = autoSelectBestXI(myTeam.squad);
    return auto.map(p => p.id);
  });

  const selectedPlayers = useMemo(() => {
    return myTeam.squad.filter(p => selectedIds.includes(p.id));
  }, [myTeam.squad, selectedIds]);

  const liveBreakdown: PlayingXIScoreBreakdown = useMemo(() => {
    return calculatePlayingXIScore(selectedPlayers);
  }, [selectedPlayers]);

  const breakdown = savedBreakdown || liveBreakdown;

  const togglePlayer = (p: AcquiredPlayer) => {
    if (hasSubmitted) return;
    if (selectedIds.includes(p.id)) {
      setSelectedIds(selectedIds.filter(id => id !== p.id));
    } else {
      if (selectedIds.length >= 11) {
        alert('You can only select up to 11 players for your Playing XI. Deselect one first.');
        return;
      }
      setSelectedIds([...selectedIds, p.id]);
    }
  };

  const handleAutoFill = () => {
    const auto = autoSelectBestXI(myTeam.squad);
    setSelectedIds(auto.map(p => p.id));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      {/* Header Banner */}
      <div className="rounded-3xl glass-card p-6 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl"
            style={{ backgroundColor: myTeam.color, color: myTeam.textColor }}
          >
            {myTeam.short}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{myTeam.name} — Playing XI Builder</h2>
              {hasSubmitted && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  SUBMITTED
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Select your 11 championship players. Validated against BCCI T20 rules: 11 players, ≤ 4 Overseas, ≥ 1 WK.
            </p>
          </div>
        </div>

        {/* Live Score Display */}
        <div className="flex items-center gap-4 bg-surface-950/80 border border-white/10 rounded-2xl p-4 self-stretch md:self-auto justify-between">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Lineup Power Score</div>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {breakdown.totalScore}
              <span className="text-xs text-zinc-400 font-normal"> / 100</span>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div className="text-center">
            <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Selected</div>
            <div className="text-xl font-bold font-mono text-white">
              {selectedPlayers.length} / 11
            </div>
          </div>
        </div>
      </div>

      {/* 4 Scoring Pillars Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Raw Quality */}
        <div className="rounded-2xl glass-card p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">Pillar 1: Raw Quality</span>
            <span className="text-xs font-mono font-black text-amber-400">{breakdown.qualityScore} / 55 pts</span>
          </div>
          <div className="w-full bg-surface-800 rounded-full h-2">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (breakdown.qualityScore / 55) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400">
            Average OVR: <span className="text-white font-mono font-bold">{breakdown.avgRating} pts</span>
          </div>
        </div>

        {/* Pillar 2: Batting Depth */}
        <div className="rounded-2xl glass-card p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">Pillar 2: Batting Depth</span>
            <span className="text-xs font-mono font-black text-sky-400">{breakdown.battingDepthScore} / 15 pts</span>
          </div>
          <div className="w-full bg-surface-800 rounded-full h-2">
            <div
              className="bg-sky-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (breakdown.battingDepthScore / 15) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400">
            Batting Options: <span className="text-white font-mono font-bold">{breakdown.battingCount}</span> (Target 7)
          </div>
        </div>

        {/* Pillar 3: Bowling Depth */}
        <div className="rounded-2xl glass-card p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">Pillar 3: Bowling Depth</span>
            <span className="text-xs font-mono font-black text-rose-400">{breakdown.bowlingDepthScore} / 15 pts</span>
          </div>
          <div className="w-full bg-surface-800 rounded-full h-2">
            <div
              className="bg-rose-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (breakdown.bowlingDepthScore / 15) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400">
            Bowling Options: <span className="text-white font-mono font-bold">{breakdown.bowlingCount}</span> (Target 5-6)
          </div>
        </div>

        {/* Pillar 4: Role & Balance Fit */}
        <div className="rounded-2xl glass-card p-4 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">Pillar 4: Role Fit</span>
            <span className="text-xs font-mono font-black text-emerald-400">{breakdown.roleFitScore} / 15 pts</span>
          </div>
          <div className="w-full bg-surface-800 rounded-full h-2">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (breakdown.roleFitScore / 15) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400">
            WK: <span className="text-white font-bold">{breakdown.wkCount}</span> | OS: <span className="text-white font-bold">{breakdown.overseasCount}/4</span>
          </div>
        </div>
      </div>

      {/* Validation Warnings */}
      {breakdown.validationErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-400">
            <AlertTriangle className="w-4 h-4" /> Lineup Validation Issues:
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {breakdown.validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Controls & Squad Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" />
            Select from Squad ({myTeam.squad.length} Players Acquired)
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoFill}
              disabled={hasSubmitted || myTeam.squad.length === 0}
              className="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-xs font-semibold text-zinc-300 border border-white/10 transition-colors disabled:opacity-50"
            >
              Auto-Pick Optimal XI
            </button>
            <button
              onClick={() => onSubmit(selectedIds)}
              disabled={hasSubmitted || !breakdown.isValid}
              className="px-5 py-2 rounded-xl bg-emeraldBid-500 hover:bg-emeraldBid-600 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {hasSubmitted ? 'Lineup Locked' : 'Submit Final Playing XI'}
            </button>
          </div>
        </div>

        {myTeam.squad.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 glass-card rounded-2xl">
            No players were acquired by this franchise during the auction.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {myTeam.squad.map((player) => {
              const isSelected = selectedIds.includes(player.id);
              return (
                <div
                  key={player.id}
                  onClick={() => togglePlayer(player)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-surface-900 border-white/5 hover:border-white/20 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        {player.name}
                        {player.isOverseas && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            OS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {player.role} • {player.country}
                      </div>
                    </div>
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-surface-800 text-amber-300 border border-white/10">
                      {player.rating} pts
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Bought Price:</span>
                    <span className="text-emerald-400 font-bold">₹{player.boughtPrice.toFixed(2)} Cr</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

