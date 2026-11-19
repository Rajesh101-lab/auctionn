import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  FranchiseId,
  ParticipantRole,
  Participant
} from '@ipl/shared-types';
import { RoomManager } from './RoomManager';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = new Map<string, RoomManager>();

function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'IPL-';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size, timestamp: Date.now() });
});

// List public active rooms
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(r => ({
    code: r.code,
    name: r.name,
    status: r.status,
    participantsCount: r.participants.size,
    aiBotsEnabled: r.aiBotsEnabled,
    purseLimit: r.purseLimit,
    timerSeconds: r.timerSeconds
  }));
  res.json({ rooms: roomList });
});

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  let currentRoomCode: string | null = null;

  socket.on('CREATE_ROOM', (payload, callback) => {
    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

    const room = new RoomManager(
      code,
      payload.roomName || 'IPL War Room',
      socket.id,
      payload.nickname || 'Host Owner',
      payload.purseLimit || 120.0,
      payload.timerSeconds || 10,
      payload.aiBotsEnabled !== undefined ? payload.aiBotsEnabled : true,
      io
    );

    const participant: Participant = {
      id: socket.id,
      nickname: payload.nickname || 'Host Owner',
      role: payload.role || 'OWNER',
      franchiseCode: payload.franchiseCode || null,
      isHost: true,
      connected: true
    };

    room.participants.set(socket.id, participant);
    if (payload.franchiseCode) {
      room.claimFranchise(socket.id, payload.franchiseCode);
    }

    rooms.set(code, room);
    currentRoomCode = code;
    socket.join(code);

    callback({ success: true, roomCode: code });
    room.broadcastSnapshot();
  });

  socket.on('JOIN_ROOM', (payload, callback) => {
    const room = rooms.get(payload.roomCode.toUpperCase().trim());
    if (!room) {
      return callback({ success: false, error: 'Room not found. Check the room code and try again.' });
    }

    const ownersCount = Array.from(room.participants.values()).filter(p => p.role === 'OWNER').length;
    const spectatorsCount = Array.from(room.participants.values()).filter(p => p.role === 'SPECTATOR').length;

    if (payload.role === 'OWNER' && ownersCount >= 10) {
      return callback({ success: false, error: 'Room is full for Franchise Owners (Max 10). Join as Spectator.' });
    }

    if (payload.role === 'SPECTATOR' && spectatorsCount >= 20) {
      return callback({ success: false, error: 'Room is full for Spectators (Max 20).' });
    }

    const participant: Participant = {
      id: socket.id,
      nickname: payload.nickname,
      role: payload.role,
      franchiseCode: payload.franchiseCode || null,
      isHost: socket.id === room.hostId,
      connected: true
    };

    room.participants.set(socket.id, participant);
    currentRoomCode = room.code;
    socket.join(room.code);

    if (payload.role === 'OWNER' && payload.franchiseCode) {
      room.claimFranchise(socket.id, payload.franchiseCode);
    }

    room.addFeedItem({
      type: 'info',
      text: `${payload.nickname} joined the arena as a ${payload.role === 'OWNER' ? 'Franchise Owner' : 'Spectator'}.`
    });

    callback({ success: true, snapshot: room.getSnapshot() });
    room.broadcastSnapshot();
  });

  socket.on('SELECT_FRANCHISE', (payload, callback) => {
    const room = rooms.get(payload.roomCode);
    if (!room) return callback({ success: false, error: 'Room not found.' });

    const result = room.claimFranchise(socket.id, payload.franchiseCode);
    callback(result);
  });

  socket.on('SET_AI_BOTS', (payload, callback) => {
    const room = rooms.get(payload.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found.' });
    if (socket.id !== room.hostId) {
      return callback?.({ success: false, error: 'Only the room host can toggle AI bots.' });
    }

    room.setAIBotsEnabled(payload.aiBotsEnabled);
    callback?.({ success: true });
  });

  socket.on('START_AUCTION', (payload, callback) => {
    const room = rooms.get(payload.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found.' });
    if (socket.id !== room.hostId) {
      return callback?.({ success: false, error: 'Only the room host can start the auction.' });
    }

    room.startAuction();
    callback?.({ success: true });
  });

  socket.on('PLACE_BID', (payload, callback) => {
    const room = rooms.get(payload.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found.' });

    const participant = room.participants.get(socket.id);
    if (!participant || participant.role !== 'OWNER' || !participant.franchiseCode) {
      return callback?.({ success: false, error: 'Only registered franchise owners can place bids.' });
    }

    const res = room.placeBid(participant.franchiseCode, payload.expectedBid);
    callback?.(res);
  });

  socket.on('VOTE_SKIP', (payload, callback) => {
    const room = rooms.get(payload.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found.' });

    const participant = room.participants.get(socket.id);
    if (!participant || participant.role !== 'OWNER') {
      return callback?.({ success: false, error: 'Only franchise owners can cast skip votes.' });
    }

    const res = room.voteSkip(socket.id);
    callback?.(res);
  });

  socket.on('TOGGLE_PAUSE', (payload, callback) => {
    const room = rooms.get(payload.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found.' });
    if (socket.id !== room.hostId) {
      return callback?.({ success: false, error: 'Only the room host can pause/resume.' });
    }

    room.togglePause();
    callback?.({ success: true });
  });

  socket.on('SEND_CHAT', (payload) => {
    const room = rooms.get(payload.roomCode);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    const sender = participant ? participant.nickname : 'Spectator';
    const team = participant?.franchiseCode ? room.teams[participant.franchiseCode] : undefined;

    const chatItem = {
      type: 'chat' as const,
      teamId: participant?.franchiseCode || undefined,
      teamName: team?.name,
      teamColor: team?.color,
      text: `${sender}: ${payload.text}`
    };

    room.addFeedItem(chatItem);
  });

  socket.on('SUBMIT_PLAYING_XI', (payload, callback) => {
    const room = rooms.get(payload.roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found.' });

    const participant = room.participants.get(socket.id);
    if (!participant || !participant.franchiseCode) {
      return callback?.({ success: false, error: 'Not an owner of any franchise.' });
    }

    const res = room.submitPlayingXI(participant.franchiseCode, payload.playerIds);
    callback?.(res);
  });

  socket.on('REQUEST_SNAPSHOT', (payload, callback) => {
    const room = rooms.get(payload.roomCode);
    if (!room) return callback({ success: false, error: 'Room not found.' });
    callback({ success: true, snapshot: room.getSnapshot() });
  });

  socket.on('disconnect', () => {
    if (currentRoomCode) {
      const room = rooms.get(currentRoomCode);
      if (room) {
        const participant = room.participants.get(socket.id);
        if (participant) {
          participant.connected = false;
          room.addFeedItem({
            type: 'info',
            text: `${participant.nickname} disconnected.`
          });
          room.broadcastSnapshot();
        }
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 IPL Mega Auction Server running on http://localhost:${PORT}`);
});

