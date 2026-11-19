import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomSnapshot,
  FranchiseId,
  ParticipantRole,
  OFFICIAL_FRANCHISES
} from '@ipl/shared-types';
import { Lobby } from './components/Lobby';
import { Arena } from './components/Arena';
import { sounds } from './utils/sounds';
import { Gavel, Users, Trophy, Play } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:4000`;

export function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [myNickname, setMyNickname] = useState('Player');
  const [myFranchiseCode, setMyFranchiseCode] = useState<FranchiseId | null>(null);
  const [myRole, setMyRole] = useState<ParticipantRole>('OWNER');
  const [isHost, setIsHost] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const s = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('Connected to auction server with ID:', s.id);
    });

    s.on('ROOM_SNAPSHOT', (data: RoomSnapshot) => {
      setSnapshot(data);
      if (s.id === data.hostId) {
        setIsHost(true);
      }
    });

    s.on('BID_ACCEPTED', (data) => {
      sounds.playBid();
    });

    s.on('LOT_SETTLED', (data) => {
      if (data.outcome === 'SOLD') {
        sounds.playSold();
        sounds.playGavel();
      } else {
        sounds.playUnsold();
      }
    });

    s.on('ERROR_NOTIFICATION', (data) => {
      showToast(data.message);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const handleCreateRoom = (params: {
    roomName: string;
    nickname: string;
    purseLimit: number;
    timerSeconds: number;
    aiBotsEnabled: boolean;
    franchiseCode?: FranchiseId;
  }) => {
    if (!socket) return;
    setMyNickname(params.nickname);
    setMyRole('OWNER');
    setMyFranchiseCode(params.franchiseCode || null);
    setIsHost(true);

    socket.emit(
      'CREATE_ROOM',
      {
        roomName: params.roomName,
        nickname: params.nickname,
        purseLimit: params.purseLimit,
        timerSeconds: params.timerSeconds,
        aiBotsEnabled: params.aiBotsEnabled,
        role: 'OWNER',
        franchiseCode: params.franchiseCode
      },
      (res: any) => {
        if (!res.success) {
          showToast(res.error || 'Failed to create room.');
        } else {
          showToast(`Room created: ${res.roomCode}`);
        }
      }
    );
  };

  const handleJoinRoom = (params: {
    roomCode: string;
    nickname: string;
    role: ParticipantRole;
    franchiseCode?: FranchiseId;
  }) => {
    if (!socket) return;
    setMyNickname(params.nickname);
    setMyRole(params.role);
    setMyFranchiseCode(params.franchiseCode || null);

    socket.emit(
      'JOIN_ROOM',
      {
        roomCode: params.roomCode,
        nickname: params.nickname,
        role: params.role,
        franchiseCode: params.franchiseCode
      },
      (res: any) => {
        if (!res.success) {
          showToast(res.error || 'Failed to join room.');
        } else {
          showToast(`Joined room: ${params.roomCode}`);
        }
      }
    );
  };

  const handleQuickStartSolo = () => {
    handleCreateRoom({
      roomName: 'Solo Practice Arena',
      nickname: 'CSK Commander',
      purseLimit: 120.0,
      timerSeconds: 8,
      aiBotsEnabled: true,
      franchiseCode: 'CSK'
    });
  };

  const handleStartAuction = () => {
    if (!socket || !snapshot) return;
    socket.emit('START_AUCTION', { roomCode: snapshot.code });
  };

  const handleLeaveRoom = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-surface-950 text-zinc-100 flex flex-col font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-surface-900 border border-emerald-500/50 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Global Navbar */}
      <header className="sticky top-0 z-40 bg-surface-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleLeaveRoom}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-sm tracking-wide text-white flex items-center gap-1.5">
                <span>IPL MEGA AUCTION</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono border border-amber-500/30">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono -mt-0.5">
                Multiplayer Engine & XI Championship
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {snapshot && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Room:</span>
                <span className="font-mono font-bold text-amber-400 bg-surface-900 px-2.5 py-1 rounded-lg border border-white/10">
                  {snapshot.code}
                </span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-400 text-[11px] font-mono">BCCI Rules Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4">
        {!snapshot ? (
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onQuickStartSolo={handleQuickStartSolo}
          />
        ) : snapshot.status === 'LOBBY' ? (
          // Pre-Auction Team Selection Lobby
          <div className="max-w-4xl mx-auto py-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                WAR ROOM LOBBY: {snapshot.code}
              </span>
              <h1 className="text-3xl font-black text-white">{snapshot.name}</h1>
              <p className="text-xs text-zinc-400">
                10 IPL Franchises • ₹{snapshot.purseLimit} Cr Purse • Hammer: {snapshot.timerSeconds}s • AI Bots: {snapshot.aiBotsEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>

            {/* Franchise Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.values(snapshot.teams).map(team => {
                const isMine = team.id === myFranchiseCode;
                const isClaimedByOther = team.ownerId && team.ownerId !== socket?.id;

                return (
                  <div
                    key={team.id}
                    onClick={() => {
                      if (!isClaimedByOther && socket) {
                        socket.emit('SELECT_FRANCHISE', {
                          roomCode: snapshot.code,
                          franchiseCode: team.id
                        }, (res: any) => {
                          if (res.success) {
                            setMyFranchiseCode(team.id);
                            setMyRole('OWNER');
                          } else {
                            showToast(res.error || 'Cannot claim this franchise.');
                          }
                        });
                      }
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer relative ${
                      isMine
                        ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-xl scale-105'
                        : isClaimedByOther
                        ? 'opacity-40 border-white/5 bg-surface-900 cursor-not-allowed'
                        : 'border-white/10 bg-surface-900 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center font-black text-lg mb-2 shadow-md"
                      style={{ backgroundColor: team.color, color: team.textColor }}
                    >
                      {team.short}
                    </div>
                    <div className="font-bold text-xs text-white truncate">{team.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-1 truncate">
                      {team.ownerName}
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 mt-0.5">
                      ₹{team.purse.toFixed(0)} Cr
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lobby Action Controls */}
            <div className="rounded-3xl glass-card p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-400">
                Connected Participants: <strong className="text-white">{snapshot.participants.length}</strong> (Owners: {snapshot.participants.filter(p => p.role === 'OWNER').length}/10)
              </div>

              {isHost ? (
                <button
                  onClick={handleStartAuction}
                  className="px-8 py-3.5 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 text-zinc-950 font-black text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5" />
                  <span>COMMENCE MEGA AUCTION</span>
                </button>
              ) : (
                <div className="text-xs font-semibold text-amber-400 animate-pulse">
                  Waiting for host to start the auction...
                </div>
              )}
            </div>
          </div>
        ) : (
          // Live Auction Arena / Playing XI / Winner
          <Arena
            snapshot={snapshot}
            socket={socket}
            myNickname={myNickname}
            myFranchiseCode={myFranchiseCode}
            myRole={myRole}
            isHost={isHost}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </main>
    </div>
  );
}

export default App;

