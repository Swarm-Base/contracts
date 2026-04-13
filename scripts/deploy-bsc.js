/**
 * SwarmBase — BSC Production TGE Deploy
 *
 * Deploys SwarmToken ($SWARM) ONLY to BNB Smart Chain (ChainId 56).
 * SwarmCore + SwarmBadge are on opBNB — do NOT redeploy them here.
 *
 * Deploy order:
 *   1. SwarmToken ($SWARM) — 1B supply minted directly to Gnosis Safe
 *   2. setWallets()        — configure distribution wallet addresses
 *   3. distribute()        — release tokens to all allocation wallets
 *   4. transferOwnership() — hand contract ownership to Gnosis Safe
 *
 * Cross-chain note:
 *   SwarmCore lives on opBNB. SwarmToken.setSwarmCore() is intentionally
 *   NOT called here — cross-chain calls are not supported. Fee mechanism
 *   on BSC token remains disabled (swarmCoreContract = address(0)) unless
 *   a bridge/cross-chain solution is implemented later.
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
  console.log(`\nDeployer:    ${deployer.address}  (EOA — pays gas only, discard PK after)`);
  console.log(`Gnosis Safe: ${GNOSIS_SAFE}  (receives 1B SWARM + contract ownership)`);
  console.log(`Balance:     ${ethers.formatEther(balance)} BNB`);
  console.log(`Network:     BNB Smart Chain (chainId 56)\n`);

  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Deployer balance too low. Fund with at least 0.01 BNB on BSC.");
    process.exit(1);
  }

  // ─── 1. DEPLOY SWARMTOKEN ──────────────────────────────────────────────────
  // M-01 FIX: 1B SWARM mint directly to Gnosis Safe — deployer EOA never holds supply.
  // Ownership stays with deployer temporarily so we can call setWallets + distribute.
  // transferOwnership → Safe is the final step of this script.

  console.log("1. Deploying SwarmToken ($SWARM)...");
  const SwarmToken = await ethers.getContractFactory("SwarmToken");
  const token = await SwarmToken.deploy(GNOSIS_SAFE);
  await token.waitForDeployment();
  console.log(`   ✅ SwarmToken:          ${token.target}`);
  console.log(`   ✅ 1B SWARM minted to:  ${GNOSIS_SAFE}`);

  // ─── 2. SET DISTRIBUTION WALLETS ─────────────────────────────────────────
  // Fill in real allocation wallet addresses before running.
  // All wallets that are not DEX liquidity should be Gnosis Safe or Team.Finance locks.
  //
  // UNCOMMENT AND FILL IN ADDRESSES BEFORE PRODUCTION DEPLOY:
  //
  // console.log("\n2. Setting distribution wallets...");
  // const setWalletsTx = await token.setWallets(
  //   "0xCOMMUNITY",       // 30% — community rewards (Gnosis Safe)
  //   "0xTEAM",            // 15% — team (Team.Finance lock, 6mo cliff 24mo vest)
  //   "0xECOSYSTEM",       // 15% — ecosystem (Gnosis Safe)
  //   "0xMARKETING",       // 10% — marketing (Gnosis Safe)
  //   "0xSTRATEGIC_ROUND", // 10% — strategic round (Team.Finance lock)
  //   "0xTREASURY",        //  8% — treasury (Gnosis Safe)
  //   "0xLIQUIDITY",       //  7% — DEX liquidity (LP pool — Team.Finance LP lock)
  //   "0xRESERVE",         //  3% — reserve (Gnosis Safe)
  //   "0xSTRATEGIC_PARTNERS" // 2% — strategic partners (Team.Finance lock)
  // );
  // await setWalletsTx.wait();
  // console.log("   ✅ Wallets set");

  // ─── 3. DISTRIBUTE TOKENS ─────────────────────────────────────────────────
  // Call AFTER setWallets(). Releases tokens to all allocation wallets.
  //
  // UNCOMMENT WHEN READY:
  //
  // console.log("\n3. Distributing tokens...");
  // const distributeTx = await token.distribute();
  // await distributeTx.wait();
  // console.log("   ✅ Tokens distributed to all wallets");

  // ─── 4. TRANSFER OWNERSHIP → GNOSIS SAFE ─────────────────────────────────
  // Deployer EOA relinquishes all admin rights. Safe becomes sole owner.
  console.log("\n2. Transferring SwarmToken ownership to Gnosis Safe...");
  const ownerTx = await token.transferOwnership(GNOSIS_SAFE);
  await ownerTx.wait();
  console.log(`   ✅ Ownership transferred → ${GNOSIS_SAFE}`);
  console.log(`   ✅ Deployer EOA has no further permissions — PK can be discarded`);

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   DEPLOYMENT COMPLETE                    ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\nSwarmToken ($SWARM):  ${token.target}`);
  console.log(`Gnosis Safe (owner):  ${GNOSIS_SAFE}`);
  console.log(`Network:              BNB Smart Chain (chainId 56)`);
  console.log(`SwarmCore (opBNB):    separate — engagement layer on opBNB`);
  console.log(`Fee mechanism:        disabled (swarmCoreContract = address(0))`);

  console.log("\n─── NEXT STEPS ─────────────────────────────");
  console.log("1. Uncomment + fill setWallets() and distribute() above, redeploy");
  console.log("2. Verify SwarmToken on BscScan");
  console.log("3. Create Team.Finance locks for Team / Strategic Round / Strategic Partners");
  console.log("4. Create Team.Finance LP lock after DEX listing");
  console.log("5. Discard deployer wallet PK — no further permissions");
  console.log("────────────────────────────────────────────\n");

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
    notes: [
      "M-01 fix: 1B SWARM minted to Gnosis Safe, not deployer EOA",
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
