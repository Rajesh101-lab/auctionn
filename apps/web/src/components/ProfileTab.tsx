import React, { useState } from 'react';
import { UserProfile } from './AuthScreen';
import { FranchiseId, OFFICIAL_FRANCHISES } from '@ipl/shared-types';
import {
  User,
  Trophy,
  Shield,
  Award,
  LogOut,
  Bell,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Sliders
} from 'lucide-react';

interface ProfileTabProps {
  user: UserProfile | null;
  onLogout: () => void;
  onUpdateFavFranchise: (franchise: FranchiseId) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  onLogout,
  onUpdateFavFranchise
}) => {
  const [selectedFranchise, setSelectedFranchise] = useState<FranchiseId>(
    user?.favoriteFranchise || 'CSK'
  );

  const franchise = OFFICIAL_FRANCHISES.find(f => f.id === selectedFranchise) || OFFICIAL_FRANCHISES[0];

  const handleSelect = (id: FranchiseId) => {
    setSelectedFranchise(id);
    onUpdateFavFranchise(id);
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      {/* Header Profile Badge */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 text-center space-y-4 shadow-xl">
        <div
          className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center font-black text-2xl shadow-xl ring-4 ring-white/10"
          style={{ backgroundColor: franchise.color, color: franchise.textColor }}
        >
          {franchise.short}
        </div>

        <div>
          <h2 className="text-xl font-black text-white">{user?.name || 'Franchise Owner'}</h2>
          <p className="text-xs text-zinc-400">{user?.email || 'owner@iplauction.com'}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono mt-2 border border-emerald-500/20 font-bold">
            <Shield className="w-3 h-3" /> VERIFIED BCI FRANCHISE OWNER
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
          <div className="bg-surface-950 p-2.5 rounded-2xl border border-white/5">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Win Rate</div>
            <div className="text-base font-black font-mono text-emerald-400">75%</div>
          </div>
          <div className="bg-surface-950 p-2.5 rounded-2xl border border-white/5">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Championships</div>
            <div className="text-base font-black font-mono text-amber-400">2 🏆</div>
          </div>
          <div className="bg-surface-950 p-2.5 rounded-2xl border border-white/5">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Avg XI Score</div>
            <div className="text-base font-black font-mono text-white">88.5</div>
          </div>
        </div>
      </div>

      {/* Primary Franchise Selection */}
      <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" /> Default Franchise
          </h3>
          <span className="text-xs font-mono text-zinc-400">{franchise.name}</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {OFFICIAL_FRANCHISES.map(f => (
            <button
              key={f.id}
              onClick={() => handleSelect(f.id)}
              className={`p-2.5 rounded-2xl border text-center font-black transition-all ${
                selectedFranchise === f.id
                  ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg scale-105'
                  : 'border-white/5 bg-surface-900 opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: selectedFranchise === f.id ? f.color : undefined, color: selectedFranchise === f.id ? f.textColor : undefined }}
            >
              <div className="text-xs">{f.short}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings & Info Links */}
      <div className="glass-card rounded-3xl p-2 border border-white/10 divide-y divide-white/5 text-xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-white/5 rounded-2xl transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-800 flex items-center justify-center text-zinc-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">BCCI Auction Rulebook</div>
              <div className="text-[10px] text-zinc-500">₹120 Cr Cap, 8 Overseas, 18-25 Squad</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

        <div className="p-3.5 flex items-center justify-between hover:bg-white/5 rounded-2xl transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-800 flex items-center justify-center text-zinc-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">100-Point Formula Spec</div>
              <div className="text-[10px] text-zinc-500">55 Quality, 15 Bat, 15 Bowl, 15 Role Fit</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>

        <div
          onClick={onLogout}
          className="p-3.5 flex items-center justify-between hover:bg-rose-500/10 rounded-2xl transition-colors cursor-pointer text-rose-400"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold">Sign Out</div>
              <div className="text-[10px] text-zinc-500">Switch franchise owner account</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-500/40" />
        </div>
      </div>
    </div>
  );
};

