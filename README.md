# SwarmBase

A pre-TGE on-chain engagement and soulbound badge system built on opBNB Mainnet, with $SWARM token launching on BNB Smart Chain at TGE.

## Technology Stack

- **Blockchain:** opBNB Mainnet (engagement layer) + BNB Smart Chain (token at TGE)
- **Smart Contracts:** Solidity 0.8.24
- **Frontend:** Vanilla JS + ethers.js v6
- **Development:** Hardhat, OpenZeppelin 4.9.x
- **Security:** Audited by Hashlock — all findings resolved

## Supported Networks

- opBNB Mainnet (Chain ID: 204) — SwarmCore + SwarmBadge (live)
- BNB Smart Chain Mainnet (Chain ID: 56) — SwarmToken $SWARM (deployed at TGE)

## Contract Addresses

| Network | Core Contract | Token Contract | Engagement Contract |
|---------|--------------|----------------|---------------------|
| opBNB Mainnet (204) | `0x01f9Eb284F94b54CF0854ef3B6FeF69C10babe0C` (SwarmCore) | TBD at TGE | `0x6f7Cb024E5B285A9E7eE1b9D31e864e9d2B36627` (SwarmBadge) |
| BNB Smart Chain (56) | TBD at TGE (SwarmToken $SWARM) | TBD at TGE | — |

## Features

- **On-chain engagement scoring** — users register, check in daily, and earn SwarmScore; all activity recorded on opBNB Mainnet
- **Referral system** — open referral with tiered quality bonuses; referrers earn ongoing rewards as their referees stay active (3 / 7 / 30 / 90 check-in milestones)
- **Soulbound NFT badges** — three tiers (Pioneer, Builder, OG) gated by SwarmScore; non-transferable after mint, enforced fully on-chain
- **Security with pause control** — owner can pause all state-writing functions; renounceOwnership disabled to preserve emergency controls
- **Gnosis Safe multisig ownership** — both contracts owned by a Gnosis Safe multisig; no single point of failure

## Documentation

| Document | Description |
|---|---|
| [Whitepaper v1.4](docs/SwarmBase-Whitepaper-v1.4.pdf) | Full technical whitepaper |
| [OVERVIEW](docs/OVERVIEW.md) | What SwarmBase is and how the engagement layer works |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | Contract interactions, state machines, scoring formula |
| [TOKENOMICS](docs/TOKENOMICS.md) | $SWARM distribution, vesting, DEX liquidity |
| [AUDIT SCOPE](docs/AUDIT-SCOPE.md) | Audit targets and security properties |
| [DEPLOY GUIDE](DEPLOY.md) | Deployment instructions for opBNB and BSC |

## Quick Start

```bash
npm install
npm run deploy:opbnb   # SwarmCore + SwarmBadge on opBNB
npm run deploy:bsc     # SwarmToken on BSC (TGE)
```

## Repository Structure

```
contracts/           — 3 audited contracts
flattened/           — single-file flattened versions (for explorer verification)
docs/                — full project documentation
scripts/
  deploy-opbnb.js    — pre-TGE deploy: SwarmCore + SwarmBadge on opBNB
  deploy-bsc.js      — TGE deploy: SwarmToken on BSC
  deploy.js          — full-stack deploy (same-chain, testing reference)
hardhat.config.js
deployment-addresses.json
```

## Audit

Audited by [Hashlock](https://hashlock.com). All findings resolved across two audit rounds.

| Document | Description |
|---|---|
| [Final Audit Report](docs/SwarmBase-Audit-Hashlock-Final.pdf) | Hashlock full audit report — all findings resolved |
| [Audit Scope](docs/AUDIT-SCOPE.md) | Audit targets, security properties, and findings summary |

## On-Chain Activity

- Engagement layer live on opBNB Mainnet
- Users can register, check in daily, refer others, and mint soulbound badges
- All activity publicly verifiable on [opBNBscan](https://opbnbscan.com/address/0x01f9Eb284F94b54CF0854ef3B6FeF69C10babe0C)
