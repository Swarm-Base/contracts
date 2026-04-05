# Audit Scope & Guidance

## Listing Goals

This audit is a prerequisite for two specific listings. Please flag any issues that would block either:

**1. Binance DappBay** (primary target)
DappBay requires audited, verified contracts with no malicious patterns. Specific flags that would block listing:
- Admin keys capable of draining user funds
- Hidden mint or inflation mechanisms
- Owner-controlled blacklist on token transfers
- Unverified contracts on opBNBscan
- Proxy patterns with upgradeability that could change logic post-listing

**2. opBNB ecosystem / BNB Chain**
Contracts are deployed on opBNB Mainnet (ChainId 204). Compatibility with BNBscan contract verification is required. Flattened source files are provided in `flattened/` for this purpose — they are for explorer verification only, not for audit review. The flattened files are longer because they inline all OpenZeppelin dependencies into a single file; the SwarmBase logic is identical to `contracts/`.

If any pattern in the contracts would cause a DappBay review team to flag or reject the submission, please note it explicitly in your findings — even if it does not constitute a traditional security vulnerability.

---

## In Scope

| File | Lines | Priority |
|---|---|---|
| `contracts/SwarmCore.sol` | ~220 | Critical |
| `contracts/SwarmBadge.sol` | ~230 | High |
| `contracts/SwarmToken.sol` | ~180 | High |

Scripts, tests, and frontend code are **not in scope for the security audit**. However, the live frontend at **core.swarmbase.io** is provided as context so auditors can verify that function signatures and ABI match what is deployed on-chain. Any mismatch between the contract interface and the frontend integration is worth noting.

---

## Key Security Properties to Verify

### SwarmCore

1. **No double registration** — `registered[msg.sender]` checked before any state change
2. **No self-referral** — enforced by `require(referrer != msg.sender)`
3. **24h check-in gate** — `block.timestamp >= lastHiveCheckIn + 86400`
4. **Referral milestone ordering** — milestones must fire in sequence (0→1→2→3→4). Verify that skipping is impossible regardless of check-in count
5. **Score overflow** — scores are uint256, unbounded. Verify no overflow risk in practice
6. **Pause coverage** — all state-changing functions have `whenNotPaused` modifier
7. **renounceOwnership disabled** — verify the override correctly prevents renouncing

### SwarmBadge

1. **Soulbound enforcement** — verify `_beforeTokenTransfer` always reverts on non-mint transfers
2. **Gate correctness** — Builder gate (1,000e18), OG gate (5,000e18 + 14 days) read from SwarmCore correctly
3. **OG supply cap** — `ogMinted < OG_MAX_SUPPLY` enforced before mint
4. **Double mint prevention** — `hasBadge()` checked before each mint
5. **Reentrancy** — `ReentrancyGuard` applied on all three mint functions; verify no cross-function reentrancy vectors
6. **lockSwarmCore** — verify that after `lockSwarmCore()` is called, `swarmCore` address cannot be changed
7. **Interface compliance** — SwarmBadge reads `registered`, `swarmScore`, `registrationTime` from SwarmCore interface. Verify these calls cannot revert in unexpected ways.

### SwarmToken

1. **One-time distribute** — `distributed` flag prevents second call; verify it is set before transfers execute
2. **One-time setWallets** — `walletsSet` flag prevents overwrite; verify
3. **Zero-address validation** — `setWallets()` requires all 9 addresses non-zero
4. **Full supply distribution** — verify all 9 amounts sum exactly to `TOTAL_SUPPLY` (1B tokens)
5. **No mint** — verify there is no mint function or any path to inflate supply
6. **BNB rejection** — `receive()` reverts; contract should not be able to hold ETH/BNB accidentally
7. **lockSwarmCore** — informational link only; verify it has no effect on token mechanics

---

## Intentional Design Decisions (Not Bugs)

The following items may appear unusual but are deliberate:

### 18-decimal score storage
`swarmScore` is stored with 18 decimal places (e.g., 25 pts = `25e18`). This is ERC20-style precision for future on-chain composability. The frontend converts via `ethers.formatEther()`. This is not a bug — it is consistent throughout the contract.

### No supply cap on SwarmScore
`swarmScore` is unbounded and grows indefinitely. This is intentional — it is an engagement signal, not a currency. There is no risk of overflow in practice given opBNB's 24h gate on check-ins.

### No on-chain airdrop contract
Distribution of the community allocation is at the owner's full discretion from a Gnosis Safe. This is documented and intentional. There is no MerkleAirdrop contract — this is a design choice, not an omission.

### No vesting contract
Vesting is handled by Team.Finance externally. The token contract distributes directly to Team.Finance lock contract addresses — those addresses are determined off-chain and set via `setWallets()`.

### renounceOwnership() disabled on all contracts
If ownership were renounced, the `pause()` / `unpause()` capability would be permanently lost. We disabled renounce to preserve emergency controls.

### Referral milestone ordering is strict
Referral milestones fire in strict order (3 → 7 → 30 → 90 check-ins). A wallet that somehow skips from check-in 2 to check-in 4 (impossible given the 24h gate, but worth verifying) would not trigger the 3-check-in milestone retroactively. This is intentional — the milestone is point-in-time.

### Score stored per wallet regardless of badge status
Minting a badge does not affect `swarmScore`. Badges are proof of milestone achievement — they do not consume or modify the score.

---

## Known Limitations

- **Off-chain sybil filtering** — The contract cannot fully prevent sybil attacks (no on-chain identity). Anti-sybil design relies on: (a) real calendar time requirements for milestones, (b) referral quality scoring that rewards long-term engagement, (c) off-chain cluster analysis at TGE snapshot time.

- **opBNB block timestamp** — `block.timestamp` is used for the 24h check-in gate and OG badge 14-day registration requirement. opBNB validators can manipulate timestamps within reasonable bounds. The 24h gate has sufficient tolerance that minor timestamp manipulation does not create meaningful attack vectors.

- **No oracle** — There is no price oracle or external data dependency. All logic is self-contained.

---

## Test Suite

38 tests covering all mechanics. Run with:

```bash
npm install
npx hardhat test
```

Expected output: `38 passing`

Test coverage:
- All registration paths (direct, referral, edge cases)
- All referral milestone thresholds (3, 7, 30, 90 check-ins)
- Streak milestone bonuses (7, 30, 90 lifetime check-ins)
- Check-in streak logic (build, reset on 48h miss, cap at 30)
- Pause/unpause
- All badge mint gates (Pioneer, Builder, OG)
- Soulbound transfer revert
- Token distribution (setWallets, distribute, double-call prevention)
- lockSwarmCore on both SwarmBadge and SwarmToken

---

## Live Deployment

All three contracts are deployed on **opBNB Mainnet (ChainId 204)** and have been tested with a 100-wallet realistic simulation. The simulation includes a 4-tier referral tree, varied engagement behaviours, and Pioneer NFT mints. Transaction history is publicly visible on opBNBscan.

| Contract | Address |
|---|---|
| SwarmToken | `0x5B0fdb169Caba66b16C06A1B2D655993114e6458` |
| SwarmCore | `0x333628c9e0C3B300558C1a998534001A31F12314` |
| SwarmBadge | `0xD84296141E1BD55F2B57A5fA62c8254eFbCED08c` |

opBNBscan: https://opbnbscan.com

---

## Questions / Contact

Any questions about design decisions or additional context: swarmbase.io
