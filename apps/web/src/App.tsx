import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomSnapshot,
  FranchiseId,
  ParticipantRole,
  OFFICIAL_FRANCHISES,
  INITIAL_PLAYER_DATA
} from '@ipl/shared-types';
import {
  UserButton,
  useUser,
  useClerk
} from '@clerk/react';
import { PlayerAuth } from './components/PlayerAuth';
import { HomeView } from './components/HomeView';
import { LiveRoomsView } from './components/LiveRoomsView';
import { CreateRoomView } from './components/CreateRoomView';
import { PlayerPointsTab } from './components/PlayerPointsTab';
import { ProfileView } from './components/ProfileView';
import { Arena } from './components/Arena';
import { sounds } from './utils/sounds';
import {
  Home,
  Radio,
  PlusCircle,
  Sparkles,
  User,
  LogOut,
  Play,
  ArrowLeft
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || `${window.location.protocol}//${window.location.hostname}:4000`;

export function App() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Navigation Tabs: home | live_rooms | create_room | players | profile
  const [currentTab, setCurrentTab] = useState<'home' | 'live_rooms' | 'create_room' | 'players' | 'profile'>('home');
  const [isGuest, setIsGuest] = useState(false);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [myFranchiseCode, setMyFranchiseCode] = useState<FranchiseId | null>(null);
  const [myRole, setMyRole] = useState<ParticipantRole>('OWNER');
  const [isHost, setIsHost] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const playerName = clerkUser?.fullName || clerkUser?.firstName || (isGuest ? 'Guest Player' : 'Player');
  const playerEmail = clerkUser?.primaryEmailAddress?.emailAddress || (isGuest ? 'guest@auctionn.com' : 'player@auctionn.com');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const s = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('Socket connected:', s.id);
    });

    s.on('ROOM_SNAPSHOT', (data: RoomSnapshot) => {
      setSnapshot(data);
      if (s.id === data.hostId) {
        setIsHost(true);
      }
    });

    s.on('BID_ACCEPTED', () => {
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
    purseLimit: number;
    timerSeconds: number;
    aiBotsEnabled: boolean;
  }) => {
    if (!socket) return;
    setMyRole('OWNER');
    setMyFranchiseCode(null);
    setIsHost(true);

    socket.emit(
      'CREATE_ROOM',
      {
        roomName: params.roomName,
        nickname: playerName,
        purseLimit: params.purseLimit,
        timerSeconds: params.timerSeconds,
        aiBotsEnabled: params.aiBotsEnabled,
        role: 'OWNER'
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

  const handleJoinRoom = (roomCode: string, role: ParticipantRole) => {
    if (!socket) return;
    setMyRole(role);
    setMyFranchiseCode(null);

    socket.emit(
      'JOIN_ROOM',
      {
        roomCode,
        nickname: playerName,
        role
      },
      (res: any) => {
        if (!res.success) {
          showToast(res.error || 'Failed to join room.');
        } else {
          showToast(`Joined war room ${roomCode}`);
        }
      }
    );
  };

  const handleQuickStartSolo = () => {
    handleCreateRoom({
      roomName: 'Solo War Room Arena',
      purseLimit: 120.0,
      timerSeconds: 8,
      aiBotsEnabled: true
    });
  };

  const handleStartAuction = () => {
    if (!socket || !snapshot) return;
    socket.emit('START_AUCTION', { roomCode: snapshot.code });
  };

  const handleLeaveAuction = () => {
    setSnapshot(null);
    setCurrentTab('home');
  };

  // If user is not signed in and hasn't chosen guest mode
  if (isLoaded && !clerkUser && !isGuest) {
    return <PlayerAuth onGuest={() => setIsGuest(true)} />;
  }

  return (
    <div className="min-h-screen bg-surface-950 text-zinc-100 flex flex-col font-sans select-none antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-surface-900/95 border border-emerald-500/50 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 max-w-[90vw] animate-pop">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Mobile Bar with Clerk UserButton */}
      <header className="sticky top-0 z-40 bg-surface-950/95 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {snapshot && (
            <button
              onClick={handleLeaveAuction}
              className="mr-1 p-1.5 rounded-xl bg-surface-900 border border-white/10 text-zinc-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>AUCTIONN</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-mono border border-amber-500/30">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              {snapshot ? `War Room: ${snapshot.code}` : playerName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {snapshot ? (
            <button
              onClick={handleLeaveAuction}
              className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold"
            >
              Leave Room
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {clerkUser ? (
                <UserButton />
              ) : (
                <button
                  onClick={() => setIsGuest(false)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 p-3.5 sm:p-5 max-w-4xl mx-auto w-full">
        {snapshot ? (
          snapshot.status === 'LOBBY' ? (
            // Pre-Auction Team Selection Lobby
            <div className="space-y-6 pb-20">
              <div className="text-center space-y-1">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  WAR ROOM: {snapshot.code}
                </span>
                <h1 className="text-2xl font-black text-white">{snapshot.name}</h1>
                <p className="text-[11px] text-zinc-400">
                  Purse: ₹{snapshot.purseLimit} Cr • Timer: {snapshot.timerSeconds}s • AI Bots: {snapshot.aiBotsEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-xs text-emerald-400 font-semibold pt-1">
                  👇 Tap an available franchise card below to claim and command that team!
                </p>
              </div>

              {/* 10 Franchises Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {Object.values(snapshot.teams).map((team) => {
                  const isMine = team.id === myFranchiseCode;
                  const isClaimedOther = team.ownerId && team.ownerId !== socket?.id;

                  return (
                    <div
                      key={team.id}
                      onClick={() => {
                        if (!isClaimedOther && socket) {
                          socket.emit(
                            'SELECT_FRANCHISE',
                            { roomCode: snapshot.code, franchiseCode: team.id },
                            (res: any) => {
                              if (res.success) {
                                setMyFranchiseCode(team.id);
                                setMyRole('OWNER');
                              } else {
                                showToast(res.error || 'Cannot claim team.');
                              }
                            }
                          );
                        }
                      }}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        isMine
                          ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-xl scale-105'
                          : isClaimedOther
                          ? 'opacity-40 border-white/5 bg-surface-900 cursor-not-allowed'
                          : 'border-white/10 bg-surface-900 hover:border-white/20'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-black text-base mb-1.5 shadow"
                        style={{ backgroundColor: team.color, color: team.textColor }}
                      >
                        {team.short}
                      </div>
                      <div className="font-bold text-xs text-white truncate">{team.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 truncate">{team.ownerName}</div>
                      <div className="text-[9px] font-mono text-emerald-400 mt-1">₹{team.purse} Cr</div>
                    </div>
                  );
                })}
              </div>

              <div className="glass-card rounded-3xl p-5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-zinc-400">
                  Participants: <strong className="text-white">{snapshot.participants.length}</strong> (Owners: {snapshot.participants.filter(p => p.role === 'OWNER').length}/10)
                </div>
                {isHost ? (
                  <button
                    onClick={handleStartAuction}
                    className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-emeraldBid-500 hover:bg-emeraldBid-600 text-zinc-950 font-black text-xs shadow-xl flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>COMMENCE MEGA AUCTION</span>
                  </button>
                ) : (
                  <div className="text-xs text-amber-400 animate-pulse font-semibold">
                    Waiting for room host to start the auction...
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Live Auction Arena
            <Arena
              snapshot={snapshot}
              socket={socket}
              myNickname={playerName}
              myFranchiseCode={myFranchiseCode}
              myRole={myRole}
              isHost={isHost}
              onLeaveRoom={handleLeaveAuction}
            />
          )
        ) : (
          // Navigation Tabs
          <>
            {currentTab === 'home' && (
              <HomeView
                onQuickStart={handleQuickStartSolo}
                onExploreRooms={() => setCurrentTab('live_rooms')}
                onViewPlayers={() => setCurrentTab('players')}
              />
            )}

            {currentTab === 'live_rooms' && (
              <LiveRoomsView
                onJoinRoom={handleJoinRoom}
                onCreateRoomClick={() => setCurrentTab('create_room')}
              />
            )}

            {currentTab === 'create_room' && (
              <CreateRoomView onCreate={handleCreateRoom} />
            )}

            {currentTab === 'players' && (
              <div className="pb-24">
                <PlayerPointsTab players={INITIAL_PLAYER_DATA} />
              </div>
            )}

            {currentTab === 'profile' && (
              <ProfileView
                player={{
                  id: clerkUser?.id || 'guest',
                  name: playerName,
                  email: playerEmail
                }}
                onLogout={() => {
                  if (clerkUser) {
                    signOut();
                  } else {
                    setIsGuest(false);
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Modern Pill Bottom Tab Navigation Bar */}
      {!snapshot && (
        <div className="fixed bottom-3 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
          <nav className="pointer-events-auto bg-surface-900/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-4 flex items-center gap-2 sm:gap-3 shadow-2xl">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold transition-all ${
                currentTab === 'home'
                  ? 'bg-white text-zinc-950 shadow-md scale-105'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => setCurrentTab('live_rooms')}
              className={`flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold transition-all ${
                currentTab === 'live_rooms'
                  ? 'bg-white text-zinc-950 shadow-md scale-105'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Rooms</span>
            </button>

            <button
              onClick={() => setCurrentTab('create_room')}
              className={`flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold transition-all ${
                currentTab === 'create_room'
                  ? 'bg-white text-zinc-950 shadow-md scale-105'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Create</span>
            </button>

            <button
              onClick={() => setCurrentTab('players')}
              className={`flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold transition-all ${
                currentTab === 'players'
                  ? 'bg-white text-zinc-950 shadow-md scale-105'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Players</span>
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold transition-all ${
                currentTab === 'profile'
                  ? 'bg-white text-zinc-950 shadow-md scale-105'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default App;
