import React, { useState, useMemo } from 'react';
import { Player } from '@ipl/shared-types';
import { Search, Trophy, Shield, Filter, ArrowUpDown } from 'lucide-react';

interface PlayerPointsTabProps {
  players: Player[];
}

export const PlayerPointsTab: React.FC<PlayerPointsTabProps> = ({ players }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [originFilter, setOriginFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'rating_asc' | 'base_desc' | 'set_asc'>('rating_desc');

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCountry = p.country.toLowerCase().includes(q);
          const matchSpecialty = p.specialty?.toLowerCase().includes(q);
          if (!matchName && !matchCountry && !matchSpecialty) return false;
        }

        if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
        if (originFilter === 'IND' && p.isOverseas) return false;
        if (originFilter === 'OS' && !p.isOverseas) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating_desc') return b.rating - a.rating;
        if (sortBy === 'rating_asc') return a.rating - b.rating;
        if (sortBy === 'base_desc') return b.basePrice - a.basePrice;
        if (sortBy === 'set_asc') return a.set - b.set;
        return 0;
      });
  }, [players, search, roleFilter, originFilter, sortBy]);

  const stats = useMemo(() => {
    const total = players.length;
    const sold = players.filter(p => p.status === 'SOLD').length;
    const avgRating = total > 0 ? (players.reduce((s, p) => s + p.rating, 0) / total).toFixed(1) : '0';
    return { total, sold, avgRating };
  }, [players]);

  return (
    <div className="space-y-4 pb-28 text-slate-200">
      {/* Directory Header Banner */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Player Points & Scouting Directory
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Full player roster with verified BCCI Points (OVR rating), base prices, sets & live auction status.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-slate-400">Total: </span>
            <span className="text-white font-bold">{stats.total}</span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-slate-400">Sold: </span>
            <span className="text-emerald-400 font-bold">{stats.sold}</span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-slate-400">Avg: </span>
            <span className="text-amber-300 font-bold">{stats.avgRating} OVR</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
        {/* Search */}
        <div className="relative sm:col-span-5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search player, country, specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        {/* Role Filter */}
        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/60 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Roles (All)</option>
            <option value="Batter">Batter</option>
            <option value="Bowler">Bowler</option>
            <option value="All-Rounder">All-Rounder</option>
            <option value="Wicketkeeper">Wicketkeeper</option>
          </select>
        </div>

        {/* Origin Filter */}
        <div className="sm:col-span-2">
          <select
            value={originFilter}
            onChange={e => setOriginFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/60 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Origins</option>
            <option value="IND">Indian (IND)</option>
            <option value="OS">Overseas (OS)</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="sm:col-span-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/60 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="rating_desc">OVR (High &rarr; Low)</option>
            <option value="rating_asc">OVR (Low &rarr; High)</option>
            <option value="base_desc">Base Price</option>
            <option value="set_asc">Set (1 to 6)</option>
          </select>
        </div>
      </div>

      {/* Players List Card View (Optimized for Mobile Touch) */}
      <div className="space-y-2">
        {filteredPlayers.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
            No players matching search criteria.
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const isSold = player.status === 'SOLD';
            const isUnsold = player.status === 'UNSOLD';

            return (
              <div
                key={player.id}
                className="glass-card rounded-2xl p-3.5 border border-white/10 flex items-center justify-between gap-3 glass-card-hover"
              >
                {/* Left: Player details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white truncate">
                      {player.name}
                    </span>
                    {player.isOverseas ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 font-mono">
                        OS
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                        IND
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      Set {player.set}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1.5 truncate">
                    <span>{player.role}</span>
                    <span>•</span>
                    <span className="text-slate-400">{player.country}</span>
                    {player.specialty && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400 truncate">{player.specialty}</span>
                      </>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-1.5">
                    {isSold ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono inline-block">
                        SOLD: {player.soldTo} • ₹{player.soldPrice?.toFixed(2)} Cr
                      </span>
                    ) : isUnsold ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-block">
                        UNSOLD {player.set < 6 ? '(Queued R6)' : ''}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700/60 inline-block font-mono">
                        Upcoming • Base ₹{player.basePrice.toFixed(2)} Cr
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Points (OVR) Badge */}
                <div className="text-right shrink-0">
                  <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Points</div>
                  <div className={`font-mono font-black text-sm sm:text-base px-2.5 py-1 rounded-xl border mt-0.5 ${
                    player.rating >= 93
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : player.rating >= 88
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700/60'
                  }`}>
                    {player.rating} pts
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
