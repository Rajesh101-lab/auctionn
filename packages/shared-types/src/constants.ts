import { FranchiseConfig, Player } from './types';

export const OFFICIAL_FRANCHISES: FranchiseConfig[] = [
  {
    id: 'CSK',
    name: 'Chennai Super Kings',
    short: 'CSK',
    color: '#facc15',
    textColor: '#09090b',
    slogan: 'Whistle Podu! #Yellove',
    aiStyle: 'Tactical & Experienced',
    aggression: 0.72,
    archetype: 'Tactical Sniper'
  },
  {
    id: 'MI',
    name: 'Mumbai Indians',
    short: 'MI',
    color: '#3b82f6',
    textColor: '#ffffff',
    slogan: 'Duniya Hila Denge! #OneFamily',
    aiStyle: 'Star & All-Rounder Hunter',
    aggression: 0.85,
    archetype: 'Balanced Builder'
  },
  {
    id: 'RCB',
    name: 'Royal Challengers Bengaluru',
    short: 'RCB',
    color: '#ef4444',
    textColor: '#ffffff',
    slogan: 'Play Bold! #EeSalaCupNamde',
    aiStyle: 'Aggressive Power-Hitter Focus',
    aggression: 0.88,
    archetype: 'Star Hunter'
  },
  {
    id: 'KKR',
    name: 'Kolkata Knight Riders',
    short: 'KKR',
    color: '#a855f7',
    textColor: '#ffffff',
    slogan: 'Korbo Lorbo Jeetbo! #AmiKKR',
    aiStyle: 'Mystery Spin & Finisher Focus',
    aggression: 0.78,
    archetype: 'Balanced Builder'
  },
  {
    id: 'SRH',
    name: 'Sunrisers Hyderabad',
    short: 'SRH',
    color: '#f97316',
    textColor: '#09090b',
    slogan: 'Orange Army Rise Up! #PlayWithFire',
    aiStyle: 'Ultra-Aggressive Overseas',
    aggression: 0.90,
    archetype: 'Star Hunter'
  },
  {
    id: 'RR',
    name: 'Rajasthan Royals',
    short: 'RR',
    color: '#ec4899',
    textColor: '#ffffff',
    slogan: 'Halla Bol! #RoyalsFamily',
    aiStyle: 'Value & High-OVR Sniper',
    aggression: 0.74,
    archetype: 'Tactical Sniper'
  },
  {
    id: 'DC',
    name: 'Delhi Capitals',
    short: 'DC',
    color: '#2563eb',
    textColor: '#ffffff',
    slogan: 'Roar Macha! #YehHaiNayiDilli',
    aiStyle: 'Balanced Young Core',
    aggression: 0.76,
    archetype: 'Balanced Builder'
  },
  {
    id: 'PBKS',
    name: 'Punjab Kings',
    short: 'PBKS',
    color: '#dc2626',
    textColor: '#ffffff',
    slogan: 'Sadda Punjab! #SherSquad',
    aiStyle: 'Deep Purse Marquee Bidder',
    aggression: 0.86,
    archetype: 'Star Hunter'
  },
  {
    id: 'LSG',
    name: 'Lucknow Super Giants',
    short: 'LSG',
    color: '#06b6d4',
    textColor: '#09090b',
    slogan: 'Gazab Andaz! #AbApniBaariHai',
    aiStyle: 'Pace & All-Rounder Heavy',
    aggression: 0.75,
    archetype: 'Balanced Builder'
  },
  {
    id: 'GT',
    name: 'Gujarat Titans',
    short: 'GT',
    color: '#14b8a6',
    textColor: '#09090b',
    slogan: 'Aava De! #TitansFAM',
    aiStyle: 'Disciplined Death-Over Focus',
    aggression: 0.73,
    archetype: 'Tactical Sniper'
  }
];

export const INITIAL_PLAYER_DATA: Player[] = [
  // SET 1: CAPPED BATTERS (ROUND 1)
  { id: 'p1', set: 1, setName: 'SET 1: CAPPED BATTERS (R1)', name: 'Virat Kohli', role: 'Batter', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 96, specialty: 'Anchor • Chase Master', status: 'UPCOMING' },
  { id: 'p2', set: 1, setName: 'SET 1: CAPPED BATTERS (R1)', name: 'Rohit Sharma', role: 'Batter', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 93, specialty: 'Explosive Opener • Captain', status: 'UPCOMING' },
  { id: 'p3', set: 1, setName: 'SET 1: CAPPED BATTERS (R1)', name: 'Travis Head', role: 'Batter', country: 'AUS', isOverseas: true, basePrice: 2.00, rating: 94, specialty: 'Powerplay Destroyer', status: 'UPCOMING' },
  { id: 'p4', set: 1, setName: 'SET 1: CAPPED BATTERS (R1)', name: 'Suryakumar Yadav', role: 'Batter', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 95, specialty: '360° Middle-Order Enforcer', status: 'UPCOMING' },
  { id: 'p5', set: 1, setName: 'SET 1: CAPPED BATTERS (R1)', name: 'Yashasvi Jaiswal', role: 'Batter', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 92, specialty: 'Aggressive Left-Hand Opener', status: 'UPCOMING' },
  { id: 'p6', set: 1, setName: 'SET 1: CAPPED BATTERS (R1)', name: 'Faf du Plessis', role: 'Batter', country: 'SA', isOverseas: true, basePrice: 1.50, rating: 87, specialty: 'Top-Order Batter • Athlete', status: 'UPCOMING' },
  { id: 'p7', set: 1, setName: 'SET 1: CAPPED BATTERS (R1)', name: 'Rinku Singh', role: 'Batter', country: 'IND', isOverseas: false, basePrice: 1.50, rating: 90, specialty: 'Elite Death-Over Finisher', status: 'UPCOMING' },
  { id: 'p8', set: 1, setName: 'SET 1: CAPPED BATTERS (R1)', name: 'David Miller', role: 'Batter', country: 'SA', isOverseas: true, basePrice: 1.50, rating: 88, specialty: 'Left-Hand Middle Finisher', status: 'UPCOMING' },

  // SET 2: CAPPED BOWLERS (ROUND 1)
  { id: 'p9',  set: 2, setName: 'SET 2: CAPPED BOWLERS (R1)', name: 'Jasprit Bumrah', role: 'Bowler', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 98, specialty: 'Yorker King • All-Phase Pace', status: 'UPCOMING' },
  { id: 'p10', set: 2, setName: 'SET 2: CAPPED BOWLERS (R1)', name: 'Kagiso Rabada', role: 'Bowler', country: 'SA', isOverseas: true, basePrice: 2.00, rating: 91, specialty: 'Express Hit-the-Deck Pace', status: 'UPCOMING' },
  { id: 'p11', set: 2, setName: 'SET 2: CAPPED BOWLERS (R1)', name: 'Mitchell Starc', role: 'Bowler', country: 'AUS', isOverseas: true, basePrice: 2.00, rating: 92, specialty: 'Left-Arm Swing & Death Pace', status: 'UPCOMING' },
  { id: 'p12', set: 2, setName: 'SET 2: CAPPED BOWLERS (R1)', name: 'Arshdeep Singh', role: 'Bowler', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 90, specialty: 'Left-Arm Powerplay & Death', status: 'UPCOMING' },
  { id: 'p13', set: 2, setName: 'SET 2: CAPPED BOWLERS (R1)', name: 'Mohammed Shami', role: 'Bowler', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 91, specialty: 'Seam Movement Specialist', status: 'UPCOMING' },
  { id: 'p14', set: 2, setName: 'SET 2: CAPPED BOWLERS (R1)', name: 'Trent Boult', role: 'Bowler', country: 'NZ', isOverseas: true, basePrice: 2.00, rating: 91, specialty: 'First-Over Wicket Taker', status: 'UPCOMING' },
  { id: 'p15', set: 2, setName: 'SET 2: CAPPED BOWLERS (R1)', name: 'Kuldeep Yadav', role: 'Bowler', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 91, specialty: 'Left-Arm Wrist Spin', status: 'UPCOMING' },
  { id: 'p16', set: 2, setName: 'SET 2: CAPPED BOWLERS (R1)', name: 'Yuzvendra Chahal', role: 'Bowler', country: 'IND', isOverseas: false, basePrice: 1.50, rating: 89, specialty: 'IPL All-Time Leading Spinner', status: 'UPCOMING' },

  // SET 3: CAPPED ALL-ROUNDERS & WKs (ROUND 1)
  { id: 'p17', set: 3, setName: 'SET 3: ALL-ROUNDERS & WKs (R1)', name: 'Hardik Pandya', role: 'All-Rounder', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 94, specialty: 'Fast-Bowling All-Rounder', status: 'UPCOMING' },
  { id: 'p18', set: 3, setName: 'SET 3: ALL-ROUNDERS & WKs (R1)', name: 'Will Jacks', role: 'All-Rounder', country: 'ENG', isOverseas: true, basePrice: 2.00, rating: 89, specialty: 'Explosive Top-Order • Off-Break', status: 'UPCOMING' },
  { id: 'p19', set: 3, setName: 'SET 3: ALL-ROUNDERS & WKs (R1)', name: 'Heinrich Klaasen', role: 'Wicketkeeper', country: 'SA', isOverseas: true, basePrice: 2.00, rating: 94, specialty: 'Elite Spin-Hitting Keeper', status: 'UPCOMING' },
  { id: 'p20', set: 3, setName: 'SET 3: ALL-ROUNDERS & WKs (R1)', name: 'Sanju Samson', role: 'Wicketkeeper', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 91, specialty: 'Top-Order WK • Captain', status: 'UPCOMING' },
  { id: 'p21', set: 3, setName: 'SET 3: ALL-ROUNDERS & WKs (R1)', name: 'Rashid Khan', role: 'All-Rounder', country: 'AFG', isOverseas: true, basePrice: 2.00, rating: 96, specialty: 'World-Class Leg-Spin & Cameos', status: 'UPCOMING' },
  { id: 'p22', set: 3, setName: 'SET 3: ALL-ROUNDERS & WKs (R1)', name: 'Rishabh Pant', role: 'Wicketkeeper', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 93, specialty: 'X-Factor Left-Hand WK', status: 'UPCOMING' },
  { id: 'p23', set: 3, setName: 'SET 3: ALL-ROUNDERS & WKs (R1)', name: 'Sam Curran', role: 'All-Rounder', country: 'ENG', isOverseas: true, basePrice: 2.00, rating: 87, specialty: 'Left-Arm Seam & Floater', status: 'UPCOMING' },
  { id: 'p24', set: 3, setName: 'SET 3: ALL-ROUNDERS & WKs (R1)', name: 'Andre Russell', role: 'All-Rounder', country: 'WI', isOverseas: true, basePrice: 2.00, rating: 92, specialty: 'Power Finisher & Death Bowler', status: 'UPCOMING' },

  // SET 4: BATTERS & ALL-ROUNDERS (ROUND 2)
  { id: 'p25', set: 4, setName: 'SET 4: BATTERS & ALL-ROUNDERS (R2)', name: 'Aiden Markram', role: 'Batter', country: 'SA', isOverseas: true, basePrice: 1.50, rating: 86, specialty: 'Middle-Order & Part-Time Spin', status: 'UPCOMING' },
  { id: 'p26', set: 4, setName: 'SET 4: BATTERS & ALL-ROUNDERS (R2)', name: 'Mitchell Marsh', role: 'All-Rounder', country: 'AUS', isOverseas: true, basePrice: 1.50, rating: 87, specialty: 'Power Top-Order & Medium Pace', status: 'UPCOMING' },
  { id: 'p27', set: 4, setName: 'SET 4: BATTERS & ALL-ROUNDERS (R2)', name: 'KL Rahul', role: 'Wicketkeeper', country: 'IND', isOverseas: false, basePrice: 2.00, rating: 90, specialty: 'Versatile WK-Batter', status: 'UPCOMING' },
  { id: 'p28', set: 4, setName: 'SET 4: BATTERS & ALL-ROUNDERS (R2)', name: 'Tilak Varma', role: 'Batter', country: 'IND', isOverseas: false, basePrice: 1.00, rating: 88, specialty: 'Left-Hand Middle-Order', status: 'UPCOMING' },
  { id: 'p29', set: 4, setName: 'SET 4: BATTERS & ALL-ROUNDERS (R2)', name: 'Axar Patel', role: 'All-Rounder', country: 'IND', isOverseas: false, basePrice: 1.50, rating: 90, specialty: 'Left-Arm Finger Spin & Clean Hitter', status: 'UPCOMING' },
  { id: 'p30', set: 4, setName: 'SET 4: BATTERS & ALL-ROUNDERS (R2)', name: 'Glenn Maxwell', role: 'All-Rounder', country: 'AUS', isOverseas: true, basePrice: 1.50, rating: 88, specialty: 'Big Show • Dynamic Switch-Hit', status: 'UPCOMING' },

  // SET 5: BOWLERS & ALL-ROUNDERS (ROUND 2)
  { id: 'p31', set: 5, setName: 'SET 5: BOWLERS & ALL-ROUNDERS (R2)', name: 'Matheesha Pathirana', role: 'Bowler', country: 'SL', isOverseas: true, basePrice: 1.50, rating: 90, specialty: 'Baby Malinga • Lethal Slinger', status: 'UPCOMING' },
  { id: 'p32', set: 5, setName: 'SET 5: BOWLERS & ALL-ROUNDERS (R2)', name: 'Varun Chakaravarthy', role: 'Bowler', country: 'IND', isOverseas: false, basePrice: 1.50, rating: 89, specialty: 'Mystery Spinner', status: 'UPCOMING' },
  { id: 'p33', set: 5, setName: 'SET 5: BOWLERS & ALL-ROUNDERS (R2)', name: 'Abhishek Sharma', role: 'All-Rounder', country: 'IND', isOverseas: false, basePrice: 1.00, rating: 89, specialty: 'Ultra-High Strike Rate Opener', status: 'UPCOMING' },
  { id: 'p34', set: 5, setName: 'SET 5: BOWLERS & ALL-ROUNDERS (R2)', name: 'Harshit Rana', role: 'Bowler', country: 'IND', isOverseas: false, basePrice: 0.50, rating: 85, specialty: 'Aggressive Hit-the-Deck Pacer', status: 'UPCOMING' },
  { id: 'p35', set: 5, setName: 'SET 5: BOWLERS & ALL-ROUNDERS (R2)', name: 'Noor Ahmad', role: 'Bowler', country: 'AFG', isOverseas: true, basePrice: 1.00, rating: 87, specialty: 'Left-Arm Wrist Spin Prodigy', status: 'UPCOMING' },
  { id: 'p36', set: 5, setName: 'SET 5: BOWLERS & ALL-ROUNDERS (R2)', name: 'Ashutosh Sharma', role: 'Batter', country: 'IND', isOverseas: false, basePrice: 0.30, rating: 82, specialty: 'Fearless Lower-Order Striker', status: 'UPCOMING' },
  { id: 'p37', set: 5, setName: 'SET 5: BOWLERS & ALL-ROUNDERS (R2)', name: 'Mayank Yadav', role: 'Bowler', country: 'IND', isOverseas: false, basePrice: 0.75, rating: 86, specialty: '155+ km/h Thunderbolts', status: 'UPCOMING' },
  { id: 'p38', set: 5, setName: 'SET 5: BOWLERS & ALL-ROUNDERS (R2)', name: 'Nehal Wadhera', role: 'Batter', country: 'IND', isOverseas: false, basePrice: 0.30, rating: 81, specialty: 'Left-Hand Power Middle-Order', status: 'UPCOMING' }
];

