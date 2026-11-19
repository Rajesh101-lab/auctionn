import React, { useState } from 'react';
import { MatchHistoryView } from './MatchHistoryView';
import {
  User,
  Shield,
  Trophy,
  History,
  LogOut,
  Sliders,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export interface PlayerProfile {
  id: string;
  name: string;
  email: string;
}

interface ProfileViewProps {
  player: PlayerProfile;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ player, onLogout }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'history'>('overview');

  return (
    <div className="space-y-6 pb-24 text-zinc-100 max-w-2xl mx-auto">
      {/* Profile Card Header */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 flex items-center justify-center font-black text-2xl text-white shadow-xl ring-4 ring-white/10">
            {player.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{player.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                PRO PLAYER
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{player.email}</p>
            <div className="text-[10px] text-amber-400 font-mono mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3" /> BCCI Verified Owner Account
            </div>
          </div>
        </div>

        {/* Career Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center font-mono">
          <div className="bg-surface-950 p-2.5 rounded-2xl border border-white/5">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Auctions</div>
            <div className="text-base font-black text-white">4</div>
          </div>
          <div className="bg-surface-950 p-2.5 rounded-2xl border border-white/5">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Trophies</div>
            <div className="text-base font-black text-amber-400">2 🏆</div>
          </div>
          <div className="bg-surface-950 p-2.5 rounded-2xl border border-white/5">
            <div className="text-[10px] text-zinc-500 uppercase font-bold">Win Rate</div>
            <div className="text-base font-black text-emerald-400">75%</div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Overview vs Match History */}
      <div className="flex border-b border-white/10 pb-2 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSection('overview')}
          className={`pb-1.5 transition-all flex items-center gap-1.5 ${
            activeSection === 'overview'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Player Overview & Rules</span>
        </button>

        <button
          onClick={() => setActiveSection('history')}
          className={`pb-1.5 transition-all flex items-center gap-1.5 ${
            activeSection === 'history'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Match History & XI Scores</span>
        </button>
      </div>

      {/* Content depending on section */}
      {activeSection === 'history' ? (
        <MatchHistoryView />
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-2 border border-white/10 divide-y divide-white/5 text-xs">
            <div className="p-3.5 flex items-center justify-between hover:bg-white/5 rounded-2xl transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-800 flex items-center justify-center text-zinc-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">BCCI Mega Auction Regulations</div>
                  <div className="text-[10px] text-zinc-500">Official increment slabs, ₹120 Cr purse, 8 overseas max</div>
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
                  <div className="font-bold text-white">100-Point Playing XI Calculator</div>
                  <div className="text-[10px] text-zinc-500">55 Quality, 15 Batting, 15 Bowling, 15 Role Fit</div>
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
                  <div className="text-[10px] text-zinc-500">Change account or switch player identity</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-500/40" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
