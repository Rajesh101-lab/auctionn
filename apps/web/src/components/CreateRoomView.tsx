import React, { useState } from 'react';
import { Bot, Sliders, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';

interface CreateRoomViewProps {
  onCreate: (params: {
    roomName: string;
    purseLimit: number;
    timerSeconds: number;
    aiBotsEnabled: boolean;
  }) => void;
}

export const CreateRoomView: React.FC<CreateRoomViewProps> = ({ onCreate }) => {
  const [roomName, setRoomName] = useState('BCCI Grand War Room');
  const [purseLimit, setPurseLimit] = useState(120.0);
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [aiBotsEnabled, setAiBotsEnabled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      roomName: roomName.trim() || 'IPL Auction Arena',
      purseLimit,
      timerSeconds,
      aiBotsEnabled
    });
  };

  return (
    <div className="space-y-6 pb-24 text-zinc-100 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white">Create War Room</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configure room limits, clock speeds, and AI bot participation. You choose your franchise inside the lobby.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 border border-white/10 space-y-5">
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">War Room Title</label>
          <input
            type="text"
            required
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            className="w-full bg-surface-950 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Purse Cap</span>
            </label>
            <select
              value={purseLimit}
              onChange={e => setPurseLimit(Number(e.target.value))}
              className="w-full bg-surface-950 border border-white/10 rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value={100.0}>₹100.00 Cr</option>
              <option value={120.0}>₹120.00 Cr (Official)</option>
              <option value={140.0}>₹140.00 Cr (Mega)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Hammer Speed</span>
            </label>
            <select
              value={timerSeconds}
              onChange={e => setTimerSeconds(Number(e.target.value))}
              className="w-full bg-surface-950 border border-white/10 rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value={8}>8s (Fast Bids)</option>
              <option value={10}>10s (Standard)</option>
              <option value={15}>15s (Strategic)</option>
            </select>
          </div>
        </div>

        {/* AI Bots Toggle Card */}
        <div className="p-4 rounded-2xl bg-surface-950 border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>AI Archetype Bots</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              When ON, AI bids for unclaimed franchises. When OFF, only human owners can bid.
            </p>
          </div>
          <input
            type="checkbox"
            checked={aiBotsEnabled}
            onChange={e => setAiBotsEnabled(e.target.checked)}
            className="w-6 h-6 rounded accent-emerald-500 cursor-pointer shrink-0"
          />
        </div>

        {/* Capacity Info */}
        <div className="bg-surface-950/60 p-3.5 rounded-2xl border border-white/5 text-[11px] text-zinc-400 space-y-1">
          <div className="flex justify-between">
            <span>Franchise Owners:</span>
            <strong className="text-white">Up to 10 Teams</strong>
          </div>
          <div className="flex justify-between">
            <span>Spectators:</span>
            <strong className="text-white">Up to 20 Users</strong>
          </div>
          <div className="flex justify-between">
            <span>Team Claiming:</span>
            <strong className="text-amber-400">Inside Room Lobby</strong>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 active:scale-95 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Launch & Enter War Room Lobby</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

