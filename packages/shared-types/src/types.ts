export type PlayerRole = 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';

export type PlayerStatus = 'UPCOMING' | 'SOLD' | 'UNSOLD';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  country: string;
  isOverseas: boolean;
  basePrice: number; // in Cr (e.g. 2.00, 1.50, 0.30)
  rating: number; // 50 to 99 OVR / Points
  set: number; // 1 to 6
  setName?: string;
  specialty?: string;
  status: PlayerStatus;
  soldTo?: string | null;
  soldPrice?: number | null;
}

export type FranchiseId = 'CSK' | 'MI' | 'RCB' | 'KKR' | 'SRH' | 'RR' | 'DC' | 'PBKS' | 'LSG' | 'GT';

export type BotArchetype = 'Star Hunter' | 'Tactical Sniper' | 'Balanced Builder';

export interface FranchiseConfig {
  id: FranchiseId;
  name: string;
  short: string;
  color: string;
  textColor: string;
  slogan: string;
  aiStyle: string;
  aggression: number;
  archetype: BotArchetype;
}

export interface TeamState {
  id: FranchiseId;
  name: string;
  short: string;
  color: string;
  textColor: string;
  slogan: string;
  aiStyle: string;
  aggression: number;
  archetype: BotArchetype;
  ownerId: string | null; // socket id or user nickname; null if controlled by AI
  ownerName: string;
  isAI: boolean;
  purse: number;
  squad: AcquiredPlayer[];
  overseasCount: number;
  roleCounts: Record<PlayerRole, number>;
}

export interface AcquiredPlayer extends Player {
  boughtPrice: number;
}

export type RoomStatus = 'LOBBY' | 'LIVE' | 'PAUSED' | 'XI_SUBMISSION' | 'COMPLETED';

export type ParticipantRole = 'OWNER' | 'SPECTATOR';

export interface Participant {
  id: string; // socket.id
  nickname: string;
  role: ParticipantRole;
  franchiseCode?: FranchiseId | null;
  isHost: boolean;
  connected: boolean;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: number;
  type: 'bid' | 'sold' | 'unsold' | 'set_start' | 'info' | 'chat';
  teamId?: FranchiseId;
  teamName?: string;
  teamColor?: string;
  playerName?: string;
  text: string;
  amount?: number;
}

export interface PlayingXIScoreBreakdown {
  qualityScore: number;       // Pillar 1: max 55 pts
  battingDepthScore: number;  // Pillar 2: max 15 pts
  bowlingDepthScore: number;  // Pillar 3: max 15 pts
  roleFitScore: number;       // Pillar 4: max 15 pts
  totalScore: number;         // 0 - 100
  isValid: boolean;
  validationErrors: string[];
  // Diagnostic metadata
  avgRating: number;
  battingCount: number;
  bowlingCount: number;
  wkCount: number;
  overseasCount: number;
}

export interface PlayingXISubmission {
  teamId: FranchiseId;
  playerIds: string[];
  submissionTime: number;
  breakdown: PlayingXIScoreBreakdown;
}

export interface RoomSnapshot {
  code: string;
  name: string;
  status: RoomStatus;
  hostId: string;
  purseLimit: number;
  timerSeconds: number;
  aiBotsEnabled: boolean;
  currentSet: number;
  currentPlayerIndex: number;
  currentPlayer: Player | null;
  currentBid: number;
  nextBid: number;
  highestBidderId: FranchiseId | null;
  highestBidderName: string | null;
  hasAnyBid: boolean;
  lotResolved: boolean;
  hammerEndsAt: number | null; // epoch ms
  isPaused: boolean;
  skipVotes: string[]; // participant or bot IDs who voted skip
  skipVotersRequired: number;
  teams: Record<FranchiseId, TeamState>;
  participants: Participant[];
  activityFeed: ActivityFeedItem[];
  allPlayers: Player[];
  unsoldQueue: Player[];
  submissions: Record<FranchiseId, PlayingXISubmission>;
  leaderboard?: TeamLeaderboardEntry[];
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: FranchiseId;
  teamName: string;
  color: string;
  textColor: string;
  ownerName: string;
  isAI: boolean;
  remainingPurse: number;
  squadSize: number;
  breakdown: PlayingXIScoreBreakdown;
  playingXI: AcquiredPlayer[];
}

// Client -> Server events
export interface ClientToServerEvents {
  CREATE_ROOM: (
    payload: {
      nickname: string;
      roomName: string;
      purseLimit?: number;
      timerSeconds?: number;
      aiBotsEnabled?: boolean;
      role: ParticipantRole;
      franchiseCode?: FranchiseId;
    },
    callback: (response: { success: boolean; roomCode?: string; error?: string }) => void
  ) => void;

  JOIN_ROOM: (
    payload: {
      roomCode: string;
      nickname: string;
      role: ParticipantRole;
      franchiseCode?: FranchiseId;
    },
    callback: (response: { success: boolean; snapshot?: RoomSnapshot; error?: string }) => void
  ) => void;

  SELECT_FRANCHISE: (
    payload: {
      roomCode: string;
      franchiseCode: FranchiseId;
    },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;

  SET_AI_BOTS: (
    payload: {
      roomCode: string;
      aiBotsEnabled: boolean;
    },
    callback?: (response: { success: boolean; error?: string }) => void
  ) => void;

  START_AUCTION: (
    payload: { roomCode: string },
    callback?: (response: { success: boolean; error?: string }) => void
  ) => void;

  PLACE_BID: (
    payload: {
      roomCode: string;
      expectedBid: number;
    },
    callback?: (response: { success: boolean; error?: string }) => void
  ) => void;

  VOTE_SKIP: (
    payload: { roomCode: string },
    callback?: (response: { success: boolean; error?: string }) => void
  ) => void;

  TOGGLE_PAUSE: (
    payload: { roomCode: string },
    callback?: (response: { success: boolean; error?: string }) => void
  ) => void;

  SEND_CHAT: (payload: { roomCode: string; text: string }) => void;

  SUBMIT_PLAYING_XI: (
    payload: {
      roomCode: string;
      playerIds: string[];
    },
    callback?: (response: { success: boolean; breakdown?: PlayingXIScoreBreakdown; error?: string }) => void
  ) => void;

  REQUEST_SNAPSHOT: (
    payload: { roomCode: string },
    callback: (response: { success: boolean; snapshot?: RoomSnapshot; error?: string }) => void
  ) => void;
}

// Server -> Client events
export interface ServerToClientEvents {
  ROOM_SNAPSHOT: (snapshot: RoomSnapshot) => void;
  BID_ACCEPTED: (data: {
    currentBid: number;
    nextBid: number;
    highestBidderId: FranchiseId;
    highestBidderName: string;
    hammerEndsAt: number;
  }) => void;
  BID_REJECTED: (data: { reason: string }) => void;
  LOT_SETTLED: (data: {
    player: Player;
    outcome: 'SOLD' | 'UNSOLD';
    winnerTeamId?: FranchiseId;
    finalPrice?: number;
    isAccelerated: boolean;
  }) => void;
  NEW_LOT: (data: {
    player: Player;
    setNumber: number;
    setName: string;
    nextBid: number;
    hammerEndsAt: number | null;
  }) => void;
  SET_TRANSITION: (data: {
    setNumber: number;
    setName: string;
    isAccelerated: boolean;
  }) => void;
  SKIP_VOTE_UPDATE: (data: {
    votes: string[];
    required: number;
  }) => void;
  ACTIVITY_EVENT: (event: ActivityFeedItem) => void;
  CHAT_MESSAGE: (event: ActivityFeedItem) => void;
  XI_PHASE_STARTED: (data: { deadlineTs: number }) => void;
  AUCTION_WINNER_DECLARED: (data: { leaderboard: TeamLeaderboardEntry[] }) => void;
  ERROR_NOTIFICATION: (data: { message: string }) => void;
}

