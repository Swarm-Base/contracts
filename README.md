# SwarmBase Smart Contracts

Pre-TGE on-chain engagement layer for the SwarmBase protocol. Records community participation, issues soulbound NFT badges, and handles $SWARM token distribution ahead of the token launch.

**Engagement layer (SwarmCore + SwarmBadge):** opBNB Mainnet (ChainId 204) — permanent  
**Production token (SwarmToken):** BNB Smart Chain / BSC (ChainId 56) — deployed at TGE  
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

## Audit — 3 Contracts

Audited by [Hashlock](https://hashlock.com). All findings resolved.

| Contract | File |
|---|---|
| SwarmCore | `contracts/SwarmCore.sol` |
| SwarmBadge | `contracts/SwarmBadge.sol` |
| SwarmToken | `contracts/SwarmToken.sol` |

Flattened single-file versions (for explorer verification only — **not for audit review**): `flattened/`  
Production contract addresses: see `deployment-addresses.json` (pending TGE deploy)

---

## Quick Start

```bash
npm install
npm run deploy:opbnb   # SwarmCore + SwarmBadge on opBNB
npm run deploy:bsc     # SwarmToken on BSC (TGE)
```

---

## Repository Structure

```
contracts/           — 3 audit-scope contracts
flattened/           — single-file flattened versions (for explorer verification)
docs/                — full project documentation
scripts/
  deploy-opbnb.js    — pre-TGE deploy: SwarmCore + SwarmBadge on opBNB
  deploy-bsc.js      — TGE deploy: SwarmToken on BSC
  deploy.js          — full-stack deploy (same-chain, testing reference)
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
