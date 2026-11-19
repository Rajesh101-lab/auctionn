import { describe, it, expect } from 'vitest';
import {
  getBidIncrement,
  calculateNextBid,
  calculateMaxAllowableBid,
  canPlaceBid,
  calculatePlayingXIScore,
  autoSelectBestXI,
  calculateAIValuation
} from '../src/engine';
import { Player, TeamState } from '../src/types';

describe('Auction Engine & Calculations', () => {
  it('computes correct bid increment slabs', () => {
    expect(getBidIncrement(0.50)).toBe(0.05);
    expect(getBidIncrement(0.95)).toBe(0.05);
    expect(getBidIncrement(1.00)).toBe(0.10);
    expect(getBidIncrement(1.90)).toBe(0.10);
    expect(getBidIncrement(2.00)).toBe(0.20);
    expect(getBidIncrement(4.80)).toBe(0.20);
    expect(getBidIncrement(5.00)).toBe(0.25);
    expect(getBidIncrement(12.50)).toBe(0.25);
  });

  it('calculates next bid correctly before and after first bid', () => {
    // Before first bid
    expect(calculateNextBid(0, false, 2.00)).toBe(2.00);
    expect(calculateNextBid(0, false, 0.30)).toBe(0.30);

    // After first bid
    expect(calculateNextBid(2.00, true, 2.00)).toBe(2.20);
    expect(calculateNextBid(0.30, true, 0.30)).toBe(0.35);
    expect(calculateNextBid(5.00, true, 2.00)).toBe(5.25);
  });

  it('calculates mandatory squad reserve and max allowable bid', () => {
    // 0 players in squad, purse 120 Cr
    // remaining mandatory slots after this player = max(0, 17 - 0) = 17
    // reserve cash = 17 * 0.30 = 5.10 Cr
    // max allowed bid = 120 - 5.10 = 114.90 Cr
    expect(calculateMaxAllowableBid({ squad: [] as any, purse: 120.00 })).toBe(114.90);

    // 17 players in squad, purse 10 Cr
    // remaining mandatory slots = max(0, 17 - 17) = 0
    // reserve cash = 0 Cr
    // max allowed bid = 10 Cr
    const dummySquad17 = new Array(17).fill({ id: 'p' });
    expect(calculateMaxAllowableBid({ squad: dummySquad17 as any, purse: 10.00 })).toBe(10.00);

    // 10 players in squad, purse 5.00 Cr
    // remaining mandatory slots = 17 - 10 = 7
    // reserve cash = 7 * 0.30 = 2.10 Cr
    // max allowed bid = 5.00 - 2.10 = 2.90 Cr
    const dummySquad10 = new Array(10).fill({ id: 'p' });
    expect(calculateMaxAllowableBid({ squad: dummySquad10 as any, purse: 5.00 })).toBe(2.90);
  });

  it('enforces overseas quota and squad size limits', () => {
    const team: TeamState = {
      id: 'CSK',
      name: 'Chennai Super Kings',
      short: 'CSK',
      color: '#facc15',
      textColor: '#09090b',
      slogan: 'Whistle Podu!',
      aiStyle: 'Tactical',
      aggression: 0.72,
      archetype: 'Tactical Sniper',
      ownerId: 'user-1',
      ownerName: 'Player 1',
      isAI: false,
      purse: 50.00,
      squad: new Array(8).fill({ id: 'os', isOverseas: true }) as any,
      overseasCount: 8,
      roleCounts: { Batter: 4, Bowler: 4, 'All-Rounder': 0, Wicketkeeper: 0 }
    };

    const osPlayer: Player = {
      id: 'p_os',
      name: 'Overseas Star',
      role: 'Batter',
      country: 'AUS',
      isOverseas: true,
      basePrice: 2.00,
      rating: 90,
      set: 1,
      status: 'UPCOMING'
    };

    const indianPlayer: Player = {
      id: 'p_ind',
      name: 'Indian Star',
      role: 'Batter',
      country: 'IND',
      isOverseas: false,
      basePrice: 2.00,
      rating: 90,
      set: 1,
      status: 'UPCOMING'
    };

    // Cannot bid on 9th overseas player
    const resOS = canPlaceBid(team, osPlayer, 2.00, null, true);
    expect(resOS.allowed).toBe(false);
    expect(resOS.reason).toContain('Overseas quota');

    // Can bid on Indian player
    const resInd = canPlaceBid(team, indianPlayer, 2.00, null, true);
    expect(resInd.allowed).toBe(true);
  });

  it('disables AI bidding completely when aiBotsEnabled is false', () => {
    const aiTeam: TeamState = {
      id: 'MI',
      name: 'Mumbai Indians',
      short: 'MI',
      color: '#3b82f6',
      textColor: '#ffffff',
      slogan: 'Duniya Hila Denge!',
      aiStyle: 'Hunter',
      aggression: 0.85,
      archetype: 'Balanced Builder',
      ownerId: null,
      ownerName: 'MI Bot',
      isAI: true,
      purse: 120.00,
      squad: [],
      overseasCount: 0,
      roleCounts: { Batter: 0, Bowler: 0, 'All-Rounder': 0, Wicketkeeper: 0 }
    };

    const player: Player = {
      id: 'p1',
      name: 'Virat Kohli',
      role: 'Batter',
      country: 'IND',
      isOverseas: false,
      basePrice: 2.00,
      rating: 96,
      set: 1,
      status: 'UPCOMING'
    };

    // When aiBotsEnabled is false
    const checkDisabled = canPlaceBid(aiTeam, player, 2.00, null, false);
    expect(checkDisabled.allowed).toBe(false);
    expect(checkDisabled.reason).toContain('AI bots are disabled');

    // When aiBotsEnabled is true
    const checkEnabled = canPlaceBid(aiTeam, player, 2.00, null, true);
    expect(checkEnabled.allowed).toBe(true);
  });
});

describe('Playing XI 100-Point Scoring Engine', () => {
  it('validates playing XI constraints (11 players, <= 4 OS, >= 1 WK)', () => {
    const sampleXI: Player[] = [
      { id: 'p1', name: 'B1', role: 'Batter', isOverseas: false, rating: 90, basePrice: 2, country: 'IND', set: 1, status: 'SOLD' },
      { id: 'p2', name: 'B2', role: 'Batter', isOverseas: false, rating: 88, basePrice: 2, country: 'IND', set: 1, status: 'SOLD' },
      { id: 'p3', name: 'B3', role: 'Batter', isOverseas: true, rating: 92, basePrice: 2, country: 'AUS', set: 1, status: 'SOLD' },
      { id: 'p4', name: 'B4', role: 'Batter', isOverseas: false, rating: 86, basePrice: 1.5, country: 'IND', set: 1, status: 'SOLD' },
      { id: 'p5', name: 'WK1', role: 'Wicketkeeper', isOverseas: false, rating: 91, basePrice: 2, country: 'IND', set: 1, status: 'SOLD' },
      { id: 'p6', name: 'AR1', role: 'All-Rounder', isOverseas: true, rating: 93, basePrice: 2, country: 'WI', set: 1, status: 'SOLD' },
      { id: 'p7', name: 'AR2', role: 'All-Rounder', isOverseas: false, rating: 89, basePrice: 2, country: 'IND', set: 1, status: 'SOLD' },
      { id: 'p8', name: 'BW1', role: 'Bowler', isOverseas: false, rating: 95, basePrice: 2, country: 'IND', set: 1, status: 'SOLD' },
      { id: 'p9', name: 'BW2', role: 'Bowler', isOverseas: true, rating: 91, basePrice: 2, country: 'SA', set: 1, status: 'SOLD' },
      { id: 'p10', name: 'BW3', role: 'Bowler', isOverseas: false, rating: 88, basePrice: 1.5, country: 'IND', set: 1, status: 'SOLD' },
      { id: 'p11', name: 'BW4', role: 'Bowler', isOverseas: true, rating: 90, basePrice: 2, country: 'NZ', set: 1, status: 'SOLD' },
    ];

    const score = calculatePlayingXIScore(sampleXI);
    expect(score.isValid).toBe(true);
    expect(score.validationErrors.length).toBe(0);
    expect(score.wkCount).toBe(1);
    expect(score.overseasCount).toBe(4);
    expect(score.battingCount).toBe(7); // 4 batters + 1 wk + 2 ARs
    expect(score.bowlingCount).toBe(6); // 4 bowlers + 2 ARs
    expect(score.qualityScore).toBeGreaterThan(35);
    expect(score.battingDepthScore).toBeGreaterThan(10);
    expect(score.bowlingDepthScore).toBeGreaterThan(10);
    expect(score.roleFitScore).toBe(15); // 4 (1 WK) + 5 (7 bat) + 6 (6 bowl)
    expect(score.totalScore).toBeGreaterThan(80);
    expect(score.totalScore).toBeLessThanOrEqual(100);
  });
});

