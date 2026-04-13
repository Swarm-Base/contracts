# SwarmBase — Deployment Guide

## Chain Architecture

| Contract | Chain | Purpose |
|---|---|---|
| SwarmToken ($SWARM) | **BSC (ChainId 56)** — production TGE | Protocol token |
| SwarmCore | **opBNB (ChainId 204)** | Pre-TGE engagement layer |
| SwarmBadge | **opBNB (ChainId 204)** | Soulbound NFT badges |

> SwarmToken is deployed on opBNB for pre-TGE testing only. The production $SWARM token is redeployed on BSC at TGE. SwarmCore and SwarmBadge remain on opBNB permanently.

---

## Pre-TGE Deploy (opBNB Mainnet) — Already Done

Current live addresses:

| Contract | Address |
|---|---|
| SwarmToken (test) | `0x5B0fdb169Caba66b16C06A1B2D655993114e6458` |
| SwarmCore | `0x333628c9e0C3B300558C1a998534001A31F12314` |
| SwarmBadge | `0xD84296141E1BD55F2B57A5fA62c8254eFbCED08c` |

Deployed by: `0x54f3A4e15f1ff2A8e0B21a12d46e108522b91881`

---

## Production TGE Deploy (BSC Mainnet)

### Step 1: Setup

```bash
git clone https://github.com/Swarm-Base/contracts.git && cd contracts
# Ensure PRIVATE_KEY in .env is the Gnosis Safe owner / deployer
```

### Step 2: Deploy SwarmToken on BSC

```bash
npm run deploy:bsc
```

SwarmCore and SwarmBadge do **not** need to be redeployed — they stay on opBNB.

### Step 3: Configure Token

```bash
# Set the 9 allocation wallets (Gnosis Safes + Team.Finance addresses)
SwarmToken.setWallets(
  community,    # Gnosis Safe
  team,         # Team.Finance lock (12mo cliff, 24mo linear)
  ecosystem,    # Gnosis Safe
  marketing,    # Gnosis Safe
  strategic,    # Team.Finance lock (12mo cliff, 12mo linear)
  treasury,     # Gnosis Safe
  liquidity,    # DEX LP wallet (LP tokens locked via Team.Finance)
  reserve,      # Gnosis Safe
  partners      # Team.Finance lock (12mo cliff, 12mo linear)
)

# Distribute full 1B supply in one transaction
SwarmToken.distribute()
```

### Step 4: Post-Distribution

1. Create 3 Team.Finance vesting locks (Team / Strategic Round / Strategic Partners)
2. Add liquidity on PancakeSwap (BSC) — lock LP tokens on Team.Finance for 12 months
3. Verify SwarmToken on BscScan
4. Discard deployer EOA private key — ownership already transferred to Gnosis Safe by deploy script

### Step 5: Verify on opBNBscan

After production deploy of SwarmCore and SwarmBadge (deploy-opbnb.js), verify both contracts on opBNBscan using the flattened files in `flattened/`. The NODEREAL_API_KEY env var enables automatic verification in deploy-opbnb.js.

---

## Owner Requirements

- **Pre-TGE testing:** EOA acceptable
- **Production:** All contracts must be owned by a Gnosis Safe multisig before TGE

---

## Emergency Controls

| Contract | Function | Effect |
|---|---|---|
| SwarmCore | `pause()` / `unpause()` | Freeze / resume all engagement |
| SwarmBadge | `pause()` / `unpause()` | Freeze / resume badge minting |
| SwarmToken | None post-distribute | Immutable after distribute() |

`renounceOwnership()` is disabled on all contracts — emergency controls must be preserved.
