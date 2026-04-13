/**
 * SwarmBase — BSC Production TGE Deploy
 *
 * Deploys SwarmToken ($SWARM) ONLY to BNB Smart Chain (ChainId 56).
 * SwarmCore + SwarmBadge are on opBNB — do NOT redeploy them here.
 *
 * ─── CRITICAL: TOKEN DISTRIBUTION ────────────────────────────────────────────
 * 1B SWARM are minted directly to the Gnosis Safe at construction.
 * The deployer EOA holds ZERO tokens — only contract ownership temporarily.
 *
 * distribute() CANNOT be called by the deployer EOA because:
 *   - distribute() does: _transfer(msg.sender, walletAddress, amount)
 *   - msg.sender = deployer EOA, who has 0 SWARM balance → reverts
 *
 * distribute() MUST be called from the Gnosis Safe (who holds the 1B SWARM).
 * This script handles everything the deployer EOA can do:
 *   1. Deploy SwarmToken (1B SWARM → Gnosis Safe)
 *   2. setWallets() — set all 9 allocation wallet addresses
 *   3. transferOwnership() → Gnosis Safe (deployer loses all permissions)
 * Then from the Gnosis Safe multisig:
 *   4. distribute() — releases tokens from Safe to all allocation wallets
 *
 * Cross-chain note:
 *   SwarmCore lives on opBNB. setSwarmCore() intentionally NOT called here —
 *   cross-chain calls are not supported. Fee mechanism on BSC token remains
 *   disabled (swarmCoreContract = address(0)) unless a bridge solution is
 *   implemented later.
 *
 * Usage:
 *   PRIVATE_KEY=0x... GNOSIS_SAFE=0x26eFA122d6f3bFe97A946768eeCb49379A953121 npm run deploy:bsc
 */

const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();

  // ─── ENV CHECKS ────────────────────────────────────────────────────────────
  const GNOSIS_SAFE = process.env.GNOSIS_SAFE || "";
  if (!GNOSIS_SAFE || !ethers.isAddress(GNOSIS_SAFE)) {
    console.error("\n❌ ERROR: GNOSIS_SAFE env var is missing or invalid.");
    console.error("   Production Safe (BSC): 0x26eFA122d6f3bFe97A946768eeCb49379A953121");
    console.error("   Example: GNOSIS_SAFE=0x26eFA... npx hardhat run scripts/deploy-bsc.js --network bsc\n");
    process.exit(1);
  }

  const network = await ethers.provider.getNetwork();
  if (Number(network.chainId) !== 56) {
    console.error(`\n❌ Wrong network. Expected BSC (56), got chainId ${network.chainId}`);
    console.error("   Run with: --network bsc\n");
    process.exit(1);
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║  SwarmBase — BSC TGE Deployment          ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\nDeployer:    ${deployer.address}`);
  console.log(`             (EOA — pays gas + sets wallets, holds 0 SWARM)`);
  console.log(`Gnosis Safe: ${GNOSIS_SAFE}`);
  console.log(`             (receives 1B SWARM at mint + contract ownership after deploy)`);
  console.log(`Balance:     ${ethers.formatEther(balance)} BNB`);
  console.log(`Network:     BNB Smart Chain (chainId 56)\n`);

  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Deployer balance too low. Fund with at least 0.01 BNB on BSC.");
    process.exit(1);
  }

  // ─── 1. DEPLOY SWARMTOKEN ──────────────────────────────────────────────────
  // M-01 FIX: 1B SWARM mint directly to Gnosis Safe — deployer EOA holds 0 tokens.
  // Deployer EOA retains CONTRACT ownership temporarily (needed for setWallets below).
  // Ownership is transferred to Safe in step 3.

  console.log("1. Deploying SwarmToken ($SWARM)...");
  const SwarmToken = await ethers.getContractFactory("SwarmToken");
  const token = await SwarmToken.deploy(GNOSIS_SAFE);
  await token.waitForDeployment();
  console.log(`   ✅ SwarmToken:          ${token.target}`);
  console.log(`   ✅ 1B SWARM minted to:  ${GNOSIS_SAFE} (Gnosis Safe)`);
  console.log(`   ✅ Deployer EOA holds:  0 SWARM (minted directly to Safe)`);

  // ─── 2. SET DISTRIBUTION WALLETS ─────────────────────────────────────────
  // Called by deployer EOA (current owner) — no token transfers involved.
  // All wallet addresses must be confirmed before running this step.
  // Replace placeholders with real addresses before production deploy.
  //
  // ⚠️  FILL IN ALL 9 ADDRESSES BEFORE RUNNING:
  //
  // console.log("\n2. Setting distribution wallets...");
  // const setWalletsTx = await token.setWallets(
  //   "0xCOMMUNITY",         // 20% — 200M SWARM (Gnosis Safe)
  //   "0xTEAM",              // 15% — 150M SWARM (Team.Finance lock: 12mo cliff, 24mo vest)
  //   "0xECOSYSTEM",         // 15% — 150M SWARM (Gnosis Safe)
  //   "0xMARKETING",         // 12% — 120M SWARM (Gnosis Safe)
  //   "0xSTRATEGIC_ROUND",   // 10% — 100M SWARM (Team.Finance lock: 12mo cliff, 12mo vest)
  //   "0xTREASURY",          //  8% —  80M SWARM (Gnosis Safe)
  //   "0xLIQUIDITY",         //  8% —  80M SWARM (DEX LP wallet, Team.Finance LP lock after listing)
  //   "0xRESERVE",           //  7% —  70M SWARM (Gnosis Safe)
  //   "0xSTRATEGIC_PARTNERS" //  5% —  50M SWARM (Team.Finance lock: 12mo cliff, 12mo vest)
  // );
  // await setWalletsTx.wait();
  // console.log("   ✅ All 9 wallets set");

  // ─── 3. TRANSFER OWNERSHIP → GNOSIS SAFE ─────────────────────────────────
  // Deployer EOA relinquishes all admin rights.
  // After this point: ONLY the Gnosis Safe can call distribute(), burnFees(), etc.
  console.log("\n2. Transferring SwarmToken ownership to Gnosis Safe...");
  const ownerTx = await token.transferOwnership(GNOSIS_SAFE);
  await ownerTx.wait();
  console.log(`   ✅ Ownership transferred → ${GNOSIS_SAFE}`);
  console.log(`   ✅ Deployer EOA has no further permissions`);

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   DEPLOY COMPLETE — ACTION REQUIRED      ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\nSwarmToken ($SWARM):  ${token.target}`);
  console.log(`Gnosis Safe (owner):  ${GNOSIS_SAFE}`);
  console.log(`Network:              BNB Smart Chain (chainId 56)`);
  console.log(`1B SWARM balance:     Gnosis Safe ✅`);
  console.log(`Fee mechanism:        disabled (swarmCoreContract = address(0))`);

  console.log("\n─── NEXT STEPS (in order) ───────────────────────");
  console.log("1. Verify SwarmToken on BscScan");
  console.log("2. Uncomment setWallets() above, fill real addresses, redeploy OR");
  console.log("   call SwarmToken.setWallets() directly from Gnosis Safe on BscScan");
  console.log("3. From Gnosis Safe: call SwarmToken.distribute()");
  console.log("   ⚠️  MUST be called from Safe — Safe holds the 1B SWARM balance");
  console.log("       Deployer EOA holds 0 tokens and cannot distribute");
  console.log("4. Create Team.Finance locks for:");
  console.log("   - Team wallet (12mo cliff, 24mo vest)");
  console.log("   - Strategic Round wallet (12mo cliff, 12mo vest)");
  console.log("   - Strategic Partners wallet (12mo cliff, 12mo vest)");
  console.log("5. Add DEX liquidity on PancakeSwap (BSC)");
  console.log("6. Lock LP tokens on Team.Finance (12 months minimum)");
  console.log("7. Discard deployer wallet PK — no further permissions");
  console.log("──────────────────────────────────────────────────\n");

  // Save addresses
  const addresses = {
    network: "BNB Smart Chain",
    chainId: 56,
    deployer: deployer.address,
    gnosisSafe: GNOSIS_SAFE,
    deployedAt: new Date().toISOString(),
    contracts: {
      SwarmToken: token.target,
      SwarmCore:  "opBNB — see deployment-addresses-opbnb.json",
      SwarmBadge: "opBNB — see deployment-addresses-opbnb.json",
    },
    tokenBalance: `1B SWARM in Gnosis Safe (${GNOSIS_SAFE})`,
    distributionStatus: "pending — call distribute() from Gnosis Safe after setWallets()",
    notes: [
      "M-01 fix: 1B SWARM minted to Gnosis Safe, not deployer EOA",
      "distribute() MUST be called from Gnosis Safe (Safe holds the tokens)",
      "setSwarmCore() not called — SwarmCore is on opBNB (different chain)",
      "Fee mechanism disabled on BSC token (swarmCoreContract = address(0))"
    ]
  };
  fs.writeFileSync("deployment-addresses-bsc.json", JSON.stringify(addresses, null, 2));
  console.log("Addresses saved to deployment-addresses-bsc.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
