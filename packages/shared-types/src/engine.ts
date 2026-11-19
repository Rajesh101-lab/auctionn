import { Player, TeamState, PlayingXIScoreBreakdown } from './types';

export const SQUAD_MIN = 18;
export const SQUAD_MAX = 25;
export const OVERSEAS_MAX = 8;
export const BASE_PRICE_MIN = 0.30; // 30 Lakhs

/**
 * Official IPL Bid Increment Slabs
 * < 1.00 Cr: +0.05 Cr
 * 1.00 - 2.00 Cr: +0.10 Cr
 * 2.00 - 5.00 Cr: +0.20 Cr
 * >= 5.00 Cr: +0.25 Cr
 */
export function getBidIncrement(currentBid: number): number {
  if (currentBid < 1.00) return 0.05;
  if (currentBid < 2.00) return 0.10;
  if (currentBid < 5.00) return 0.20;
  return 0.25;
}

/**
 * Calculate next valid bid
 */
export function calculateNextBid(currentBid: number, hasAnyBid: boolean, basePrice: number): number {
  if (!hasAnyBid) {
    return Number(basePrice.toFixed(2));
  }
  const inc = getBidIncrement(currentBid);
  return Number((currentBid + inc).toFixed(2));
}

/**
 * Mandatory Squad Reserve & Maximum Allowable Bid Formula
 * ReservedSlots = max(0, 17 - currentSquadCount)
 * ReserveCash = round2(ReservedSlots * 0.30)
 * MaxAllowedBid = max(0, round2(remainingPurse - ReserveCash))
 */
export function calculateMaxAllowableBid(team: Pick<TeamState, 'squad' | 'purse'>): number {
  const squadCount = team.squad.length;
  const remainingMandatorySlotsAfterThisPlayer = Math.max(0, 17 - squadCount);
  const reserveCash = Number((remainingMandatorySlotsAfterThisPlayer * BASE_PRICE_MIN).toFixed(2));
  return Math.max(0, Number((team.purse - reserveCash).toFixed(2)));
}

export interface BidValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Complete Bid Validity Predicate
 */
export function canPlaceBid(
  team: TeamState,
  player: Player,
  nextBidAmount: number,
  highestBidderId: string | null,
  aiBotsEnabled: boolean
): BidValidationResult {
  if (team.isAI && !aiBotsEnabled) {
    return { allowed: false, reason: 'AI bots are disabled in this room.' };
  }

  if (team.id === highestBidderId) {
    return { allowed: false, reason: 'Your franchise already holds the highest bid.' };
  }

  if (team.squad.length >= SQUAD_MAX) {
    return { allowed: false, reason: `Squad limit reached (${SQUAD_MAX}/${SQUAD_MAX} players).` };
  }

  if (player.isOverseas && team.overseasCount >= OVERSEAS_MAX) {
    return { allowed: false, reason: `Overseas quota reached (${OVERSEAS_MAX}/${OVERSEAS_MAX} players).` };
  }

  const maxAllowedBid = calculateMaxAllowableBid(team);
  if (nextBidAmount > maxAllowedBid) {
    return {
      allowed: false,
      reason: `Bid ₹${nextBidAmount.toFixed(2)} Cr exceeds Max Allowed Bid ₹${maxAllowedBid.toFixed(2)} Cr (reserve needed for min 18 players).`
    };
  }

  if (nextBidAmount > team.purse) {
    return {
      allowed: false,
      reason: `Insufficient purse balance (₹${team.purse.toFixed(2)} Cr available).`
    };
  }

  return { allowed: true };
}

/**
 * AI Intrinsic Player Valuation & Personality Ceilings
 */
export function calculateAIValuation(
  team: TeamState,
  player: Player
): number {
  // Base valuation derived from player rating (50 - 99)
  let baseVal = player.basePrice;
  if (player.rating >= 96) baseVal = 15.0;
  else if (player.rating >= 94) baseVal = 13.0;
  else if (player.rating >= 91) baseVal = 9.8;
  else if (player.rating >= 88) baseVal = 6.8;
  else if (player.rating >= 85) baseVal = 4.2;
  else baseVal = Math.max(player.basePrice, 1.8);

  // Role need multiplier
  const roleCount = team.roleCounts[player.role] || 0;
  const targetRoleMin = player.role === 'Wicketkeeper' ? 2 : 5;
  const needMultiplier = roleCount < targetRoleMin ? 1.25 : 0.82;

  // Archetype multiplier
  let archetypeMult = 1.0;
  if (team.archetype === 'Star Hunter') {
    archetypeMult = player.rating >= 91 ? 1.18 : 0.90;
  } else if (team.archetype === 'Tactical Sniper') {
    archetypeMult = (player.role === 'Bowler' || player.role === 'Wicketkeeper') ? 1.12 : 0.96;
  } else if (team.archetype === 'Balanced Builder') {
    archetypeMult = (player.role === 'All-Rounder') ? 1.20 : 1.02;
  }

  // Purse health factor
  const purseFactor = Math.max(0.4, team.purse / 120.0);

  // Deterministic per-team + player jitter (±12% variation)
  const hash = Math.abs(
    (team.id.charCodeAt(0) * 31 + player.id.charCodeAt(player.id.length - 1) * 17) % 25
  );
  const jitter = 0.88 + (hash / 100); // 0.88 to 1.12

  const computed = baseVal * needMultiplier * team.aggression * archetypeMult * purseFactor * jitter;
  const maxAllowed = calculateMaxAllowableBid(team);

  return Math.min(maxAllowed, Math.max(player.basePrice, Number(computed.toFixed(2))));
}

/**
 * Clamp helper
 */
function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Post-Auction 100-Point Playing XI Scoring Algorithm
 * 
 * Rules:
 * - Exactly 11 players
 * - <= 4 Overseas players
 * - >= 1 Wicketkeeper
 * 
 * Score Pillars (Total 100 pts):
 * 1. Raw Player Quality (Max 55 pts):
 *    avgR = (1/11) * sum(ratings)
 *    qualityScore = clamp(((avgR - 60) / 35) * 55, 0, 55)
 * 
 * 2. Batting Depth (Max 15 pts):
 *    batters = Batters, WKs, All-Rounders
 *    nBat = count(batters)
 *    cBat = min(1, nBat / 7)
 *    avgRBat = avg rating of batters
 *    qBat = clamp((avgRBat - 65) / 30, 0, 1)
 *    battingDepthScore = round2((0.60 * cBat + 0.40 * qBat) * 15)
 * 
 * 3. Bowling Depth (Max 15 pts):
 *    bowlers = Bowlers, All-Rounders
 *    nBowl = count(bowlers)
 *    cBowl = nBowl >= 5 ? 1.0 : (nBowl / 5) * 0.75
 *    avgRBowl = avg rating of bowlers
 *    qBowl = clamp((avgRBowl - 65) / 30, 0, 1)
 *    bowlingDepthScore = round2((0.60 * cBowl + 0.40 * qBowl) * 15)
 * 
 * 4. Role & Balance Fit (Max 15 pts):
 *    WK check: 1 <= wk <= 2 -> 4 pts, else 2 pts
 *    Bat core: 4 <= nBat <= 7 -> 5 pts, else 2.5 pts
 *    Bowl attack: 4 <= nBowl <= 6 -> 6 pts, else 3 pts
 *    roleFitScore = round2(wkPts + batCorePts + bowlAttackPts)
 */
export function calculatePlayingXIScore(players: Player[]): PlayingXIScoreBreakdown {
  const validationErrors: string[] = [];

  if (players.length !== 11) {
    validationErrors.push(`Playing XI must contain exactly 11 players (currently ${players.length}).`);
  }

  const overseasCount = players.filter(p => p.isOverseas).length;
  if (overseasCount > 4) {
    validationErrors.push(`Maximum 4 overseas players allowed (currently ${overseasCount}).`);
  }

  const wkCount = players.filter(p => p.role === 'Wicketkeeper').length;
  if (wkCount < 1) {
    validationErrors.push(`At least 1 wicketkeeper is required (currently ${wkCount}).`);
  }

  const isValid = validationErrors.length === 0;

  if (players.length === 0) {
    return {
      qualityScore: 0,
      battingDepthScore: 0,
      bowlingDepthScore: 0,
      roleFitScore: 0,
      totalScore: 0,
      isValid: false,
      validationErrors,
      avgRating: 0,
      battingCount: 0,
      bowlingCount: 0,
      wkCount: 0,
      overseasCount: 0
    };
  }

  // Pillar 1: Raw Quality (Max 55)
  const sumRatings = players.reduce((sum, p) => sum + p.rating, 0);
  const avgRating = sumRatings / players.length;
  const qualityScore = Number(clamp(((avgRating - 60) / 35) * 55, 0, 55).toFixed(2));

  // Pillar 2: Batting Depth (Max 15)
  const battingPlayers = players.filter(p => p.role === 'Batter' || p.role === 'Wicketkeeper' || p.role === 'All-Rounder');
  const nBat = battingPlayers.length;
  const cBat = Math.min(1, nBat / 7);
  const avgRBat = nBat > 0 ? battingPlayers.reduce((s, p) => s + p.rating, 0) / nBat : 0;
  const qBat = clamp((avgRBat - 65) / 30, 0, 1);
  const battingDepthScore = Number(((0.60 * cBat + 0.40 * qBat) * 15).toFixed(2));

  // Pillar 3: Bowling Depth (Max 15)
  const bowlingPlayers = players.filter(p => p.role === 'Bowler' || p.role === 'All-Rounder');
  const nBowl = bowlingPlayers.length;
  const cBowl = nBowl >= 5 ? 1.0 : (nBowl / 5) * 0.75;
  const avgRBowl = nBowl > 0 ? bowlingPlayers.reduce((s, p) => s + p.rating, 0) / nBowl : 0;
  const qBowl = clamp((avgRBowl - 65) / 30, 0, 1);
  const bowlingDepthScore = Number(((0.60 * cBowl + 0.40 * qBowl) * 15).toFixed(2));

  // Pillar 4: Role & Balance Fit (Max 15)
  const wkPts = (wkCount >= 1 && wkCount <= 2) ? 4.0 : 2.0;
  const batCorePts = (nBat >= 4 && nBat <= 7) ? 5.0 : 2.5;
  const bowlAttackPts = (nBowl >= 4 && nBowl <= 6) ? 6.0 : 3.0;
  const roleFitScore = Number((wkPts + batCorePts + bowlAttackPts).toFixed(2));

  // Total Score (0 - 100)
  let totalScore = Number((qualityScore + battingDepthScore + bowlingDepthScore + roleFitScore).toFixed(2));
  totalScore = clamp(totalScore, 0, 100);

  // If invalid, cap score or penalize
  if (!isValid) {
    totalScore = Number((totalScore * 0.5).toFixed(2));
  }

  return {
    qualityScore,
    battingDepthScore,
    bowlingDepthScore,
    roleFitScore,
    totalScore,
    isValid,
    validationErrors,
    avgRating: Number(avgRating.toFixed(1)),
    battingCount: nBat,
    bowlingCount: nBowl,
    wkCount,
    overseasCount
  };
}

/**
 * Auto-select best legal 11 from a squad
 */
export function autoSelectBestXI(squad: Player[]): Player[] {
  if (squad.length <= 11) {
    return [...squad];
  }

  // Ensure at least 1 WK
  const wks = squad.filter(p => p.role === 'Wicketkeeper').sort((a, b) => b.rating - a.rating);
  const nonWks = squad.filter(p => p.role !== 'Wicketkeeper').sort((a, b) => b.rating - a.rating);

  const selected: Player[] = [];
  if (wks.length > 0) {
    selected.push(wks[0]);
  }

  const pool = [...(wks.slice(1)), ...nonWks].sort((a, b) => b.rating - a.rating);

  for (const candidate of pool) {
    if (selected.length >= 11) break;

    const currentOverseas = selected.filter(p => p.isOverseas).length;
    if (candidate.isOverseas && currentOverseas >= 4) {
      continue;
    }

    selected.push(candidate);
  }

  // If still less than 11 due to overseas restriction, fill remaining with any Indian player
  if (selected.length < 11) {
    for (const candidate of squad) {
      if (!selected.some(p => p.id === candidate.id)) {
        selected.push(candidate);
        if (selected.length === 11) break;
      }
    }
  }

  return selected;
}

