import React, { useState } from 'react';
import { FranchiseId, RoomSnapshot, OFFICIAL_FRANCHISES } from '@ipl/shared-types';
import { UserProfile } from './AuthScreen';
import {
  Gavel,
  Shield,
  Trophy,
  Users,
  Bot,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Play
} from 'lucide-react';

interface HomeTabProps {
  user: UserProfile | null;
  onQuickStart: (franchise: FranchiseId) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onOpenPoints: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  user,
  onQuickStart,
  onCreateRoom,
  onJoinRoom,
  onOpenPoints
}) => {
  const [selectedFranchise, setSelectedFranchise] = useState<FranchiseId>(
    user?.favoriteFranchise || 'CSK'
  );

  const franchise = OFFICIAL_FRANCHISES.find(f => f.id === selectedFranchise) || OFFICIAL_FRANCHISES[0];

  return (
    <div className="space-y-6 pb-24">
      {/* User Status Card */}
      <div className="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg"
              style={{ backgroundColor: franchise.color, color: franchise.textColor }}
            >
              {franchise.short}
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold">Welcome Back,</div>
              <div className="text-base font-black text-white">{user?.name || 'Franchise Owner'}</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                ★ Franchise Level 5 Owner
              </div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Purse Limit</div>
            <div className="text-base font-black text-amber-400">₹120.00 Cr</div>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-center text-[10px]">
          <div className="bg-surface-950/70 p-2 rounded-xl border border-white/5">
            <div className="text-zinc-500">Auctions</div>
            <div className="font-bold text-white text-xs">{user?.matchesPlayed || 4}</div>
          </div>
          <div className="bg-surface-950/70 p-2 rounded-xl border border-white/5">
            <div className="text-zinc-500">Trophies</div>
            <div className="font-bold text-amber-400 text-xs">{user?.trophiesWon || 2} 🏆</div>
          </div>
          <div className="bg-surface-950/70 p-2 rounded-xl border border-white/5">
            <div className="text-zinc-500">Rulebook</div>
            <div className="font-bold text-emerald-400 text-xs">BCCI 2026</div>
          </div>
        </div>
      </div>

      {/* Main Play Action Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-500/20 via-surface-900 to-surface-950 border border-amber-500/30 space-y-4 shadow-2xl relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black tracking-widest uppercase">
          <Zap className="w-3 h-3 text-amber-400" /> Instant Match Engine
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">Mega Auction Arena</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Command {franchise.name} in a high-stakes 6-set mega auction against 9 intelligent AI archetype bots or friends!
          </p>
        </div>

        {/* Franchise Carousel Picker */}
        <div>
          <div className="text-[11px] font-bold text-zinc-300 mb-2">Select Your Team:</div>
          <div className="grid grid-cols-5 gap-2">
            {OFFICIAL_FRANCHISES.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFranchise(f.id)}
                className={`p-2 rounded-2xl border text-center transition-all ${
                  selectedFranchise === f.id
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-xl scale-105'
                    : 'border-white/5 bg-surface-950/60 opacity-60'
                }`}
                style={{ backgroundColor: selectedFranchise === f.id ? f.color : undefined, color: selectedFranchise === f.id ? f.textColor : undefined }}
              >
                <div className="font-black text-xs">{f.short}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onQuickStart(selectedFranchise)}
          className="w-full py-4 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 active:scale-95 text-zinc-950 font-black text-sm shadow-xl bid-btn-glow flex items-center justify-center gap-2 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START AUCTION AS {selectedFranchise}</span>
        </button>
      </div>

      {/* Multiplayer & War Room Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCreateRoom}
          className="glass-card rounded-3xl p-4 border border-white/10 text-left space-y-2 hover:border-white/20 transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-sm text-white">Create Room</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Custom Purse & Timers</div>
          </div>
        </button>

        <button
          onClick={onJoinRoom}
          className="glass-card rounded-3xl p-4 border border-white/10 text-left space-y-2 hover:border-white/20 transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-sm text-white">Join by Code</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Owner or Spectator</div>
          </div>
        </button>
      </div>

      {/* Player Points Quick Card */}
      <div
        onClick={onOpenPoints}
        className="glass-card rounded-3xl p-4 border border-amber-500/20 flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-sm text-white">Player Points Directory</div>
            <div className="text-[11px] text-zinc-400">Scout all 38 stars, OVR ratings & base prices</div>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-zinc-400" />
      </div>
    </div>
  );
};

