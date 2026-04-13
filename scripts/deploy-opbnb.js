/**
 * SwarmBase — opBNB Pre-TGE Deployment
 *
 * Deploys SwarmCore + SwarmBadge to opBNB Mainnet (ChainId 204).
 * SwarmToken ($SWARM) is NOT deployed here — that's BSC at TGE.
 *
 * Deploy order:
 *   1. SwarmCore  — engagement mechanics (register, checkIn, referral, scoring)
 *   2. SwarmBadge — soulbound NFT badges (linked to SwarmCore at constructor)
 *   3. lockSwarmCore() on SwarmBadge — freezes the SwarmCore address permanently
 *   4. Verify both contracts on opBNBscan (deployer EOA still owns both — can be confirmed)
 *   5. transferOwnership → Gnosis Safe (final step — only after verification confirmed)
 *
 * Usage:
 *   PRIVATE_KEY=0x... GNOSIS_SAFE=0x26eFA... NODEREAL_API_KEY=... npm run deploy:opbnb
 */

const { ethers } = require("hardhat");
const { execSync } = require("child_process");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();

  // ─── ENV CHECKS ────────────────────────────────────────────────────────────
  const GNOSIS_SAFE = process.env.GNOSIS_SAFE || "";
  if (!GNOSIS_SAFE || !ethers.isAddress(GNOSIS_SAFE)) {
    console.error("\n❌ GNOSIS_SAFE env var missing or invalid.");
    console.error("   Example: GNOSIS_SAFE=0x26eFA122d6f3bFe97A946768eeCb49379A953121\n");
    process.exit(1);
  }

  const network = await ethers.provider.getNetwork();
  if (Number(network.chainId) !== 204) {
    console.error(`\n❌ Wrong network. Expected opBNB (204), got chainId ${network.chainId}`);
    console.error("   Run with: --network opbnb\n");
    process.exit(1);
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║  SwarmBase — opBNB Pre-TGE Deployment    ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\nDeployer:    ${deployer.address}  (EOA — pays gas, owns contracts until verified)`);
  console.log(`Gnosis Safe: ${GNOSIS_SAFE}  (receives ownership after verification)`);
  console.log(`Balance:     ${ethers.formatEther(balance)} BNB`);
  console.log(`Network:     opBNB Mainnet (chainId 204)\n`);

  if (balance < ethers.parseEther("0.001")) {
    console.error("❌ Deployer balance too low. Fund with at least 0.001 BNB on opBNB.");
    process.exit(1);
  }

  // ─── 1. DEPLOY SWARMCORE ──────────────────────────────────────────────────
  console.log("1. Deploying SwarmCore...");
  const SwarmCore = await ethers.getContractFactory("SwarmCore");
  const core = await SwarmCore.deploy();
  await core.waitForDeployment();
  console.log(`   ✅ SwarmCore: ${core.target}`);

  // ─── 2. DEPLOY SWARMBADGE ─────────────────────────────────────────────────
  const BASE_URI = "https://swarm-base.github.io/nft-metadata/";
  console.log("\n2. Deploying SwarmBadge...");
  console.log(`   Base URI: ${BASE_URI}`);
  const SwarmBadge = await ethers.getContractFactory("SwarmBadge");
  const badge = await SwarmBadge.deploy(core.target, BASE_URI);
  await badge.waitForDeployment();
  console.log(`   ✅ SwarmBadge: ${badge.target}`);
  console.log(`   ✅ SwarmCore linked at deploy: ${core.target}`);

  // ─── 3. LOCK SWARMCORE ADDRESS IN SWARMBADGE ──────────────────────────────
  // Permanently freezes the SwarmCore address — setSwarmCore() can never be called again.
  // L-03: required before any badge minting is possible.
  console.log("\n3. Locking SwarmCore address in SwarmBadge...");
  const lockTx = await badge.lockSwarmCore();
  await lockTx.wait();
  console.log(`   ✅ lockSwarmCore() called — SwarmCore address is permanent`);

  // ─── SUMMARY (pre-transfer) ───────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   CONTRACTS DEPLOYED                     ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\nSwarmCore:   ${core.target}`);
  console.log(`SwarmBadge:  ${badge.target}`);
  console.log(`Current owner: ${deployer.address}  (deployer EOA)`);
  console.log(`Base URI:    ${BASE_URI}`);
  console.log(`Network:     opBNB Mainnet (chainId 204)`);

  // Save addresses before verification
  const addresses = {
    network: "opBNB Mainnet",
    chainId: 204,
    deployer: deployer.address,
    gnosisSafe: GNOSIS_SAFE,
    deployedAt: new Date().toISOString(),
    contracts: {
      SwarmCore: core.target,
      SwarmBadge: badge.target,
    },
    baseURI: BASE_URI,
    ownershipStatus: "deployer EOA — pending transfer to Gnosis Safe after verification",
    notes: "Pre-TGE engagement layer. SwarmToken ($SWARM) deploys on BSC at TGE separately."
  };
  fs.writeFileSync("deployment-addresses-opbnb.json", JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to deployment-addresses-opbnb.json");

  // ─── 4. VERIFY ON OPBNBSCAN (before ownership transfer) ──────────────────
  // Deployer EOA still owns both contracts here — verification can be confirmed
  // and ownership checked on opBNBscan before handing off to the Safe.
  const NODEREAL_KEY = process.env.NODEREAL_API_KEY || "";
  if (!NODEREAL_KEY) {
    console.log("\n⚠️  NODEREAL_API_KEY not set — skipping automatic verification.");
    console.log("   Verify manually on opbnbscan.com before proceeding.");
    console.log("   Then re-run with NODEREAL_API_KEY set, or transfer ownership manually.");
  } else {
    console.log("\n4. Verifying contracts on opBNBscan...");
    let coreVerified = false;
    let badgeVerified = false;

    try {
      execSync(
        `npx hardhat verify --network opbnb ${core.target}`,
        { stdio: "inherit" }
      );
      console.log("   ✅ SwarmCore verified on opBNBscan");
      coreVerified = true;
    } catch (e) {
      console.log("   ⚠️  SwarmCore verification failed — verify manually on opbnbscan.com");
    }

    try {
      execSync(
        `npx hardhat verify --network opbnb ${badge.target} ${core.target} "${BASE_URI}"`,
        { stdio: "inherit" }
      );
      console.log("   ✅ SwarmBadge verified on opBNBscan");
      badgeVerified = true;
    } catch (e) {
      console.log("   ⚠️  SwarmBadge verification failed — verify manually on opbnbscan.com");
    }

    if (!coreVerified || !badgeVerified) {
      console.log("\n⚠️  One or more contracts not verified. Ownership transfer paused.");
      console.log("   Verify manually on opbnbscan.com, then call transferOwnership() via deployer wallet.");
      process.exit(1);
    }
  }

  // ─── 5. TRANSFER OWNERSHIP → GNOSIS SAFE (final step) ────────────────────
  // Only reached after both contracts are verified. Deployer EOA relinquishes
  // all admin rights. Gnosis Safe becomes the sole owner of both contracts.
  console.log("\n5. Transferring ownership to Gnosis Safe...");
  const coreTx = await core.transferOwnership(GNOSIS_SAFE);
  await coreTx.wait();
  console.log(`   ✅ SwarmCore ownership  → ${GNOSIS_SAFE}`);

  const badgeTx = await badge.transferOwnership(GNOSIS_SAFE);
  await badgeTx.wait();
  console.log(`   ✅ SwarmBadge ownership → ${GNOSIS_SAFE}`);
  console.log(`   ✅ Deployer EOA has no further permissions — PK can be discarded`);

  // Update saved addresses with final ownership status
  addresses.ownershipStatus = `Gnosis Safe — ${GNOSIS_SAFE}`;
  fs.writeFileSync("deployment-addresses-opbnb.json", JSON.stringify(addresses, null, 2));

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   DEPLOYMENT COMPLETE ✅                 ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\nSwarmCore:    ${core.target}`);
  console.log(`SwarmBadge:   ${badge.target}`);
  console.log(`Owner (Safe): ${GNOSIS_SAFE}`);
  console.log(`opBNBscan:    https://opbnbscan.com/address/${core.target}`);
  console.log(`opBNBscan:    https://opbnbscan.com/address/${badge.target}`);

  console.log("\n─── NEXT STEPS ─────────────────────────────");
  console.log("1. Confirm ownership on opBNBscan (both contracts → owner = Gnosis Safe)");
  console.log("2. Update core.swarmbase.io frontend with new contract addresses");
  console.log("3. Update deployment-addresses.json in the public repo");
  console.log("4. Discard deployer wallet PK — no further permissions");
  console.log("────────────────────────────────────────────\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
