# SwarmBase Smart Contracts

Pre-TGE on-chain engagement layer for the SwarmBase protocol. Records community participation, issues soulbound NFT badges, and handles $SWARM token distribution ahead of the token launch.

**Engagement layer (SwarmCore + SwarmBadge):** opBNB Mainnet (ChainId 204) — permanent  
**Production token (SwarmToken):** BNB Smart Chain / BSC (ChainId 56) — deployed at TGE  
**Pre-TGE token test deploy:** opBNB Mainnet (same addresses below, for testing only)  
**Compiler:** Solidity 0.8.24 · OpenZeppelin 4.9.x · Optimizer enabled (200 runs)

---

## Documentation

| Document | Description |
|---|---|
| [Whitepaper v1.4](docs/SwarmBase-Whitepaper-v1.4.pdf) | Full technical whitepaper — also at swarmbase.io/whitepaper |
| [OVERVIEW](docs/OVERVIEW.md) | What SwarmBase is, how the engagement layer works, what happens at TGE |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | Contract interactions, state machines, scoring formula, events |
| [TOKENOMICS](docs/TOKENOMICS.md) | $SWARM distribution, vesting, DEX liquidity, airdrop mechanics |
| [ROADMAP](docs/ROADMAP.md) | Phased delivery: Phase 1 (live) through Phase 5 (full decentralization) |
| [AUDIT SCOPE](docs/AUDIT-SCOPE.md) | Audit targets, security properties to verify, known design decisions |

**Start here:** [docs/OVERVIEW.md](docs/OVERVIEW.md) → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) → [docs/AUDIT-SCOPE.md](docs/AUDIT-SCOPE.md)

---

## Audit Scope — 3 Contracts

| Contract | Address (opBNB) |
|---|---|
| `contracts/SwarmCore.sol` | `0x333628c9e0C3B300558C1a998534001A31F12314` |
| `contracts/SwarmBadge.sol` | `0xD84296141E1BD55F2B57A5fA62c8254eFbCED08c` |
| `contracts/SwarmToken.sol` | `0x5B0fdb169Caba66b16C06A1B2D655993114e6458` |

Flattened single-file versions (for opBNBscan verification only — **not for audit review**): `flattened/`

---

## Quick Start

```bash
npm install
npx hardhat test     # 38 passing
```

---

## Repository Structure

```
contracts/           — 3 audit-scope contracts
flattened/           — single-file flattened versions
docs/                — full project documentation
test/                — 38 tests, full mechanics coverage
scripts/
  deploy.js          — deployment script
  simulate-100.js    — 100-wallet realistic simulation
hardhat.config.js
deployment-addresses.json
```

---

## On-Chain Activity

A 100-wallet simulation was run on opBNB Mainnet demonstrating:
- 4-tier referral tree (founders → early adopters → community → casual)
- 55 referral registrations, 44 direct
- 57 check-ins, 82 Pioneer NFT mints
- 15 passive (registered + minted, no check-in)
- 15 inactive (registered only)

View all transactions: [opbnbscan.com/address/0x333628c9e0C3B300558C1a998534001A31F12314](https://opbnbscan.com/address/0x333628c9e0C3B300558C1a998534001A31F12314)
