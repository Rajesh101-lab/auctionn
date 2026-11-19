import React, { useState, useMemo } from 'react';
import { Player, PlayerRole } from '@ipl/shared-types';
import { Search, Trophy, Globe, User, ShieldCheck } from 'lucide-react';

interface PlayerPointsTabProps {
  players: Player[];
}

export const PlayerPointsTab: React.FC<PlayerPointsTabProps> = ({ players }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [originFilter, setOriginFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'rating_asc' | 'base_desc' | 'set_asc'>('rating_desc');

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => {
        if (search.trim()) {
          const matchName = p.name.toLowerCase().includes(search.toLowerCase());
          const matchCountry = p.country.toLowerCase().includes(search.toLowerCase());
          const matchSpecialty = p.specialty?.toLowerCase().includes(search.toLowerCase());
          if (!matchName && !matchCountry && !matchSpecialty) return false;
        }

        if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
        if (originFilter === 'IND' && p.isOverseas) return false;
        if (originFilter === 'OS' && !p.isOverseas) return false;
        if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating_desc') return b.rating - a.rating;
        if (sortBy === 'rating_asc') return a.rating - b.rating;
        if (sortBy === 'base_desc') return b.basePrice - a.basePrice;
        if (sortBy === 'set_asc') return a.set - b.set;
        return 0;
      });
  }, [players, search, roleFilter, originFilter, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = players.length;
    const sold = players.filter(p => p.status === 'SOLD').length;
    const avgRating = total > 0 ? (players.reduce((s, p) => s + p.rating, 0) / total).toFixed(1) : '0';
    return { total, sold, avgRating };
  }, [players]);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-900 border border-white/10 rounded-2xl p-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            IPL Mega Auction Player Points Directory
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Full scout roster with Player Points (OVR rating), base prices, sets, and live auction status.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-surface-800 border border-white/5">
            <span className="text-zinc-400">Total Players: </span>
            <span className="text-white font-bold">{stats.total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-surface-800 border border-white/5">
            <span className="text-zinc-400">Sold: </span>
            <span className="text-emerald-400 font-bold">{stats.sold}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-surface-800 border border-white/5">
            <span className="text-zinc-400">Avg Points: </span>
            <span className="text-amber-400 font-bold">{stats.avgRating} OVR</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by player name, country, specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-surface-900 border border-white/10 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Roles</option>
          <option value="Batter">Batter</option>
          <option value="Bowler">Bowler</option>
          <option value="All-Rounder">All-Rounder</option>
          <option value="Wicketkeeper">Wicketkeeper</option>
        </select>

        {/* Origin Filter */}
        <select
          value={originFilter}
          onChange={e => setOriginFilter(e.target.value)}
          className="px-3 py-2 bg-surface-900 border border-white/10 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Origins</option>
          <option value="IND">Indian (IND)</option>
          <option value="OS">Overseas (OS)</option>
        </select>

        {/* Sort Filter */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-surface-900 border border-white/10 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="rating_desc">Points: Highest First (OVR ↓)</option>
          <option value="rating_asc">Points: Lowest First (OVR ↑)</option>
          <option value="base_desc">Base Price: High to Low</option>
          <option value="set_asc">Set: Order (1 to 6)</option>
        </select>
      </div>

      {/* Players Table */}
      <div className="bg-surface-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-surface-950 text-zinc-400 font-bold uppercase tracking-wider border-b border-white/10 z-10">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-3 text-center">Points (OVR)</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Country</th>
                <th className="py-3 px-3">Set</th>
                <th className="py-3 px-3 text-right">Base Price</th>
                <th className="py-3 px-4 text-center">Status / Winning Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    No players matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const isSold = player.status === 'SOLD';
                  const isUnsold = player.status === 'UNSOLD';

                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Upcoming (Set {player.set})
                    </span>
                  );

                  if (isSold) {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        SOLD: {player.soldTo} • ₹{player.soldPrice?.toFixed(2)} Cr
                      </span>
                    );
                  } else if (isUnsold) {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        UNSOLD {player.set < 6 ? '(Acc. R6)' : ''}
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            {player.name}
                            {player.isOverseas && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                                OS
                              </span>
                            )}
                          </div>
                        </div>
                        {player.specialty && (
                          <div className="text-[11px] text-zinc-400 truncate max-w-xs">
                            {player.specialty}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block font-mono font-black text-xs px-2.5 py-1 rounded-lg border ${
                            player.rating >= 93
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : player.rating >= 88
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : player.rating >= 85
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {player.rating} pts
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-zinc-300">
                        {player.role}
                      </td>

                      <td className="py-3 px-3 text-zinc-400 font-mono">
                        {player.country}
                      </td>

                      <td className="py-3 px-3 font-mono text-zinc-400">
                        Set {player.set}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        ₹{player.basePrice.toFixed(2)} Cr
                      </td>

                      <td className="py-3 px-4 text-center">
                        {statusBadge}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

