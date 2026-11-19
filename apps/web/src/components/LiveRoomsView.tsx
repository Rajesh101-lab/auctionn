import React, { useState, useEffect } from 'react';
import { Users, Gavel, ArrowRight, RefreshCw, Bot, Shield, Plus } from 'lucide-react';
import { ParticipantRole } from '@ipl/shared-types';

interface LiveRoomsViewProps {
  onJoinRoom: (roomCode: string, role: ParticipantRole) => void;
  onCreateRoomClick: () => void;
}

export const LiveRoomsView: React.FC<LiveRoomsViewProps> = ({
  onJoinRoom,
  onCreateRoomClick
}) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [role, setRole] = useState<ParticipantRole>('OWNER');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:4000`;
      const res = await fetch(`${serverUrl}/api/rooms`);
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch {
      // Mock if offline
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onJoinRoom(manualCode.trim().toUpperCase(), role);
  };

  return (
    <div className="space-y-6 pb-24 text-zinc-100 max-w-2xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Live Auction Rooms</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Discover ongoing War Rooms or enter via invite room code.
          </p>
        </div>
        <button
          onClick={fetchRooms}
          className="p-2.5 rounded-2xl bg-surface-900 border border-white/10 hover:border-white/20 text-zinc-300 transition-colors"
          title="Refresh rooms"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick Join by Code */}
      <form onSubmit={handleManualJoin} className="glass-card rounded-3xl p-4 border border-white/10 space-y-3">
        <label className="block text-xs font-bold text-zinc-300">Join via Room Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. IPL-94X"
            value={manualCode}
            onChange={e => setManualCode(e.target.value.toUpperCase())}
            className="flex-1 bg-surface-950 border border-white/10 rounded-2xl px-4 py-3 font-mono text-base uppercase text-amber-400 tracking-wider placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="px-6 py-3 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 active:scale-95 text-zinc-950 font-black text-xs shadow-lg transition-all disabled:opacity-40"
          >
            Enter
          </button>
        </div>

        <div className="flex items-center gap-3 pt-1 text-xs">
          <span className="text-zinc-500">Join As:</span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="radio"
              checked={role === 'OWNER'}
              onChange={() => setRole('OWNER')}
              className="accent-emerald-500"
            />
            <span>Franchise Owner</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-zinc-300">
            <input
              type="radio"
              checked={role === 'SPECTATOR'}
              onChange={() => setRole('SPECTATOR')}
              className="accent-emerald-500"
            />
            <span>Spectator</span>
          </label>
        </div>
      </form>

      {/* Active Public Rooms List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span>Active Public War Rooms ({rooms.length})</span>
          <button
            onClick={onCreateRoomClick}
            className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" /> Host New Room
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center border border-white/10 space-y-3">
            <Users className="w-10 h-10 text-zinc-600 mx-auto" />
            <div className="text-sm font-bold text-zinc-300">No public rooms currently active</div>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Create a custom room with your preferred purse and hammer timer to invite others.
            </p>
            <button
              onClick={onCreateRoomClick}
              className="px-5 py-2.5 rounded-2xl bg-surface-800 hover:bg-surface-700 text-xs font-bold text-white border border-white/10 transition-colors"
            >
              Create First Room
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map(room => (
              <div
                key={room.code}
                className="glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between hover:border-emerald-500/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">{room.name}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {room.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                    <span>Purse: ₹{room.purseLimit} Cr</span>
                    <span>•</span>
                    <span>Clock: {room.timerSeconds}s</span>
                    <span>•</span>
                    <span>{room.participantsCount} Connected</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onJoinRoom(room.code, 'OWNER')}
                    className="px-3.5 py-2 rounded-xl bg-emeraldBid-500 hover:bg-emeraldBid-600 text-zinc-950 font-black text-xs transition-all"
                  >
                    Bid
                  </button>
                  <button
                    onClick={() => onJoinRoom(room.code, 'SPECTATOR')}
                    className="px-3 py-2 rounded-xl bg-surface-800 text-zinc-300 hover:text-white font-bold text-xs border border-white/10"
                  >
                    Watch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

