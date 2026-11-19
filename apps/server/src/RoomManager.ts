import {
  FranchiseId,
  Player,
  RoomSnapshot,
  RoomStatus,
  Participant,
  TeamState,
  ActivityFeedItem,
  OFFICIAL_FRANCHISES,
  INITIAL_PLAYER_DATA,
  canPlaceBid,
  calculateNextBid,
  calculateAIValuation,
  calculatePlayingXIScore,
  autoSelectBestXI,
  TeamLeaderboardEntry,
  PlayingXIScoreBreakdown
} from '@ipl/shared-types';
import { Server } from 'socket.io';

export class RoomManager {
  public code: string;
  public name: string;
  public status: RoomStatus = 'LOBBY';
  public hostId: string;
  public purseLimit: number;
  public timerSeconds: number;
  public aiBotsEnabled: boolean;

  public currentSet: number = 1;
  public currentPlayerIndex: number = 0;
  public currentBid: number = 0;
  public highestBidderId: FranchiseId | null = null;
  public hasAnyBid: boolean = false;
  public lotResolved: boolean = false;
  public hammerEndsAt: number | null = null;
  public isPaused: boolean = false;

  public skipVotes: Set<string> = new Set();

  public teams: Record<FranchiseId, TeamState>;
  public participants: Map<string, Participant> = new Map();
  public activityFeed: ActivityFeedItem[] = [];

  public allPlayers: Player[] = [];
  public currentSetQueue: Player[] = [];
  public unsoldQueue: Player[] = [];

  public submissions: Record<FranchiseId, any> = {} as any;
  public leaderboard?: TeamLeaderboardEntry[];

  private timerInterval: NodeJS.Timeout | null = null;
  private aiBidTimeout: NodeJS.Timeout | null = null;
  private io: Server;

  constructor(
    code: string,
    name: string,
    hostId: string,
    hostNickname: string,
    purseLimit = 120.0,
    timerSeconds = 10,
    aiBotsEnabled = true,
    io: Server
  ) {
    this.code = code;
    this.name = name;
    this.hostId = hostId;
    this.purseLimit = purseLimit;
    this.timerSeconds = timerSeconds;
    this.aiBotsEnabled = aiBotsEnabled;
    this.io = io;

    // Deep clone initial player pool
    this.allPlayers = JSON.parse(JSON.stringify(INITIAL_PLAYER_DATA));

    // Initialize the 10 franchises
    this.teams = {} as Record<FranchiseId, TeamState>;
    OFFICIAL_FRANCHISES.forEach(f => {
      this.teams[f.id] = {
        ...f,
        ownerId: null,
        ownerName: `${f.id} Bot`,
        isAI: true,
        purse: purseLimit,
        squad: [],
        overseasCount: 0,
        roleCounts: { Batter: 0, Bowler: 0, 'All-Rounder': 0, Wicketkeeper: 0 }
      };
    });

    this.loadSet(1);

    this.addFeedItem({
      type: 'info',
      text: `Room ${this.code} created by ${hostNickname}. Purse: ₹${this.purseLimit} Cr | Hammer: ${this.timerSeconds}s | Bots: ${this.aiBotsEnabled ? 'Enabled' : 'Disabled'}`
    });
  }

  public addFeedItem(item: Omit<ActivityFeedItem, 'id' | 'timestamp'>) {
    const feedItem: ActivityFeedItem = {
      ...item,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };
    this.activityFeed.unshift(feedItem);
    if (this.activityFeed.length > 100) this.activityFeed.pop();
    this.io.to(this.code).emit('ACTIVITY_EVENT', feedItem);
  }

  public loadSet(setNum: number) {
    this.currentSet = setNum;
    if (setNum <= 5) {
      this.currentSetQueue = this.allPlayers.filter(p => p.set === setNum && p.status === 'UPCOMING');
    } else if (setNum === 6) {
      // Set 6: Accelerated Unsold Round
      this.currentSetQueue = [...this.unsoldQueue];
      this.currentSetQueue.forEach(p => {
        p.set = 6;
        p.setName = 'SET 6: ACCELERATED UNSOLD ROUND';
        p.status = 'UPCOMING';
      });
    } else {
      this.currentSetQueue = [];
    }
    this.currentPlayerIndex = 0;
  }

  public getCurrentPlayer(): Player | null {
    if (this.currentPlayerIndex < this.currentSetQueue.length) {
      return this.currentSetQueue[this.currentPlayerIndex];
    }
    return null;
  }

  public getSnapshot(): RoomSnapshot {
    const curr = this.getCurrentPlayer();
    const nextBid = curr
      ? calculateNextBid(this.currentBid, this.hasAnyBid, curr.basePrice)
      : 0;

    return {
      code: this.code,
      name: this.name,
      status: this.status,
      hostId: this.hostId,
      purseLimit: this.purseLimit,
      timerSeconds: this.timerSeconds,
      aiBotsEnabled: this.aiBotsEnabled,
      currentSet: this.currentSet,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: curr,
      currentBid: this.currentBid,
      nextBid,
      highestBidderId: this.highestBidderId,
      highestBidderName: this.highestBidderId ? this.teams[this.highestBidderId]?.name : null,
      hasAnyBid: this.hasAnyBid,
      lotResolved: this.lotResolved,
      hammerEndsAt: this.hammerEndsAt,
      isPaused: this.isPaused,
      skipVotes: Array.from(this.skipVotes),
      skipVotersRequired: this.getSkipVotersRequired(),
      teams: this.teams,
      participants: Array.from(this.participants.values()),
      activityFeed: this.activityFeed,
      allPlayers: this.allPlayers,
      unsoldQueue: this.unsoldQueue,
      submissions: this.submissions,
      leaderboard: this.leaderboard
    };
  }

  public broadcastSnapshot() {
    this.io.to(this.code).emit('ROOM_SNAPSHOT', this.getSnapshot());
  }

  public getSkipVotersRequired(): number {
    // Human owners who can vote; if none or bots enabled with no humans, active human owners count
    const humanOwners = Array.from(this.participants.values()).filter(p => p.role === 'OWNER' && p.franchiseCode);
    return Math.max(1, humanOwners.length);
  }

  public setAIBotsEnabled(enabled: boolean) {
    this.aiBotsEnabled = enabled;
    // update teams AI flag for unclaimed teams
    Object.values(this.teams).forEach(team => {
      if (!team.ownerId) {
        team.isAI = enabled;
        team.ownerName = enabled ? `${team.id} Bot` : 'Unclaimed';
      }
    });

    this.addFeedItem({
      type: 'info',
      text: `AI Bots have been ${enabled ? 'ENABLED' : 'DISABLED'} by host.`
    });

    if (!enabled && this.aiBidTimeout) {
      clearTimeout(this.aiBidTimeout);
      this.aiBidTimeout = null;
    } else if (enabled && this.status === 'LIVE' && !this.lotResolved && !this.isPaused) {
      this.scheduleNextAIBid();
    }

    this.broadcastSnapshot();
  }

  public claimFranchise(participantId: string, franchiseId: FranchiseId) {
    const participant = this.participants.get(participantId);
    if (!participant) return { success: false, error: 'Participant not found.' };

    const targetTeam = this.teams[franchiseId];
    if (targetTeam.ownerId && targetTeam.ownerId !== participantId) {
      return { success: false, error: `${targetTeam.name} is already claimed by ${targetTeam.ownerName}.` };
    }

    // Release previously claimed franchise
    if (participant.franchiseCode && participant.franchiseCode !== franchiseId) {
      const prevTeam = this.teams[participant.franchiseCode];
      prevTeam.ownerId = null;
      prevTeam.isAI = this.aiBotsEnabled;
      prevTeam.ownerName = this.aiBotsEnabled ? `${prevTeam.id} Bot` : 'Unclaimed';
    }

    targetTeam.ownerId = participantId;
    targetTeam.ownerName = participant.nickname;
    targetTeam.isAI = false;
    participant.franchiseCode = franchiseId;
    participant.role = 'OWNER';

    this.addFeedItem({
      type: 'info',
      teamId: franchiseId,
      teamName: targetTeam.name,
      teamColor: targetTeam.color,
      text: `${participant.nickname} is now in command of ${targetTeam.name}!`
    });

    this.broadcastSnapshot();
    return { success: true };
  }

  public startAuction() {
    if (this.status === 'LIVE') return;
    this.status = 'LIVE';
    this.loadSet(1);
    this.startCurrentPlayerLot();

    this.addFeedItem({
      type: 'set_start',
      text: `AUCTION COMMENCED! Starting Set 1: Capped Batters (Round 1).`
    });

    this.broadcastSnapshot();
  }

  public startCurrentPlayerLot() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.aiBidTimeout) clearTimeout(this.aiBidTimeout);

    const player = this.getCurrentPlayer();
    if (!player) {
      this.advanceToNextSet();
      return;
    }

    this.currentBid = player.basePrice;
    this.hasAnyBid = false;
    this.highestBidderId = null;
    this.lotResolved = false;
    this.skipVotes.clear();
    this.hammerEndsAt = Date.now() + this.timerSeconds * 1000;

    this.startTimerCountdown();

    this.addFeedItem({
      type: 'info',
      playerName: player.name,
      text: `Now on the block: ${player.name} (${player.role}, ${player.country}) — Base Price ₹${player.basePrice.toFixed(2)} Cr [${player.rating} OVR]`
    });

    if (this.aiBotsEnabled && !this.isPaused) {
      this.scheduleNextAIBid();
    }

    this.broadcastSnapshot();
  }

  private startTimerCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.isPaused) return;

      if (this.hammerEndsAt && Date.now() >= this.hammerEndsAt) {
        clearInterval(this.timerInterval!);
        this.timerInterval = null;
        this.settleCurrentLot();
      }
    }, 250);
  }

  public scheduleNextAIBid() {
    if (this.aiBidTimeout) clearTimeout(this.aiBidTimeout);
    if (!this.aiBotsEnabled || this.lotResolved || this.isPaused || this.status !== 'LIVE') return;

    const player = this.getCurrentPlayer();
    if (!player) return;

    const nextBid = calculateNextBid(this.currentBid, this.hasAnyBid, player.basePrice);

    // Realistic human-like delay (750ms to 2400ms)
    const delay = Math.floor(750 + Math.random() * 1650);

    this.aiBidTimeout = setTimeout(() => {
      if (this.lotResolved || this.isPaused || !this.aiBotsEnabled) return;

      // Filter eligible AI teams
      const eligibleAIs = Object.values(this.teams).filter(team => {
        if (!team.isAI) return false;
        const check = canPlaceBid(team, player, nextBid, this.highestBidderId, this.aiBotsEnabled);
        if (!check.allowed) return false;
        const valuation = calculateAIValuation(team, player);
        return valuation >= nextBid;
      });

      if (eligibleAIs.length === 0) return;

      // Sort by valuation descending
      eligibleAIs.sort((a, b) => calculateAIValuation(b, player) - calculateAIValuation(a, player));
      const chosen = eligibleAIs[0];

      this.executeBid(chosen.id, nextBid);
    }, delay);
  }

  public placeBid(teamId: FranchiseId, expectedBid: number): { success: boolean; error?: string } {
    if (this.status !== 'LIVE' || this.isPaused || this.lotResolved) {
      return { success: false, error: 'Auction is not currently accepting bids.' };
    }

    const player = this.getCurrentPlayer();
    if (!player) return { success: false, error: 'No active player on auction block.' };

    const nextBid = calculateNextBid(this.currentBid, this.hasAnyBid, player.basePrice);

    // Concurrency guard: reject out-of-sync bids
    if (Math.abs(expectedBid - nextBid) > 0.01) {
      return { success: false, error: `Bid rejected: expected ₹${expectedBid} Cr, current next valid bid is ₹${nextBid} Cr.` };
    }

    const team = this.teams[teamId];
    const validation = canPlaceBid(team, player, nextBid, this.highestBidderId, this.aiBotsEnabled);
    if (!validation.allowed) {
      return { success: false, error: validation.reason };
    }

    this.executeBid(teamId, nextBid);
    return { success: true };
  }

  private executeBid(teamId: FranchiseId, bidAmount: number) {
    if (this.lotResolved) return;
    if (this.aiBidTimeout) clearTimeout(this.aiBidTimeout);

    const team = this.teams[teamId];
    const player = this.getCurrentPlayer();
    if (!player) return;

    this.currentBid = bidAmount;
    this.hasAnyBid = true;
    this.highestBidderId = teamId;
    this.hammerEndsAt = Date.now() + this.timerSeconds * 1000;
    this.skipVotes.clear(); // Reset skip votes on valid bid

    this.addFeedItem({
      type: 'bid',
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      playerName: player.name,
      amount: bidAmount,
      text: `${team.name} raised paddle to ₹${bidAmount.toFixed(2)} Cr!`
    });

    const nextBid = calculateNextBid(this.currentBid, this.hasAnyBid, player.basePrice);

    this.io.to(this.code).emit('BID_ACCEPTED', {
      currentBid: this.currentBid,
      nextBid,
      highestBidderId: team.id,
      highestBidderName: team.name,
      hammerEndsAt: this.hammerEndsAt
    });

    this.broadcastSnapshot();

    if (this.aiBotsEnabled && !this.isPaused) {
      this.scheduleNextAIBid();
    }
  }

  public voteSkip(voterId: string): { success: boolean; error?: string } {
    const player = this.getCurrentPlayer();
    if (!player || this.lotResolved) return { success: false, error: 'Cannot skip right now.' };

    if (this.hasAnyBid) {
      return { success: false, error: 'Cannot skip once a franchise has placed an opening bid!' };
    }

    this.skipVotes.add(voterId);

    // If bots enabled, simulated AI agreement
    if (this.aiBotsEnabled) {
      Object.values(this.teams).forEach(team => {
        if (team.isAI) {
          if (player.rating <= 88 || this.currentSet === 6 || Math.random() > 0.3) {
            this.skipVotes.add(team.id);
          }
        }
      });
    }

    const required = this.getSkipVotersRequired();
    const humanVotes = Array.from(this.skipVotes).filter(id => this.participants.has(id)).length;

    this.io.to(this.code).emit('SKIP_VOTE_UPDATE', {
      votes: Array.from(this.skipVotes),
      required
    });

    if (humanVotes >= required) {
      this.addFeedItem({
        type: 'info',
        text: `Unanimous skip approved (${humanVotes}/${required})! Skipping ${player.name}.`
      });
      this.settleCurrentLot(true);
      return { success: true };
    }

    this.addFeedItem({
      type: 'info',
      text: `Skip vote cast: ${humanVotes}/${required} owners voted to skip ${player.name}.`
    });

    this.broadcastSnapshot();
    return { success: true };
  }

  public settleCurrentLot(forcedSkip = false) {
    if (this.lotResolved) return;
    this.lotResolved = true;

    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.aiBidTimeout) clearTimeout(this.aiBidTimeout);

    const player = this.getCurrentPlayer();
    if (!player) return;

    const isAccelerated = this.currentSet === 6;

    if (!forcedSkip && this.hasAnyBid && this.highestBidderId) {
      // SOLD!
      const winningTeam = this.teams[this.highestBidderId];
      winningTeam.purse = Number((winningTeam.purse - this.currentBid).toFixed(2));
      winningTeam.squad.push({
        ...player,
        boughtPrice: this.currentBid
      });

      if (player.isOverseas) winningTeam.overseasCount += 1;
      winningTeam.roleCounts[player.role] = (winningTeam.roleCounts[player.role] || 0) + 1;

      player.status = 'SOLD';
      player.soldTo = winningTeam.id;
      player.soldPrice = this.currentBid;

      this.addFeedItem({
        type: 'sold',
        teamId: winningTeam.id,
        teamName: winningTeam.name,
        teamColor: winningTeam.color,
        playerName: player.name,
        amount: this.currentBid,
        text: `HAMMER DOWN! ${player.name} SOLD to ${winningTeam.name} for ₹${this.currentBid.toFixed(2)} Cr!`
      });

      this.io.to(this.code).emit('LOT_SETTLED', {
        player,
        outcome: 'SOLD',
        winnerTeamId: winningTeam.id,
        finalPrice: this.currentBid,
        isAccelerated
      });
    } else {
      // UNSOLD
      player.status = 'UNSOLD';
      player.soldTo = null;
      player.soldPrice = null;

      if (!isAccelerated) {
        this.unsoldQueue.push({ ...player });
      }

      this.addFeedItem({
        type: 'unsold',
        playerName: player.name,
        text: `${player.name} went UNSOLD at Base Price ₹${player.basePrice.toFixed(2)} Cr.${!isAccelerated ? ' (Queued for Accelerated Round 6)' : ''}`
      });

      this.io.to(this.code).emit('LOT_SETTLED', {
        player,
        outcome: 'UNSOLD',
        isAccelerated
      });
    }

    this.broadcastSnapshot();

    // Advance to next player after brief celebration/transition delay
    setTimeout(() => {
      this.advanceLot();
    }, 2800);
  }

  private advanceLot() {
    this.currentPlayerIndex++;
    if (this.currentPlayerIndex >= this.currentSetQueue.length) {
      this.advanceToNextSet();
    } else {
      this.startCurrentPlayerLot();
    }
  }

  private advanceToNextSet() {
    const nextSet = this.currentSet + 1;
    if (nextSet <= 6) {
      this.loadSet(nextSet);
      const setName = nextSet === 6
        ? 'SET 6: ACCELERATED UNSOLD ROUND'
        : (this.currentSetQueue[0]?.setName || `SET ${nextSet}`);

      this.addFeedItem({
        type: 'set_start',
        text: `TRANSITION: Entering ${setName} (${this.currentSetQueue.length} players)`
      });

      this.io.to(this.code).emit('SET_TRANSITION', {
        setNumber: nextSet,
        setName,
        isAccelerated: nextSet === 6
      });

      if (this.currentSetQueue.length === 0 && nextSet === 6) {
        // No unsold players to re-auction
        this.finishAuctionAndEnterXIPhase();
      } else {
        setTimeout(() => {
          this.startCurrentPlayerLot();
        }, 3000);
      }
    } else {
      this.finishAuctionAndEnterXIPhase();
    }
  }

  private finishAuctionAndEnterXIPhase() {
    this.status = 'XI_SUBMISSION';
    this.addFeedItem({
      type: 'info',
      text: `AUCTION CONCLUDED! Entering Playing XI Selection & Championship Scoring Phase.`
    });

    // Auto-generate Playing XI for all AI teams
    Object.values(this.teams).forEach(team => {
      if (team.isAI || !team.ownerId) {
        const bestXI = autoSelectBestXI(team.squad);
        const breakdown = calculatePlayingXIScore(bestXI);
        this.submissions[team.id] = {
          teamId: team.id,
          playerIds: bestXI.map(p => p.id),
          submissionTime: Date.now(),
          breakdown
        };
      }
    });

    const deadlineTs = Date.now() + 60 * 1000; // 60s to submit XI
    this.io.to(this.code).emit('XI_PHASE_STARTED', { deadlineTs });
    this.broadcastSnapshot();
  }

  public submitPlayingXI(franchiseId: FranchiseId, playerIds: string[]): { success: boolean; breakdown?: PlayingXIScoreBreakdown; error?: string } {
    const team = this.teams[franchiseId];
    if (!team) return { success: false, error: 'Franchise not found.' };

    const selectedPlayers = team.squad.filter(p => playerIds.includes(p.id));
    if (selectedPlayers.length !== 11) {
      return { success: false, error: `Must select exactly 11 players from your squad (selected ${selectedPlayers.length}).` };
    }

    const breakdown = calculatePlayingXIScore(selectedPlayers);
    this.submissions[franchiseId] = {
      teamId: franchiseId,
      playerIds,
      submissionTime: Date.now(),
      breakdown
    };

    this.addFeedItem({
      type: 'info',
      teamId: franchiseId,
      teamName: team.name,
      teamColor: team.color,
      text: `${team.name} submitted their Playing XI (Score: ${breakdown.totalScore}/100)`
    });

    this.broadcastSnapshot();

    // Check if all franchises have submitted
    const allSubmitted = Object.keys(this.teams).every(id => !!this.submissions[id as FranchiseId]);
    if (allSubmitted) {
      this.evaluateAndDeclareWinner();
    }

    return { success: true, breakdown };
  }

  public evaluateAndDeclareWinner() {
    this.status = 'COMPLETED';

    const entries: TeamLeaderboardEntry[] = Object.values(this.teams).map(team => {
      const submission = this.submissions[team.id];
      let breakdown: PlayingXIScoreBreakdown;
      let playingXI: any[] = [];

      if (submission) {
        breakdown = submission.breakdown;
        playingXI = team.squad.filter(p => submission.playerIds.includes(p.id));
      } else {
        playingXI = autoSelectBestXI(team.squad);
        breakdown = calculatePlayingXIScore(playingXI);
      }

      return {
        rank: 0,
        teamId: team.id,
        teamName: team.name,
        color: team.color,
        textColor: team.textColor,
        ownerName: team.ownerName,
        isAI: team.isAI,
        remainingPurse: team.purse,
        squadSize: team.squad.length,
        breakdown,
        playingXI
      };
    });

    // Tie-breaker rules:
    // 1. Total score
    // 2. QualityScore
    // 3. BattingDepth + BowlingDepth
    // 4. Highest individual player rating in XI
    entries.sort((a, b) => {
      if (b.breakdown.totalScore !== a.breakdown.totalScore) {
        return b.breakdown.totalScore - a.breakdown.totalScore;
      }
      if (b.breakdown.qualityScore !== a.breakdown.qualityScore) {
        return b.breakdown.qualityScore - a.breakdown.qualityScore;
      }
      const depthB = b.breakdown.battingDepthScore + b.breakdown.bowlingDepthScore;
      const depthA = a.breakdown.battingDepthScore + a.breakdown.bowlingDepthScore;
      if (depthB !== depthA) {
        return depthB - depthA;
      }
      const maxRatingB = Math.max(...b.playingXI.map(p => p.rating), 0);
      const maxRatingA = Math.max(...a.playingXI.map(p => p.rating), 0);
      return maxRatingB - maxRatingA;
    });

    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    this.leaderboard = entries;
    const champion = entries[0];

    this.addFeedItem({
      type: 'info',
      teamId: champion.teamId,
      teamName: champion.teamName,
      teamColor: champion.color,
      text: `🏆 CHAMPION DECLARED! ${champion.teamName} wins the Mega Auction Championship with ${champion.breakdown.totalScore}/100 points!`
    });

    this.io.to(this.code).emit('AUCTION_WINNER_DECLARED', { leaderboard: entries });
    this.broadcastSnapshot();
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    this.addFeedItem({
      type: 'info',
      text: `Auction ${this.isPaused ? 'PAUSED' : 'RESUMED'} by host.`
    });
    this.broadcastSnapshot();
    return this.isPaused;
  }
}

