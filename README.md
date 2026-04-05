# SwarmBase Smart Contracts — Audit Repository

Pre-TGE engagement layer for the SwarmBase protocol. Three contracts handle community onboarding, on-chain engagement scoring, and soulbound badge minting ahead of the $SWARM token launch.

---

## Audit Scope

| Contract | Description |
|---|---|
| `SwarmCore.sol` | Engagement mechanics — registration, daily check-in, referral scoring |
| `SwarmBadge.sol` | Soulbound ERC-1155 NFT badges (Pioneer / Builder / OG) |
| `SwarmToken.sol` | $SWARM BEP-20 token — 1B supply, distribution to 9 wallets |

**Out of scope:** `scripts/`, `test/`, anything in `artifacts/`

---

## Deployed Contracts — opBNB Mainnet (ChainId 204)

| Contract | Address |
|---|---|
| SwarmToken | `0x5B0fdb169Caba66b16C06A1B2D655993114e6458` |
| SwarmCore | `0x333628c9e0C3B300558C1a998534001A31F12314` |
| SwarmBadge | `0xD84296141E1BD55F2B57A5fA62c8254eFbCED08c` |

Explorer: https://opbnbscan.com

`lockSwarmCore()` called on SwarmBadge — SwarmCore address is permanently locked.

---

## Compiler Settings

```
Solidity: 0.8.24
EVM Target: paris
Optimizer: disabled
OpenZeppelin: 4.9.x
```

---

## Repository Structure

```
contracts/
  SwarmCore.sol           — Main audit target
  SwarmBadge.sol          — Main audit target
  SwarmToken.sol          — Main audit target

flattened/
  SwarmCore-Flattened.sol   — Single-file for opBNBscan verification
  SwarmBadge-Flattened.sol
  SwarmToken-Flattened.sol

test/
  SwarmBase.test.js       — 38 tests, full coverage of all mechanics

scripts/
  deploy.js               — Deployment script (reference only)
  simulate-100.js         — 100-wallet simulation (reference only)

hardhat.config.js
package.json
deployment-addresses.json
```

---

## Run Tests Locally

```bash
npm install
npx hardhat test
# Expected: 38 passing
```

---

## Contract Mechanics

### SwarmCore

**Registration**
- `register()` — direct registration, awards 50 pts welcome bonus
- `registerWithReferral(address referrer)` — register with referral link; referrer earns 10 pts immediately

**Daily Check-in**
- `hiveCheckIn()` — once per 24h; streak builds multiplier from 1.0x (day 1) to ~3.0x (day 30+)
- Base: 25 pts/day. Peak: ~76 pts/day at streak 30
- Missed >48h resets streak to zero

**Recurring Milestone Bonuses** (lifetime check-in count)
- Every 7 check-ins: +150 pts
- Every 30 check-ins: +500 pts
- Every 90 check-ins: +1,500 pts (takes priority over 30-day on coinciding ticks)

**Referral Quality Scoring**
- Referee's 3rd check-in: referrer earns +100 pts
- Referee's 7th check-in: referrer earns +50 pts
- Referee's 30th check-in: referrer earns +200 pts
- Referee's 90th check-in: referrer earns +500 pts
- Max total per referral: 860 pts (requires referee active for 90 days)

**Anti-sybil design**
- All milestones require real calendar time (24h gate enforced on-chain)
- Referral quality bonuses scale with long-term referee engagement
- Score is a signal only — no fixed token conversion rate

### SwarmBadge

Three soulbound (non-transferable, non-burnable) ERC-1155 NFTs:

| Badge | ID | Gate |
|---|---|---|
| Pioneer | 1 | Registered on SwarmCore |
| Builder | 2 | SwarmScore ≥ 1,000 |
| OG | 3 | SwarmScore ≥ 5,000 + registered ≥ 14 days + max 5,000 supply |

- `renounceOwnership()` disabled
- `lockSwarmCore()` permanently prevents SwarmCore address update post-deploy
- `ReentrancyGuard` on all three mint functions

### SwarmToken

- 1,000,000,000 $SWARM total supply (BEP-20)
- `setWallets()` — owner sets 9 recipient addresses (one-time)
- `distribute()` — distributes full supply across 9 wallets (one-time, irreversible)
- No mint function post-deploy
- `receive()` rejects BNB transfers
- `renounceOwnership()` disabled

**Distribution breakdown (1B total):**

| Allocation | Amount | Vesting |
|---|---|---|
| Community Airdrop | 200M | None (Gnosis Safe, distributed at TGE) |
| Team | 150M | Team.Finance (12mo cliff, 24mo vest) |
| Ecosystem | 150M | Gnosis Safe |
| Marketing | 120M | Gnosis Safe |
| Strategic Round | 100M | Team.Finance (12mo cliff, 12mo vest) |
| Treasury | 80M | Gnosis Safe |
| Liquidity | 80M | DEX LP (locked on Team.Finance) |
| Reserve | 70M | Gnosis Safe |
| Strategic Partners | 50M | Team.Finance (12mo cliff, 12mo vest) |

---

## Key Design Decisions

- **No token address in SwarmCore** — token contract is independent; no circular dependency
- **No on-chain airdrop contract** — distribution from Gnosis Safe at TGE at owner's full discretion; off-chain sybil filtering applied before snapshot
- **No vesting contract** — all vesting handled via Team.Finance
- **No fixed point-to-token conversion** — SwarmScore is an engagement signal, not an entitlement
- **No supply cap on score** — scores grow indefinitely as engagement signals
- **renounceOwnership disabled on all contracts** — prevents accidental permanent loss of pause/unpause

---

## On-Chain Simulation

A 100-wallet realistic simulation was run on opBNB mainnet to demonstrate live contract behaviour:
- 4-tier referral tree (founders → early adopters → community → casual)
- 55 referral registrations, 44 direct registrations
- 57 check-ins, 82 Pioneer NFT mints
- 15 passive wallets (registered + minted, no check-in)
- 15 inactive wallets (registered only)

Full transaction history on opBNBscan:
https://opbnbscan.com/address/0x333628c9e0C3B300558C1a998534001A31F12314

---

## Contact

SwarmBase — swarmbase.io
