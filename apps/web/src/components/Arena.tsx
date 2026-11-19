import React, { useState, useEffect } from 'react';
import {
  RoomSnapshot,
  FranchiseId,
  calculateMaxAllowableBid,
  canPlaceBid
} from '@ipl/shared-types';
import { Socket } from 'socket.io-client';
import { PlayerPointsTab } from './PlayerPointsTab';
import { PlayingXIBuilder } from './PlayingXIBuilder';
import { WinnerLeaderboard } from './WinnerLeaderboard';
import { sounds } from '../utils/sounds';
import {
  Gavel,
  Clock,
  Send,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  Bot,
  AlertCircle,
  MessageSquare,
  Shield,
  Users,
  BookOpen
} from 'lucide-react';

interface ArenaProps {
  snapshot: RoomSnapshot;
  socket: Socket | null;
  myNickname: string;
  myFranchiseCode: FranchiseId | null;
  myRole: 'OWNER' | 'SPECTATOR';
  isHost: boolean;
  onLeaveRoom: () => void;
}

export const Arena: React.FC<ArenaProps> = ({
  snapshot,
  socket,
  myNickname,
  myFranchiseCode,
  myRole,
  isHost,
  onLeaveRoom
}) => {
  const [activeTab, setActiveTab] = useState<'auction' | 'activity' | 'squad' | 'teams' | 'points' | 'rules'>('auction');
  const [chatInput, setChatInput] = useState('');
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const [hasSubmittedXI, setHasSubmittedXI] = useState<boolean>(false);

  useEffect(() => {
    const updateTimer = () => {
      if (!snapshot.hammerEndsAt || snapshot.lotResolved || snapshot.isPaused) {
        setTimeLeftMs(0);
        return;
      }
      const diff = Math.max(0, snapshot.hammerEndsAt - Date.now());
      setTimeLeftMs(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 50);
    return () => clearInterval(interval);
  }, [snapshot.hammerEndsAt, snapshot.lotResolved, snapshot.isPaused]);

  const currentPlayer = snapshot.currentPlayer;
  const myTeam = myFranchiseCode ? snapshot.teams[myFranchiseCode] : null;

  const nextBid = snapshot.nextBid;
  const maxBid = myTeam ? calculateMaxAllowableBid(myTeam) : 0;
  const canBidCheck = myTeam && currentPlayer
    ? canPlaceBid(myTeam, currentPlayer, nextBid, snapshot.highestBidderId, snapshot.aiBotsEnabled)
    : { allowed: false, reason: 'Spectator mode' };

  const handlePlaceBid = () => {
    if (!socket || !canBidCheck.allowed) return;
    sounds.playBid();
    socket.emit('PLACE_BID', {
      roomCode: snapshot.code,
      expectedBid: nextBid
    });
  };

  const handleSkipVote = () => {
    if (!socket || snapshot.hasAnyBid) return;
    socket.emit('VOTE_SKIP', { roomCode: snapshot.code });
  };

  const handleTogglePause = () => {
    if (!socket || !isHost) return;
    socket.emit('TOGGLE_PAUSE', { roomCode: snapshot.code });
  };

  const handleToggleBots = () => {
    if (!socket || !isHost) return;
    socket.emit('SET_AI_BOTS', {
      roomCode: snapshot.code,
      aiBotsEnabled: !snapshot.aiBotsEnabled
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    socket.emit('SEND_CHAT', { roomCode: snapshot.code, text: chatInput.trim() });
    setChatInput('');
  };

  const handleSubmitXI = (playerIds: string[]) => {
    if (!socket) return;
    socket.emit('SUBMIT_PLAYING_XI', { roomCode: snapshot.code, playerIds }, (res: any) => {
      if (res.success) {
        setHasSubmittedXI(true);
      }
    });
  };

  if (snapshot.status === 'COMPLETED' && snapshot.leaderboard) {
    return (
      <WinnerLeaderboard
        leaderboard={snapshot.leaderboard}
        myTeamId={myFranchiseCode || undefined}
        onPlayAgain={onLeaveRoom}
      />
    );
  }

  if (snapshot.status === 'XI_SUBMISSION' && myTeam) {
    return (
      <PlayingXIBuilder
        myTeam={myTeam}
        onSubmit={handleSubmitXI}
        hasSubmitted={hasSubmittedXI || !!snapshot.submissions[myTeam.id]}
        savedBreakdown={snapshot.submissions[myTeam.id]?.breakdown}
      />
    );
  }

  const secondsDisplay = (timeLeftMs / 1000).toFixed(1);
  const timerPercentage = snapshot.timerSeconds > 0
    ? Math.min(100, Math.max(0, (timeLeftMs / (snapshot.timerSeconds * 1000)) * 100))
    : 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-20 md:pb-6 max-w-7xl mx-auto space-y-3">
      {/* Top Status & Controls Bar */}
      <div className="flex items-center justify-between gap-2 bg-surface-900 border border-white/10 rounded-2xl px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-black text-[11px] text-white uppercase tracking-wider truncate max-w-[140px] sm:max-w-none">
            {snapshot.currentSet === 6 ? 'SET 6: ACCELERATED' : `SET ${snapshot.currentSet} / 6`}
          </span>
          <span className="text-zinc-600 font-mono text-[10px]">#{snapshot.currentPlayerIndex + 1}</span>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSkipVote}
            disabled={snapshot.hasAnyBid || snapshot.lotResolved || myRole !== 'OWNER'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-800 text-[11px] font-bold text-rose-300 border border-rose-500/20 disabled:opacity-30"
          >
            <SkipForward className="w-3 h-3 text-rose-400" />
            <span>Skip</span>
            <span className="text-[9px] font-mono opacity-80">
              ({snapshot.skipVotes.length}/{snapshot.skipVotersRequired})
            </span>
          </button>

          {isHost && (
            <>
              <button
                onClick={handleTogglePause}
                className="p-1.5 rounded-xl bg-surface-800 text-zinc-300 border border-white/10"
                title="Pause/Resume"
              >
                {snapshot.isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              </button>
              <button
                onClick={handleToggleBots}
                className={`p-1.5 rounded-xl border ${
                  snapshot.aiBotsEnabled ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' : 'bg-surface-800 text-zinc-500 border-white/10'
                }`}
                title="Toggle AI Bots"
              >
                <Bot className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {myTeam && (
            <div
              className="px-2 py-0.5 rounded-lg font-black text-[11px]"
              style={{ backgroundColor: myTeam.color, color: myTeam.textColor }}
            >
              {myTeam.short}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Top Navigation Tabs (Sticky) */}
      <div className="flex items-center bg-surface-900 border border-white/10 rounded-2xl p-1 gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('auction')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-center text-xs font-bold transition-all ${
            activeTab === 'auction' ? 'bg-surface-800 text-white shadow' : 'text-zinc-400'
          }`}
        >
          Paddle
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={`flex-1 min-w-[90px] py-1.5 px-2 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'points' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Player Points</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 min-w-[80px] py-1.5 px-2 rounded-xl text-center text-xs font-bold transition-all ${
            activeTab === 'activity' ? 'bg-surface-800 text-white shadow' : 'text-zinc-400'
          }`}
        >
          Activity & Chat
        </button>
        <button
          onClick={() => setActiveTab('squad')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-center text-xs font-bold transition-all ${
            activeTab === 'squad' ? 'bg-surface-800 text-white shadow' : 'text-zinc-400'
          }`}
        >
          My Squad {myTeam ? `(${myTeam.squad.length})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-center text-xs font-bold transition-all ${
            activeTab === 'teams' ? 'bg-surface-800 text-white shadow' : 'text-zinc-400'
          }`}
        >
          10 Teams
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 min-w-[60px] py-1.5 px-2 rounded-xl text-center text-xs font-bold transition-all ${
            activeTab === 'rules' ? 'bg-surface-800 text-white shadow' : 'text-zinc-400'
          }`}
        >
          Rules
        </button>
      </div>

      {/* Main View Area based on Active Tab */}
      <div className="flex-1">
        {/* AUCTION PADDLE VIEW */}
        {activeTab === 'auction' && (
          <div className="space-y-4">
            {currentPlayer ? (
              <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-2xl">
                {/* Player Card Header */}
                <div className="p-4 sm:p-6 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-800 text-zinc-400">
                          {currentPlayer.setName || `SET ${currentPlayer.set}`}
                        </span>
                        {currentPlayer.isOverseas ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            OS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            IND
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
                        {currentPlayer.name}
                      </h1>
                      <div className="text-xs font-semibold text-zinc-400 mt-0.5">
                        {currentPlayer.role} • {currentPlayer.country}
                        {currentPlayer.specialty && ` • ${currentPlayer.specialty}`}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[9px] font-bold uppercase text-zinc-400">OVR Points</div>
                      <div className="font-mono font-black text-lg sm:text-xl px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {currentPlayer.rating} pts
                      </div>
                    </div>
                  </div>

                  {/* Pricing Overview */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
                    <div className="bg-surface-950 p-2.5 rounded-xl border border-white/5">
                      <div className="text-[9px] uppercase font-bold text-zinc-500">Base Price</div>
                      <div className="text-base font-bold font-mono text-zinc-300">
                        ₹{currentPlayer.basePrice.toFixed(2)} Cr
                      </div>
                    </div>
                    <div className="bg-surface-950 p-2.5 rounded-xl border border-white/5 text-right">
                      <div className="text-[9px] uppercase font-bold text-zinc-500">Current Highest Bid</div>
                      <div className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                        {snapshot.hasAnyBid ? `₹${snapshot.currentBid.toFixed(2)} Cr` : 'Opening Bid'}
                      </div>
                      {snapshot.highestBidderName && (
                        <div className="text-[10px] font-bold text-amber-400 truncate">
                          {snapshot.highestBidderName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hammer Countdown Bar */}
                <div className="px-4 py-2 bg-surface-950 border-t border-b border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hammer Timer</span>
                  </div>
                  <div className={`font-mono font-black ${timeLeftMs < 3000 ? 'text-rose-500 animate-pulse text-sm' : 'text-zinc-200'}`}>
                    {snapshot.lotResolved ? 'LOT CLOSED' : `${secondsDisplay}s`}
                  </div>
                </div>

                <div className="w-full bg-surface-900 h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      timeLeftMs < 3000 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${timerPercentage}%` }}
                  />
                </div>

                {/* Action Area */}
                <div className="p-4 sm:p-6 bg-surface-950/70 space-y-3">
                  {myTeam ? (
                    <>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">
                          Purse: <strong className="text-white">₹{myTeam.purse.toFixed(2)} Cr</strong>
                        </span>
                        <span className="text-zinc-400">
                          Max Bid: <strong className="text-amber-400">₹{maxBid.toFixed(2)} Cr</strong>
                        </span>
                      </div>

                      <button
                        onClick={handlePlaceBid}
                        disabled={!canBidCheck.allowed || snapshot.lotResolved || snapshot.isPaused}
                        className="w-full py-4 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 active:scale-[0.98] text-zinc-950 font-black text-lg shadow-xl bid-btn-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Gavel className="w-5 h-5" />
                        <span>BID ₹{nextBid.toFixed(2)} Cr</span>
                      </button>

                      {!canBidCheck.allowed && (
                        <div className="flex items-center gap-1.5 text-[11px] text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{canBidCheck.reason}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 text-center text-xs text-zinc-400 bg-surface-900 rounded-xl">
                      Watching as <strong>Spectator</strong>.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-zinc-400 glass-card rounded-2xl">
                Preparing next lot...
              </div>
            )}

            {/* Live 10 Teams Quick Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {Object.values(snapshot.teams).map(t => (
                <div
                  key={t.id}
                  className={`p-2 rounded-xl border text-[11px] ${
                    snapshot.highestBidderId === t.id
                      ? 'border-emerald-500/80 bg-emerald-950/20 shadow'
                      : 'bg-surface-900 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center font-black text-[9px]"
                      style={{ backgroundColor: t.color, color: t.textColor }}
                    >
                      {t.short}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-[10px]">
                      ₹{t.purse.toFixed(1)}Cr
                    </span>
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate mt-0.5">
                    {t.squad.length} pl ({t.overseasCount} OS)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAYER POINTS DIRECTORY VIEW */}
        {activeTab === 'points' && (
          <PlayerPointsTab players={snapshot.allPlayers} />
        )}

        {/* ACTIVITY & CHAT VIEW */}
        {activeTab === 'activity' && (
          <div className="rounded-3xl glass-card border border-white/10 p-4 flex flex-col h-[520px] justify-between">
            <div className="space-y-2 overflow-y-auto pr-1">
              {snapshot.activityFeed.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl text-xs border ${
                    item.type === 'sold'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : item.type === 'unsold'
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      : item.type === 'bid'
                      ? 'bg-surface-900 border-white/5 text-zinc-200'
                      : 'bg-surface-950/60 border-white/5 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-0.5">
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    {item.teamName && <span className="font-bold text-zinc-400">{item.teamName}</span>}
                  </div>
                  <div className="font-medium">{item.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-white/10 mt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message War Room..."
                className="flex-1 bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-surface-800 text-zinc-200 border border-white/10"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* MY SQUAD VIEW */}
        {activeTab === 'squad' && (
          <div className="rounded-3xl glass-card border border-white/10 p-4 space-y-3">
            {myTeam ? (
              <>
                <div className="bg-surface-900 p-3 rounded-2xl border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-zinc-500">Bought: </span>
                    <span className="text-white font-bold">{myTeam.squad.length}/25</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">OS: </span>
                    <span className="text-sky-400 font-bold">{myTeam.overseasCount}/8</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Purse: </span>
                    <span className="text-emerald-400 font-bold">₹{myTeam.purse.toFixed(2)} Cr</span>
                  </div>
                </div>

                {myTeam.squad.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    No players acquired yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[440px] overflow-y-auto">
                    {myTeam.squad.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-surface-900 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {p.name}
                            {p.isOverseas && <span className="px-1 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-400">OS</span>}
                          </div>
                          <div className="text-[11px] text-zinc-400">{p.role}</div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-emerald-400 font-bold">₹{p.boughtPrice.toFixed(2)} Cr</div>
                          <div className="text-[10px] text-amber-400">{p.rating} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No franchise selected.
              </div>
            )}
          </div>
        )}

        {/* 10 TEAMS OVERVIEW */}
        {activeTab === 'teams' && (
          <div className="rounded-3xl glass-card border border-white/10 p-4 space-y-2 max-h-[520px] overflow-y-auto">
            {Object.values(snapshot.teams).map((team) => (
              <div
                key={team.id}
                className="p-3 rounded-2xl bg-surface-900 border border-white/5 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center font-black text-[10px]"
                      style={{ backgroundColor: team.color, color: team.textColor }}
                    >
                      {team.short}
                    </span>
                    <span className="font-bold text-white">{team.name}</span>
                    <span className="text-[10px] text-zinc-500">({team.ownerName})</span>
                  </div>
                  <div className="font-mono text-emerald-400 font-bold">
                    ₹{team.purse.toFixed(2)} Cr
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/5 font-mono">
                  <span>Squad: {team.squad.length}/25</span>
                  <span>OS: {team.overseasCount}/8</span>
                  <span>Max: ₹{calculateMaxAllowableBid(team).toFixed(2)} Cr</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RULES VIEW */}
        {activeTab === 'rules' && (
          <div className="rounded-3xl glass-card border border-white/10 p-5 space-y-3 text-xs text-zinc-300">
            <div className="p-3 rounded-xl bg-surface-900 border border-white/5 space-y-1">
              <div className="font-bold text-white">Bid Increments:</div>
              <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                <li>&lt; ₹1.00 Cr: +₹0.05 Cr</li>
                <li>₹1.00 – ₹2.00 Cr: +₹0.10 Cr</li>
                <li>₹2.00 – ₹5.00 Cr: +₹0.20 Cr</li>
                <li>&ge; ₹5.00 Cr: +₹0.25 Cr</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-surface-900 border border-white/5 space-y-1">
              <div className="font-bold text-white">Playing XI Score (100 Pts):</div>
              <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                <li>55 pts: Raw Player Quality (Average OVR)</li>
                <li>15 pts: Batting Depth (7 options target)</li>
                <li>15 pts: Bowling Depth (5-6 options target)</li>
                <li>15 pts: Role Fit (&ge;1 WK, 4-7 Bat, 4-6 Bowl)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
