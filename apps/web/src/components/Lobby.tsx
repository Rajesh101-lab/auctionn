import React, { useState } from 'react';
import { FranchiseId, ParticipantRole, OFFICIAL_FRANCHISES } from '@ipl/shared-types';
import { Gavel, Bot, Users, Trophy, Sparkles, Shield, ArrowRight } from 'lucide-react';

interface LobbyProps {
  onCreateRoom: (params: {
    roomName: string;
    nickname: string;
    purseLimit: number;
    timerSeconds: number;
    aiBotsEnabled: boolean;
    franchiseCode?: FranchiseId;
  }) => void;
  onJoinRoom: (params: {
    roomCode: string;
    nickname: string;
    role: ParticipantRole;
    franchiseCode?: FranchiseId;
  }) => void;
  onQuickStartSolo: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  onCreateRoom,
  onJoinRoom,
  onQuickStartSolo
}) => {
  const [mode, setMode] = useState<'landing' | 'create' | 'join'>('landing');

  // Create room state
  const [roomName, setRoomName] = useState('IPL Mega War Room');
  const [hostNickname, setHostNickname] = useState('Owner 1');
  const [purseLimit, setPurseLimit] = useState(120.0);
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [aiBotsEnabled, setAiBotsEnabled] = useState(true);
  const [selectedFranchise, setSelectedFranchise] = useState<FranchiseId>('CSK');

  // Join room state
  const [joinCode, setJoinCode] = useState('');
  const [joinNickname, setJoinNickname] = useState('Player');
  const [joinRole, setJoinRole] = useState<ParticipantRole>('OWNER');
  const [joinFranchise, setJoinFranchise] = useState<FranchiseId>('MI');

  if (mode === 'landing') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> BCCI Official Rulebook Compliant
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            AUCTIONN <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent">
              PRO SIMULATOR
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Experience the real high-stakes Auctionn. Server-authoritative multiplayer rooms, 10 franchise owners, 20 spectators, customizable AI bot bidding, 6-set rotation, and the 100-point Playing XI Championship calculator.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setMode('create')}
              className="px-6 py-3.5 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Gavel className="w-4 h-4" />
              <span>Host Custom Room</span>
            </button>
            <button
              onClick={() => setMode('join')}
              className="px-6 py-3.5 rounded-2xl bg-surface-800 hover:bg-surface-700 text-white font-bold text-sm border border-white/10 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Join via Room Code</span>
            </button>
            <button
              onClick={onQuickStartSolo}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 font-bold text-sm border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Quick Solo vs 9 AI Bots</span>
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gavel className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Official Increment Slabs</h3>
            <p className="text-xs text-zinc-400">
              Exact BCCI bidding slabs (+0.05 Cr &lt;1 Cr, +0.10 Cr 1–2 Cr, +0.20 Cr 2–5 Cr, +0.25 Cr &ge;5 Cr) with atomic race-condition safety.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Smart AI Archetypes & Toggle</h3>
            <p className="text-xs text-zinc-400">
              Star Hunters, Tactical Snipers, and Balanced Builders bid dynamically. Toggle AI bots ON or completely OFF with a single click.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">100-Point Playing XI</h3>
            <p className="text-xs text-zinc-400">
              Build your legal XI (≤ 4 OS, ≥ 1 WK) and get evaluated across 55 pts Quality, 15 pts Batting Depth, 15 pts Bowling Depth, and 15 pts Role Fit.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="rounded-3xl glass-card p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="space-y-1">
            <button
              onClick={() => setMode('landing')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              &larr; Back to Home
            </button>
            <h2 className="text-2xl font-black text-white">Create Auction Room</h2>
            <p className="text-xs text-zinc-400">Configure franchise purse limits, hammer timers, and AI bot settings.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Your Nickname</label>
              <input
                type="text"
                value={hostNickname}
                onChange={e => setHostNickname(e.target.value)}
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">Purse Cap per Team</label>
                <select
                  value={purseLimit}
                  onChange={e => setPurseLimit(Number(e.target.value))}
                  className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={100.0}>₹100.00 Cr</option>
                  <option value={120.0}>₹120.00 Cr (BCCI Default)</option>
                  <option value={140.0}>₹140.00 Cr</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">Hammer Countdown</label>
                <select
                  value={timerSeconds}
                  onChange={e => setTimerSeconds(Number(e.target.value))}
                  className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={8}>8 Seconds (Fast)</option>
                  <option value={10}>10 Seconds (Standard)</option>
                  <option value={15}>15 Seconds (Relaxed)</option>
                </select>
              </div>
            </div>

            {/* AI Bots Toggle */}
            <div className="p-4 rounded-2xl bg-surface-950/80 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span>Enable AI Bots (aiBotsEnabled)</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  AI bots manage and bid on all unclaimed franchises. Turn off for pure human-only auctions.
                </div>
              </div>
              <input
                type="checkbox"
                checked={aiBotsEnabled}
                onChange={e => setAiBotsEnabled(e.target.checked)}
                className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Select Franchise */}
            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Claim Your Franchise</label>
              <div className="grid grid-cols-5 gap-2">
                {OFFICIAL_FRANCHISES.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFranchise(f.id)}
                    className={`p-2.5 rounded-xl border text-center font-black transition-all ${
                      selectedFranchise === f.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg scale-105'
                        : 'border-white/5 bg-surface-900 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: selectedFranchise === f.id ? f.color : undefined, color: selectedFranchise === f.id ? f.textColor : undefined }}
                  >
                    {f.short}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onCreateRoom({
                roomName,
                nickname: hostNickname,
                purseLimit,
                timerSeconds,
                aiBotsEnabled,
                franchiseCode: selectedFranchise
              })}
              className="w-full py-3.5 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 text-zinc-950 font-black text-sm shadow-xl transition-all mt-4"
            >
              Launch Auction Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join mode
  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="rounded-3xl glass-card p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="space-y-1">
          <button
            onClick={() => setMode('landing')}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            &larr; Back to Home
          </button>
          <h2 className="text-2xl font-black text-white">Join Auction Room</h2>
          <p className="text-xs text-zinc-400">Enter a 6-character room code to join an ongoing auction.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-bold mb-1.5">Room Code</label>
            <input
              type="text"
              placeholder="e.g. IPL-94X"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3.5 py-2.5 font-mono text-base uppercase text-amber-400 tracking-wider placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-bold mb-1.5">Your Nickname</label>
            <input
              type="text"
              value={joinNickname}
              onChange={e => setJoinNickname(e.target.value)}
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-bold mb-1.5">Join Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setJoinRole('OWNER')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-center transition-all ${
                  joinRole === 'OWNER'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-surface-900 border-white/5 text-zinc-400'
                }`}
              >
                Franchise Owner (Max 10)
              </button>
              <button
                type="button"
                onClick={() => setJoinRole('SPECTATOR')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-center transition-all ${
                  joinRole === 'SPECTATOR'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'bg-surface-900 border-white/5 text-zinc-400'
                }`}
              >
                Spectator (Max 20)
              </button>
            </div>
          </div>

          {joinRole === 'OWNER' && (
            <div>
              <label className="block text-zinc-300 font-bold mb-1.5">Select Franchise</label>
              <div className="grid grid-cols-5 gap-2">
                {OFFICIAL_FRANCHISES.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setJoinFranchise(f.id)}
                    className={`p-2.5 rounded-xl border text-center font-black transition-all ${
                      joinFranchise === f.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg scale-105'
                        : 'border-white/5 bg-surface-900 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: joinFranchise === f.id ? f.color : undefined, color: joinFranchise === f.id ? f.textColor : undefined }}
                  >
                    {f.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onJoinRoom({
              roomCode: joinCode,
              nickname: joinNickname,
              role: joinRole,
              franchiseCode: joinRole === 'OWNER' ? joinFranchise : undefined
            })}
            disabled={!joinCode.trim()}
            className="w-full py-3.5 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 text-zinc-950 font-black text-sm shadow-xl transition-all disabled:opacity-40"
          >
            Enter War Room
          </button>
        </div>
      </div>
    </div>
  );
};

