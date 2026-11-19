import React from 'react';
import { Trophy, Award, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';

export interface MatchHistoryEntry {
  id: string;
  roomCode: string;
  date: string;
  winnerTeam: string;
  winnerOwner: string;
  winningScore: number;
  myTeam?: string;
  myScore?: number;
  myRank?: number;
}

export const MatchHistoryView: React.FC = () => {
  // Mock historical matches
  const history: MatchHistoryEntry[] = [
    {
      id: 'm1',
      roomCode: 'IPL-94X',
      date: 'Today, 2:30 AM',
      winnerTeam: 'Chennai Super Kings',
      winnerOwner: 'Rajesh Sharma',
      winningScore: 92.4,
      myTeam: 'CSK',
      myScore: 92.4,
      myRank: 1
    },
    {
      id: 'm2',
      roomCode: 'IPL-88A',
      date: 'Yesterday, 11:15 PM',
      winnerTeam: 'Mumbai Indians',
      winnerOwner: 'MI Bot (Tactical)',
      winningScore: 89.2,
      myTeam: 'RCB',
      myScore: 86.8,
      myRank: 3
    },
    {
      id: 'm3',
      roomCode: 'IPL-12B',
      date: '18 Nov 2026',
      winnerTeam: 'Kolkata Knight Riders',
      winnerOwner: 'Amit K.',
      winningScore: 91.0,
      myTeam: 'GT',
      myScore: 88.5,
      myRank: 2
    }
  ];

  return (
    <div className="space-y-6 pb-24 text-zinc-100 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white">Championship History</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Past auction war rooms, final Playing XI scores, and champions.
        </p>
      </div>

      <div className="space-y-3">
        {history.map(item => (
          <div
            key={item.id}
            className="glass-card rounded-3xl p-5 border border-white/10 space-y-3 hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  {item.roomCode}
                </span>
                <span className="text-xs text-zinc-400">{item.date}</span>
              </div>
              {item.myRank === 1 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> CHAMPION
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs text-zinc-400">Auction Winner</div>
                <div className="text-base font-black text-white">{item.winnerTeam}</div>
                <div className="text-[11px] text-zinc-500">{item.winnerOwner}</div>
              </div>

              <div className="text-right font-mono">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Winning XI Score</div>
                <div className="text-2xl font-black text-emerald-400">{item.winningScore}/100</div>
              </div>
            </div>

            {item.myTeam && (
              <div className="bg-surface-950 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">
                  Your Squad: <strong className="text-white">{item.myTeam}</strong>
                </span>
                <span className="text-zinc-400">
                  Your Score: <strong className="text-amber-400">{item.myScore}/100</strong> (Rank #{item.myRank})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

