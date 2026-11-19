# IPL Mega Auction Simulator — Production Architecture & Verification

## 1. Overview
The **IPL Mega Auction Simulator** is a complete, production-grade real-time multiplayer application engineered according to `ipl_mega_auction_simulator_complete_system_design_specification.md` and elevated from the prototype `ipl_mega_auction_simulator.html`.

It features a server-authoritative engine with Socket.io real-time synchronization, official BCCI auction calculation rules, dynamic AI franchise archetypes with an **AI Bot Toggle (`aiBotsEnabled`)**, a dedicated **Player Points Directory**, and a post-auction **100-Point Playing XI Championship Calculator**.

---

## 2. Monorepo Structure

```
Auctionn/
├── package.json                   # Root monorepo workspace scripts
├── pnpm-workspace.yaml            # Monorepo packages and apps
├── packages/
│   └── shared-types/              # Shared types, constants, BCCI auction math & XI scoring engine
│       ├── src/
│       │   ├── types.ts           # Player, Franchise, Room, Bid & Scoring types
│       │   ├── constants.ts       # 10 Official Franchises & Structured Player Pool
│       │   ├── engine.ts          # BCCI bid increment slabs, reserve math, canPlaceBid, AI valuation, XI score
│       │   └── index.ts
│       ├── test/
│       │   └── engine.test.ts     # Vitest unit test suite (100% pass)
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
├── apps/
│   ├── server/                    # Server-authoritative Node.js + Express + Socket.io backend
│   │   ├── src/
│   │   │   ├── RoomManager.ts     # Room lifecycle, 6 sets, unanimous skip vote, atomic bid mutex, AI schedule
│   │   │   └── index.ts          # REST endpoints (/api/rooms, /api/health) & Socket.io event handling
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                       # High-performance React 18 + Vite + Tailwind CSS dark war-room frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── Arena.tsx      # Main live auction block, hammer timer, quick ticker, tabs, controls
│       │   │   ├── Lobby.tsx      # Landing page, Room creation with aiBotsEnabled toggle, join code flow
│       │   │   ├── PlayerPointsTab.tsx # Full scouting directory (search, filters, OVR points sorting)
│       │   │   ├── PlayingXIBuilder.tsx # 11-player lineup builder with live 4-pillar score breakdown
│       │   │   └── WinnerLeaderboard.tsx # Championship podium, tie-breakers, squad rosters, confetti
│       │   ├── utils/
│       │   │   └── sounds.ts      # Web Audio synthesized sound FX (bids, sold gavel, unsold)
│       │   ├── App.tsx            # Main state manager & Socket.io client provider
│       │   ├── index.css          # Tailwind CSS with dark theme, scrollbars, glowing CTAs
│       │   └── main.tsx
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── tsconfig.json
```

---

## 3. Core Engine & Authoritative Rules Implemented

### 3.1 BCCI Bid Increment Slabs
- `< ₹1.00 Cr`: `+₹0.05 Cr`
- `₹1.00 – ₹2.00 Cr`: `+₹0.10 Cr`
- `₹2.00 – ₹5.00 Cr`: `+₹0.20 Cr`
- `≥ ₹5.00 Cr`: `+₹0.25 Cr`
- Handled with floating-point round2 precision to prevent fractional cent drift.

### 3.2 Mandatory Squad Reserve & `MaxAllowedBid`
$$\text{ReservedSlots} = \max\big(0,\; 17 - \text{currentSquadSize}\big)$$
$$\text{ReserveCash} = \text{ReservedSlots} \times 0.30\text{ Cr}$$
$$\text{MaxAllowedBid} = \max\big(0,\; \text{Purse} - \text{ReserveCash}\big)$$
Prevents franchises from overbidding and guarantees each team can field the mandatory 18-player minimum squad.

### 3.3 6-Set Rotation & Accelerated Round
1. **Set 1**: Capped Batters (Round 1)
2. **Set 2**: Capped Bowlers (Round 1)
3. **Set 3**: Capped All-Rounders & WKs (Round 1)
4. **Set 4**: Batters & All-Rounders (Round 2)
5. **Set 5**: Bowlers & All-Rounders (Round 2)
6. **Set 6**: **Accelerated Unsold Round** — Automatically ingests players who went unsold during Sets 1–5 and re-presents them one-by-one.

### 3.4 Unanimous Skip Voting
- Available on active lots before any franchise places an opening bid.
- Reaching consensus of all active voters immediately closes the lot as `UNSOLD` and advances to the next player.

### 3.5 AI Bot Engine & `aiBotsEnabled` Toggle
- **`aiBotsEnabled = true`**: Unclaimed franchises are managed by AI bots using one of three archetypes:
  - **Star Hunter** (`RCB`, `PBKS`, `SRH`): Higher ceiling for 90+ OVR players.
  - **Tactical Sniper** (`CSK`, `GT`, `RR`): Target bowlers/WKs with high value discipline.
  - **Balanced Builder** (`MI`, `KKR`, `DC`, `LSG`): Balanced squad composition, premium on all-rounders.
- **`aiBotsEnabled = false`**: All AI bot bidding is completely shut down. Unclaimed franchises remain idle, allowing pure human-vs-human rooms without bot interference.

---

## 4. Player Points Tab & 100-Point Playing XI Calculator

### 4.1 Player Points Tab
- Located inside the Arena tabs with an amber trophy indicator.
- Displays every player's name, overseas badge, **Points (OVR rating)**, role, country, set, base price, and live auction status.
- Equipped with:
  - Real-time text search (name, country, specialty)
  - Role filter (`Batter`, `Bowler`, `All-Rounder`, `Wicketkeeper`)
  - Origin filter (`Indian`, `Overseas`)
  - Sort by Points (High $\to$ Low, Low $\to$ High), Base Price, or Set order.

### 4.2 100-Point Playing XI Winner Calculator
A submitted XI is valid only if:
- Exactly **11 players**
- $\le 4$ **Overseas players**
- $\ge 1$ **Wicketkeeper**

Scored across **4 Pillars (100 Points Total)**:
1. **Raw Player Quality (Max 55 pts)**: $\text{clamp}\big(\frac{\overline{R}_{11} - 60}{35} \times 55,\; 0,\; 55\big)$
2. **Batting Depth (Max 15 pts)**: $(0.60 \cdot c_{\text{bat}} + 0.40 \cdot q_{\text{bat}}) \times 15$
3. **Bowling Depth (Max 15 pts)**: $(0.60 \cdot c_{\text{bowl}} + 0.40 \cdot q_{\text{bowl}}) \times 15$
4. **Role & Balance Fit (Max 15 pts)**: WK check ($4$ pts) + Batting Core ($5$ pts) + Bowling Attack ($6$ pts)

**Winner Determination & Tie-Breakers**:
1. Higher Total Score
2. Higher Quality Score
3. Higher Batting Depth + Bowling Depth
4. Highest individual player rating in the XI

---

## 5. Verification & Test Execution

- **Vitest Unit Tests**: `pnpm --filter @ipl/shared-types test` &rarr; 6/6 tests passed.
- **Server Bundle Build**: `pnpm --filter @ipl/server build` &rarr; ESM compiled successfully.
- **Web App Build**: `pnpm --filter @ipl/web build` &rarr; Vite production bundle built with 0 errors.
- **Full Monorepo Build**: `pnpm build` verified clean build across all three projects.

