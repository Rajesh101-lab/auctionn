# IPL Mega Auction Simulation App — Full System Design & Specification

**Document Version:** 2.0 (Complete Production & Handoff Spec)  
**Target Platform:** Web + Mobile (React/Next.js + Capacitor) with Server-Authoritative Real-Time Engine (Node.js + Socket.io)  
**Reference Prototype:** `ipl_mega_auction.html`

---

## Table of Contents
1. [End-to-End User Flow & Room Architecture](#1-end-to-end-user-flow--room-architecture)
2. [AI Bot Engine & Bot Enable/Disable Toggle](#2-ai-bot-engine--ai-bot-enabledisable-toggle)
3. [Official Auction Rules & Calculation Engine](#3-official-auction-rules--calculation-engine)
4. [6-Set Rotation, Unanimous Skip Vote & Accelerated Round](#4-6-set-rotation-unanimous-skip-vote--accelerated-round)
5. [Player Pool & "Player Points" Tab Specification](#5-player-pool--player-points-tab-specification)
6. [Post-Auction Playing XI Builder, Scoring & Winner Selection](#6-post-auction-playing-xi-builder-scoring--winner-selection)
7. [Real-Time Multiplayer Architecture, Socket Events & Database Schema](#7-real-time-multiplayer-architecture-socket-events--database-schema)
8. [UI/UX Design System & Component Breakdown](#8-uiux-design-system--component-breakdown)
9. [Implementation Roadmap for Antigravity](#9-implementation-roadmap-for-antigravity)

---

## 1. End-to-End User Flow & Room Architecture

### 1.1 Screen-by-Screen Flow
1. **Landing Page**:
   - Presents the IPL Mega Auction value proposition, BCCI rules summary (`₹120 Cr` purse cap, `8` max overseas players, `18–25` squad size, 6-set rotation, Playing XI championship scoring), live auction preview card, and primary **Play Auction** button (plus optional quick-start).
2. **Lobby — Create or Join Room**:
   - **Create Room**: Generates a unique room code (format `IPL-XXX`, e.g., `IPL-94X`). Allows the host to configure:
     - Room Name
     - Franchise Purse Limit (default `₹120.00 Cr`)
     - Hammer Countdown Duration (e.g., `8s`, `10s`, `15s`; default `10s`)
     - **AI Bots Toggle (`aiBotsEnabled`)**: `true` (default) or `false`
   - **Join Room**: Join an existing room via room code or active public lobby list as either:
     - **Franchise Owner** (up to **10** owners per room)
     - **Spectator** (up to **20** spectators per room)
   - Maximum concurrent live participants per room: **30** (`10` owners + `20` spectators).
3. **Franchise Selection & Pre-Auction Lobby**:
   - Displays all **10 IPL Franchises**:
     - `CSK` — Chennai Super Kings
     - `MI` — Mumbai Indians
     - `RCB` — Royal Challengers Bengaluru
     - `KKR` — Kolkata Knight Riders
     - `SRH` — Sunrisers Hyderabad
     - `RR` — Rajasthan Royals
     - `DC` — Delhi Capitals
     - `PBKS` — Punjab Kings
     - `LSG` — Lucknow Super Giants
     - `GT` — Gujarat Titans
   - Human owners select an available franchise. Spectators watch the lobby and enter the arena in read-only/chat mode.
   - Displays/allows toggling `aiBotsEnabled` before starting (and optionally during the auction by the room host).
4. **Live Auction Arena**:
   - Player cards appear **one by one** in structured sets.
   - All eligible owners can raise bids (`BID ₹X.XX Cr`) with a countdown hammer timer that resets on every valid bid.
   - Includes **Activity Feed**, **War Room Chat**, **My Squad**, **All 10 Teams**, **Player Sets**, **Player Points**, and **Rules & Math** tabs, plus **Pause/Resume**, **Speed Control** (in solo/practice modes), and **Unanimous Skip Vote**.
5. **Post-Auction Playing XI Builder & Winner Declaration**:
   - Once all 6 sets conclude, each franchise owner selects their **Playing XI** (11 players from their squad) and submits.
   - The app validates each XI, computes the **0–100 Best Team Score** (excluding purse efficiency; equal depth weights for batting and bowling), ranks all teams, and crowns the **Auction Winner**.

---

## 2. AI Bot Engine & AI Bot Enable/Disable Toggle

### 2.1 AI Bots Enable / Disable Control (`aiBotsEnabled`)
- **State Flag**: `room.aiBotsEnabled: boolean` (default `true`).
- **When `aiBotsEnabled = true`**:
  - Any of the 10 franchises not claimed by a human owner is controlled by an AI bot.
  - Bots evaluate active lots, place competitive bids within legal limits, and participate in skip consensus.
- **When `aiBotsEnabled = false`**:
  - **All AI bot bidding is completely disabled.**
  - Unclaimed franchises do **not** place bids and remain inactive/unmanaged.
  - Only human owners present in the room can bid on players.
  - Skip votes only require consensus among **active human owners** in the room (not 10 including bots).
  - Useful for custom friend drafts, 2-to-10 human-player rooms, or testing manual bidding without bot interference.

### 2.2 How AI Bots Decide When `aiBotsEnabled = true`
Every decision tick (staggered with realistic reaction delays of `700ms–2400ms` so bots feel like human bidders rather than instant scripts), each eligible AI franchise executes:

1. **Rule & Eligibility Gate (`canPlaceBid`)**:
   - Checks `room.aiBotsEnabled === true`.
   - Ensures the bot is not already the `currentHighestBidder`.
   - Enforces `squad.length < 25`, `!(player.isOverseas && overseasCount >= 8)`, `purse >= nextBid`, and `nextBid <= maxAllowedBid`.
2. **Intrinsic Player Valuation**:
   - Derived from `player.rating` (`50–99` OVR), `player.basePrice`, and current set importance.
3. **Squad Need & Scarcity Adjustment**:
   - Increases valuation when a franchise has a deficit in a needed role (e.g., `0` wicketkeepers, or low bowling count).
   - Lowers valuation if the franchise already holds a surplus at that role.
4. **Franchise Archetype Modifier**:
   - **Star Hunter** (e.g., `RCB`, `PBKS`, `SRH`): Higher ceiling on top-rated stars; faster early paddle raises.
   - **Tactical Sniper** (e.g., `CSK`, `GT`, `RR`): Disciplined ceiling; selective value bidding.
   - **Balanced Builder** (e.g., `MI`, `KKR`, `DC`, `LSG`): Prioritizes multi-skill players and core balance while protecting purse depth.
5. **Stochastic Variance (`±12%`)**:
   - Adds bounded variation per player so AI ceilings are dynamic and unpredictable.

---

## 3. Official Auction Rules & Calculation Engine

All formulas below must be implemented identically in backend validation and frontend display.

### 3.1 Purse & Squad Limits
- **Default Purse**: $P_{\text{init}} = 120.00\text{ Cr}$ (configurable per room, e.g., `100 Cr`, `120 Cr`, `150 Cr`).
- **Minimum Squad Size**: $S_{\min} = 18$ players.
- **Maximum Squad Size**: $S_{\max} = 25$ players.
- **Maximum Overseas (`OS`) Players per Squad**: $OS_{\max} = 8$ players.
- **Minimum Player Base Price**: $B_{\min} = 0.30\text{ Cr}$ (`30 Lakhs`).

### 3.2 Bid Increment Slabs
Given `currentBid` (after at least one bid has been placed on the current player):

$$\Delta\text{Bid}(\text{currentBid}) = \begin{cases} 0.05\text{ Cr} & \text{if } \text{currentBid} < 1.00 \\ 0.10\text{ Cr} & \text{if } 1.00 \le \text{currentBid} < 2.00 \\ 0.20\text{ Cr} & \text{if } 2.00 \le \text{currentBid} < 5.00 \\ 0.25\text{ Cr} & \text{if } \text{currentBid} \ge 5.00 \end{cases}$$

- **If no bid has been placed yet (`!hasAnyBid`)**:
  $$\text{NextBid} = \text{player.basePrice}$$
- **If a bid exists (`hasAnyBid`)**:
  $$\text{NextBid} = \text{round}_2\big(\text{currentBid} + \Delta\text{Bid}(\text{currentBid})\big)$$

### 3.3 Mandatory Squad Reserve & Maximum Allowable Bid Formula
To guarantee a franchise can always complete the minimum **18-player** squad at `0.30 Cr` per slot:

Let:
- $P_{\text{rem}}$ = Franchise's remaining purse (`₹ Cr`)
- $S_{\text{cur}}$ = Current number of players in the franchise's squad
- $OS_{\text{cur}}$ = Current number of overseas players in the franchise's squad

1. **Mandatory slots still needed *after* winning the current player**:
   $$\text{ReservedSlots} = \max\big(0,\; (S_{\min} - 1) - S_{\text{cur}}\big) = \max\big(0,\; 17 - S_{\text{cur}}\big)$$

2. **Minimum cash reserved for those remaining mandatory slots**:
   $$\text{ReserveCash} = \text{round}_2\big(\text{ReservedSlots} \times B_{\min}\big)$$

3. **Maximum allowable bid (`MaxAllowedBid`)**:
   $$\text{MaxAllowedBid} = \max\big(0,\; \text{round}_2(P_{\text{rem}} - \text{ReserveCash})\big)$$

### 3.4 Complete Bid Validity Predicate
A bid of amount `bidAmount` by `team` on `player` is valid **iff**:
1. `auctionStatus === 'LIVE'` and `!isPaused` and `!lotResolved`.
2. If `team.isAI === true`: `room.aiBotsEnabled === true`.
3. `team.id !== currentHighestBidderId`.
4. `team.squad.length < 25`.
5. `!(player.isOverseas && team.overseasCount >= 8)`.
6. `bidAmount >= getNextValidBid()`.
7. `bidAmount <= team.purse` and `bidAmount <= calculateMaxAllowableBid(team)`.

### 3.5 Settlement Math on `SOLD`
When the timer expires with a valid `highestBidderId` and `currentBid`:
- `winner.purse = round2(winner.purse - currentBid)`
- `winner.squad.push({ ...player, boughtPrice: currentBid })`
- If `player.isOverseas`: `winner.overseasCount += 1`
- `winner.roleCounts[player.role] += 1`
- `player.status = 'SOLD'`, `player.soldTo = winner.id`, `player.soldPrice = currentBid`

---

## 4. 6-Set Rotation, Unanimous Skip Vote & Accelerated Round

### 4.1 Structured Set Order
Players are presented sequentially across **6 sets**:
1. **Set 1**: Batters (Round 1)
2. **Set 2**: Bowlers (Round 1)
3. **Set 3**: All-Rounders & Wicketkeepers (Round 1)
4. **Set 4**: Batters (Round 2)
5. **Set 5**: Bowlers & All-Rounders / Remaining Pool (Round 2)
6. **Set 6**: **Accelerated Unsold Round** — Automatically gathers every player who went `UNSOLD` during Sets 1–5 and presents them one by one at their base price (no second accelerated cycle after Set 6; any still unsold after Set 6 remain `UNSOLD`).

### 4.2 Unanimous Skip Vote Rule
- Each participating human owner (or active voter pool) can cast a **Skip Vote** on the current player card while no bids have been placed (or per room skip rule).
- If **100% of active voters approve skipping**, the current player card immediately closes as `UNSOLD` (added to the unsold queue for Set 6 if in Sets 1–5) and advances to the next player card.
- If a new bid is placed, skip votes reset.

---

## 5. Player Pool & "Player Points" Tab Specification

### 5.1 Player Data Model
Each player in the auction pool has:
- `id`: string
- `name`: string
- `role`: `'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper'`
- `country`: string (e.g., `'IND'`, `'AUS'`, `'ENG'`, `'SA'`, `'NZ'`, `'AFG'`, `'WI'`, `'SL'`)
- `isOverseas`: boolean (`true` if non-Indian, `false` if Indian)
- `basePrice`: number (in `₹ Cr`, e.g., `2.00`, `1.50`, `1.00`, `0.75`, `0.50`, `0.30`)
- `points` (`ovr`): number (`50` to `99` — represents the player's rating/points used for AI valuation, scouting, and Playing XI scoring)
- `set`: number (`1` to `6`)
- `status`: `'UPCOMING' | 'SOLD' | 'UNSOLD'`
- `soldTo`: string | null
- `soldPrice`: number | null

### 5.2 Dedicated "Player Points" Tab
Include a **`Player Points`** tab in the arena/war-room navigation bar listing every player with their **Name** and **Points** (`ovr`), plus helpful scouting details:
- **Columns / Fields**:
  - **Player Name** (with `OS` badge if overseas)
  - **Points** (`ovr` score, e.g., `98 pts`)
  - **Role** (`Batter`, `Bowler`, `All-Rounder`, `Wicketkeeper`)
  - **Country**
  - **Set** (`Set 1`–`Set 6`)
  - **Base Price** (`₹ Cr`)
  - **Status** (`Upcoming`, `Sold — TEAM ₹X.XX Cr`, `Unsold`)
- **Controls**:
  - Search bar by player name
  - Filter by Role (`All`, `Batter`, `Bowler`, `All-Rounder`, `Wicketkeeper`), Origin (`All`, `Indian`, `Overseas`), and Status (`All`, `Upcoming`, `Sold`, `Unsold`)
  - Sort by **Points (High → Low / Low → High)**, **Base Price**, or **Set Order**.

---

## 6. Post-Auction Playing XI Builder, Scoring & Winner Selection

After the auction finishes (all 6 sets completed), each franchise owner builds and submits their **Playing XI** from their acquired squad.

### 6.1 Playing XI Validation Rules
A submitted Playing XI is **valid** only if:
1. It contains **exact 11 players** selected from that franchise's bought squad.
2. It contains **at most 4 Overseas (`isOverseas === true`) players** ($\text{OS}_{\text{XI}} \le 4$).
3. It contains **at least 1 Wicketkeeper (`role === 'Wicketkeeper'`)** ($\text{WK}_{\text{XI}} \ge 1$).

*(If a team has fewer than 11 players or fails validation at submission deadline, flag validation status clearly; if auto-evaluated, pick the highest-scoring legal 11-player subset from available players or apply a penalty.)*

### 6.2 Best Team Score Formula (0–100 Points — No Purse Efficiency, Equal Depth Weights)
Purse efficiency is **excluded**. Batting depth and bowling depth carry **equal maximum points (15 pts each)**.

Let the 11 selected players be $X = \{p_1, p_2, \dots, p_{11}\}$, where each player has points $r_i \in [50, 99]$.

#### Pillar 1: Raw Player Quality — **Max 55 Points**
Measures the overall star power of the 11 players on the field:
$$\overline{R}_{11} = \frac{1}{11}\sum_{i=1}^{11} r_i$$
$$\text{QualityScore} = \text{clamp}\!\left(\frac{\overline{R}_{11} - 60}{35} \times 55,\; 0,\; 55\right)$$

#### Pillar 2: Batting Depth — **Max 15 Points**
Measures batting capability across the lineup (Batters, Wicketkeepers, and All-Rounders contribute to batting depth):
Let $B_{\text{bat}} = \{p \in X \mid p.\text{role} \in \{\text{Batter}, \text{Wicketkeeper}, \text{All-Rounder}\}\}$ and $n_{\text{bat}} = |B_{\text{bat}}|$.
- Depth coverage factor (targeting 7 batting options for full coverage):
  $$c_{\text{bat}} = \min\!\left(1,\; \frac{n_{\text{bat}}}{7}\right)$$
- Batting quality factor:
  $$\overline{R}_{\text{bat}} = \begin{cases} \frac{1}{n_{\text{bat}}}\sum_{p \in B_{\text{bat}}} p.r & \text{if } n_{\text{bat}} > 0 \\ 0 & \text{otherwise} \end{cases}, \qquad q_{\text{bat}} = \text{clamp}\!\left(\frac{\overline{R}_{\text{bat}} - 65}{30},\; 0,\; 1\right)$$
$$\text{BattingDepthScore} = \text{round}_2\Big((0.60 \cdot c_{\text{bat}} + 0.40 \cdot q_{\text{bat}}) \times 15\Big)$$

#### Pillar 3: Bowling Depth — **Max 15 Points**
Measures bowling/20-over coverage across Bowlers and All-Rounders (equal weight to Batting Depth: 15 pts):
Let $B_{\text{bowl}} = \{p \in X \mid p.\text{role} \in \{\text{Bowler}, \text{All-Rounder}\}\}$ and $n_{\text{bowl}} = |B_{\text{bowl}}|$.
- Bowling coverage factor (5+ bowling options = full coverage; `< 5` penalized):
  $$c_{\text{bowl}} = \begin{cases} 1.0 & \text{if } n_{\text{bowl}} \ge 5 \\ \left(\frac{n_{\text{bowl}}}{5}\right) \times 0.75 & \text{if } n_{\text{bowl}} < 5 \end{cases}$$
- Bowling quality factor:
  $$\overline{R}_{\text{bowl}} = \begin{cases} \frac{1}{n_{\text{bowl}}}\sum_{p \in B_{\text{bowl}}} p.r & \text{if } n_{\text{bowl}} > 0 \\ 0 & \text{otherwise} \end{cases}, \qquad q_{\text{bowl}} = \text{clamp}\!\left(\frac{\overline{R}_{\text{bowl}} - 65}{30},\; 0,\; 1\right)$$
$$\text{BowlingDepthScore} = \text{round}_2\Big((0.60 \cdot c_{\text{bowl}} + 0.40 \cdot q_{\text{bowl}}) \times 15\Big)$$

#### Pillar 4: Role & Balance Fit — **Max 15 Points**
Rewards a realistic T20 squad composition in the XI:
- **Wicketkeeper check (up to 4 pts)**: `4` pts if $1 \le \text{WK}_{\text{XI}} \le 2$, else `2` pts.
- **Batting core check (up to 5 pts)**: `5` pts if $4 \le n_{\text{bat}} \le 7$, else `2.5` pts.
- **Bowling attack check (up to 6 pts)**: `6` pts if $4 \le n_{\text{bowl}} \le 6$, else `3` pts.

$$\text{RoleFitScore} = \text{round}_2\big(\text{WK}_{\text{pts}} + \text{BatCore}_{\text{pts}} + \text{BowlAttack}_{\text{pts}}\big)$$

### 6.3 Total Score & Winner Selection
$$\text{TotalScore} = \text{round}_2\big(\text{QualityScore} + \text{BattingDepthScore} + \text{BowlingDepthScore} + \text{RoleFitScore}\big) \in [0, 100]$$

- **Winner**: The franchise with the highest `TotalScore` (among valid submitted XIs).
- **Tie-Breakers** (applied in order if two teams have the exact same `TotalScore`):
  1. Higher `QualityScore`
  2. Higher `BattingDepthScore + BowlingDepthScore`
  3. Highest individual player `points` (`ovr`) inside the Playing XI

---

## 7. Real-Time Multiplayer Architecture, Socket Events & Database Schema

### 7.1 Server-Authoritative Design
- **Single Source of Truth**: The backend holds authoritative room state (`currentBid`, `highestBidderId`, `hammerEndsAt`, `currentSet`, `playerIndex`, `unsoldQueue`, `aiBotsEnabled`, `skipVotes`, `teams`, `playingXIs`).
- **Timestamp Synchronization**: Broadcast `hammerEndsAt` (epoch ms) so clients render smooth countdowns and automatically reconcile on network reconnects via `ROOM_SNAPSHOT`.
- **Race-Condition Safety**: Process `PLACE_BID` events sequentially per room (mutex/queue per `roomCode`) and reject stale bids where `expectedBid !== room.currentBid`.

### 7.2 WebSocket (Socket.io) Event Contract
- **Client → Server**:
  - `CREATE_ROOM`: `{ nickname, roomName, purseLimit, timerSeconds, aiBotsEnabled, role, franchiseCode }`
  - `JOIN_ROOM`: `{ roomCode, nickname, role, franchiseCode }`
  - `SELECT_FRANCHISE`: `{ roomCode, franchiseCode }`
  - `SET_AI_BOTS`: `{ roomCode, aiBotsEnabled }`
  - `START_AUCTION`: `{ roomCode }`
  - `PLACE_BID`: `{ roomCode, expectedBid }`
  - `VOTE_SKIP`: `{ roomCode }`
  - `SEND_CHAT`: `{ roomCode, text }`
  - `SUBMIT_PLAYING_XI`: `{ roomCode, playerIds: string[] }`
- **Server → Client**:
  - `ROOM_SNAPSHOT`: Full room state on connect/reconnect
  - `BID_ACCEPTED`: `{ currentBid, nextBid, highestBidderId, hammerEndsAt }`
  - `BID_REJECTED`: `{ reason }`
  - `LOT_SETTLED`: `{ player, outcome: 'SOLD' | 'UNSOLD', winnerTeamId, finalPrice }`
  - `SET_TRANSITION`: `{ setNumber, setName, isAccelerated }`
  - `CHAT_MESSAGE`: `{ sender, teamId, role, text, timestamp }`
  - `XI_PHASE_STARTED`: `{ deadlineTs }`
  - `AUCTION_WINNER_DECLARED`: `{ leaderboard }`

### 7.3 Relational Schema (PostgreSQL)
```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper')),
  country TEXT NOT NULL,
  is_overseas BOOLEAN NOT NULL DEFAULT FALSE,
  base_price NUMERIC(5,2) NOT NULL,
  points INT NOT NULL CHECK (points BETWEEN 50 AND 99),
  auction_set INT NOT NULL CHECK (auction_set BETWEEN 1 AND 6),
  specialty TEXT
);

CREATE TABLE rooms (
  code VARCHAR(12) PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'LIVE', 'XI_SUBMISSION', 'COMPLETED')),
  purse_limit NUMERIC(6,2) NOT NULL DEFAULT 120.00,
  timer_seconds INT NOT NULL DEFAULT 10,
  ai_bots_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  max_owners INT NOT NULL DEFAULT 10,
  max_spectators INT NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(12) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'SPECTATOR')),
  franchise_code VARCHAR(8),
  remaining_purse NUMERIC(6,2) NOT NULL DEFAULT 120.00,
  is_ai BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE acquired_players (
  id BIGSERIAL PRIMARY KEY,
  room_code VARCHAR(12) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  franchise_code VARCHAR(8) NOT NULL,
  player_id TEXT NOT NULL REFERENCES players(id),
  bought_price NUMERIC(6,2) NOT NULL
);

CREATE TABLE playing_xi_submissions (
  id BIGSERIAL PRIMARY KEY,
  room_code VARCHAR(12) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  franchise_code VARCHAR(8) NOT NULL,
  player_ids JSONB NOT NULL,
  is_valid BOOLEAN NOT NULL,
  quality_score NUMERIC(5,2) NOT NULL,
  batting_depth_score NUMERIC(5,2) NOT NULL,
  bowling_depth_score NUMERIC(5,2) NOT NULL,
  role_fit_score NUMERIC(5,2) NOT NULL,
  total_score NUMERIC(5,2) NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_code, franchise_code)
);
```

---

## 8. UI/UX Design System & Component Breakdown

- **Visual Direction**: High-contrast dark war-room theme (`#09090b` / `#111114` surfaces), tabular monospace numerals (`JetBrains Mono`) for purses, bids, and timers, crisp role/origin badges (`Batter`, `Bowler`, `All-Rounder`, `Wicketkeeper`, `OS`), and a high-visibility emerald green primary `BID` CTA (`#00d26a`).
- **Core Views & Components**:
  1. `LandingView`: Rules overview, preview card, Play entry.
  2. `LobbyView`: Create room (with `aiBotsEnabled` toggle, purse, timer) + Join by code / room list (Owner up to 10, Spectator up to 20).
  3. `TeamSelectionView`: 10 IPL franchise cards, role indicator, bot status indicator, and start trigger.
  4. `AuctionArenaView`:
     - Top set/lot bar + skip vote counter + pause/speed controls
     - Active Player Card + countdown timer bar + current bid + `BID` button + purse & max bid readout
     - 10-team compact purse ticker
     - Tabbed panel: `Activity` (live sold/unsold/bid feed + chat), `My Squad`, `All 10 Teams`, `Player Sets`, `Player Points` (full player name & points directory), `Rules & Math`
  5. `PlayingXIBuilderView`: Interactive 11-player selector from owned squad with live validation (`11` players, `≤ 4` OS, `≥ 1` WK) and live score preview.
  6. `WinnerLeaderboardView`: Final ranked franchises with score breakdown (`Quality`, `Batting Depth`, `Bowling Depth`, `Role Fit`, `Total`) and Champion badge.

---

## 9. Implementation Roadmap for Antigravity

1. **Phase 1 — Shared Domain & Calculation Engine**: Extract bid increment slabs, `calculateMaxAllowableBid`, `canPlaceBid`, 6-set rotation + Set 6 unsold collection, and `calculatePlayingXIScore` (0–100 scale, equal 15-pt batting/bowling depth, no purse efficiency) into shared TypeScript modules with unit tests.
2. **Phase 2 — AI Bot Engine & Bot Toggle**: Implement `aiBotsEnabled` across room creation, lobby, and auction state; ensure AI bots only bid and vote when `aiBotsEnabled === true`.
3. **Phase 3 — Real-Time Multiplayer Backend**: Implement room creation/joining (10 owners + 20 spectators), atomic bid locking, timestamped hammer timers, unanimous skip voting, chat, and reconnect snapshots.
4. **Phase 4 — Frontend & "Player Points" Tab**: Build all screens using the `ipl_mega_auction.html` dark war-room aesthetic, including the searchable/sortable **Player Points** tab and post-auction **Playing XI & Winner** screen.
5. **Phase 5 — Mobile Packaging & Deployment**: Wrap with Capacitor for Android/iOS builds, connect PostgreSQL/Supabase, and deploy web + real-time server.