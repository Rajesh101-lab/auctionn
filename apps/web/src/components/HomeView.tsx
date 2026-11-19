import React from 'react';
import { Gavel, Sparkles, Shield, ChevronRight, Award, Scale, Clock, DollarSign, ArrowUpRight, Zap } from 'lucide-react';

interface HomeViewProps {
  onQuickStart: () => void;
  onExploreRooms: () => void;
  onViewPlayers: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onQuickStart,
  onExploreRooms,
  onViewPlayers
}) => {
  return (
    <div className="space-y-8 pb-28 text-slate-200">
      {/* Editorial Title Banner */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" /> Official BCCI Rules Active
          </div>
          <span className="text-slate-400 text-[11px]">2026 Regulations</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Auctionn <br />
          <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
            War Room Simulator
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
          Server-authoritative bidding engine, 10 franchise war rooms, dynamic AI archetype bidders, official BCCI reserve formulas, and the 100-point Championship calculator.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            onClick={onQuickStart}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg bid-btn-glow active:scale-95 transition-all flex items-center gap-2"
          >
            <Gavel className="w-4 h-4" />
            <span>Start Practice Draft</span>
          </button>
          <button
            onClick={onExploreRooms}
            className="px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700/60 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>Live Multiplayer</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Structured BCCI Rules Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Official Governance & Auction Rules
          </h2>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Rulebook v2.6</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1: Bid Increment Slabs */}
          <div className="glass-card rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">Bid Increment Slabs</h3>
                <p className="text-[10px] text-slate-400">Official BCCI slab steps</p>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 space-y-1.5 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">&lt; ₹1.00 Cr:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+₹0.05 Cr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">₹1.00 – ₹2.00 Cr:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+₹0.10 Cr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">₹2.00 – ₹5.00 Cr:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+₹0.20 Cr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">&ge; ₹5.00 Cr:</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+₹0.25 Cr</span>
              </div>
            </div>
          </div>

          {/* Card 2: Purse & Reserve Math */}
          <div className="glass-card rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">Purse Cap & Reserve Math</h3>
                <p className="text-[10px] text-slate-400">18-player minimum guarantee</p>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 space-y-1.5 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Franchise Purse:</span>
                <strong className="text-amber-300">₹120.00 Cr</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Squad Size Limits:</span>
                <strong className="text-slate-200">18 – 25 Players</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Overseas Roster:</span>
                <strong className="text-sky-300">Max 8 Players</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mandatory Reserve:</span>
                <strong className="text-slate-300">₹0.30 Cr / needed slot</strong>
              </div>
            </div>
          </div>

          {/* Card 3: 6-Set Rotation */}
          <div className="glass-card rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">6-Set Auction Rotation</h3>
                <p className="text-[10px] text-slate-400">Category-by-category sequencing</p>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 text-[11px] space-y-1.5 text-slate-300 font-medium">
              <div className="flex items-center justify-between">
                <span>Set 1: Capped Batters</span>
                <span className="text-[10px] font-mono text-slate-400">Round 1</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Set 2: Capped Bowlers</span>
                <span className="text-[10px] font-mono text-slate-400">Round 1</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Set 3: All-Rounders & WKs</span>
                <span className="text-[10px] font-mono text-slate-400">Round 1</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sets 4–5: Round 2 Lots</span>
                <span className="text-[10px] font-mono text-slate-400">Round 2</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-amber-300 font-semibold">
                <span>Set 6: Accelerated Unsold Round</span>
                <span className="text-[10px] font-mono text-amber-400">Re-auction</span>
              </div>
            </div>
          </div>

          {/* Card 4: 100-Point Playing XI Calculator */}
          <div className="glass-card rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white">100-Point Playing XI Score</h3>
                <p className="text-[10px] text-slate-400">0 purse bias • 4 Pillars</p>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 text-[11px] font-mono space-y-1.5 text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pillar 1: Raw Quality</span>
                <strong className="text-amber-300 font-bold">Max 55 pts</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pillar 2: Batting Depth</span>
                <strong className="text-sky-300 font-bold">Max 15 pts</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pillar 3: Bowling Depth</span>
                <strong className="text-rose-300 font-bold">Max 15 pts</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pillar 4: Role & Fit</span>
                <strong className="text-emerald-300 font-bold">Max 15 pts</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Directory Scouting Banner */}
      <div
        onClick={onViewPlayers}
        className="glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between cursor-pointer glass-card-hover group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
              Player Points Directory
            </h3>
            <p className="text-[11px] text-slate-400">
              Scout all 38 stars, OVR ratings (50–99 pts), base prices, sets & live status
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
