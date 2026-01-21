import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Optional: import your original deployment module if you want to reference its artifacts
// import OriginalModule from "./ProxyModule"; // ← adjust name/path if you have it

export default buildModule("UpgradeEscrowToV2", (m) => {
  // ────────────────────────────────────────────────────────────────
  // 1. Hardcode existing deployed addresses (already live on-chain)
  // ────────────────────────────────────────────────────────────────
  const proxyAddress = "0x63409cda1551cb49c1bfc5e7d3cb54d5e5536640";
  const proxyAdminOwner = "0x2aC98FbaA8F80275BAFA80840E959ed35482C07d";

  // ProxyAdmin was deployed by TransparentUpgradeableProxy constructor
  // We get its address from the "AdminChanged" event or known slot, but here we compute it
  // (TransparentUpgradeableProxy constructor deploys ProxyAdmin and emits AdminChanged)
  // In practice → read it once from explorer / previous deployment artifact
  // For simplicity we hardcode if you already know it, or use event reading (shown below)

  // Option A: If you know ProxyAdmin address already (recommended - check in explorer)
  // const proxyAdminAddress = "0x...."; // ← fill if you have it

  // Option B: Read from "AdminChanged" event of the proxy (first emission after deployment)
  // This is more robust if you don't have the admin address saved
  const proxy = m.contractAt("TransparentUpgradeableProxy", proxyAddress);

  const adminChangedEvents = m.readEventArguments(
    proxy,
    "AdminChanged",
    ["newAdmin"],
    { count: 1 } // we only need the first (initial) one
  );

  const proxyAdminAddress = adminChangedEvents[0].newAdmin; // first event's newAdmin = ProxyAdmin addr

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress, {
    id: "ProxyAdmin",
  });

  // ────────────────────────────────────────────────────────────────
  // 2. Deploy the new implementation (EscrowV2)
  // ────────────────────────────────────────────────────────────────
  const escrowV2 = m.contract("EscrowV2", [], {
    id: "EscrowV2_Implementation",
  });

  // ────────────────────────────────────────────────────────────────
  // 3. Upgrade the proxy to point to EscrowV2
  //    (call ProxyAdmin.upgrade(address proxy, address newImplementation))
  // ────────────────────────────────────────────────────────────────

  // Simple upgrade (no new initializer / reinitializer)
  m.call(proxyAdmin, "upgrade", [proxyAddress, escrowV2], {
    id: "upgradeToV2",
    from: proxyAdminOwner, // ensures tx is sent from the owner account
  });

  // ────────────────────────────────────────────────────────────────
  // Alternative: if EscrowV2 has a reinitializer(2) or new initialize logic:
  // ────────────────────────────────────────────────────────────────
  /*
  const callData = m.encodeCall(escrowV2, "reinitialize", [
    // params if your reinitializer takes any (usually none if no new vars)
  ]);

  m.call(proxyAdmin, "upgradeAndCall", [proxyAddress, escrowV2, callData], {
    id: "upgradeAndCallV2",
    from: proxyAdminOwner,
  });
  */

  // ────────────────────────────────────────────────────────────────
  // 4. Optional: typed proxy as EscrowV2 for easier interaction/tests
  // ────────────────────────────────────────────────────────────────
  const upgradedEscrow = m.contractAt("EscrowV2", proxyAddress, {
    id: "EscrowProxy_V2",
  });

  return {
    proxyAdmin,
    proxy: proxy,
    newImplementation: escrowV2,
    escrowProxy: upgradedEscrow, // now typed with V2 interface
  };
});