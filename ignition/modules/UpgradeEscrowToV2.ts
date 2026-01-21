import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UpgradeEscrowToV2", (m) => {
  const proxyAddress = "0x63409cda1551cb49c1bfc5e7d3cb54d5e5536640";

  // ────────────────────────────────────────────────
  // IMPORTANT: This MUST be the ACTUAL ProxyAdmin contract address
  // (not the owner!)
  // Get it from:
  // 1. Block explorer → proxy creation tx → first AdminChanged event → newAdmin
  // 2. Or read storage slot 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103 on the proxy
  // Your current value ("0x2aC98FbaA8F80275BAFA80840E959ed35482C07d") is the OWNER, not the ProxyAdmin
  // ────────────────────────────────────────────────
  const proxyAdminAddress = "0x2aC98FbaA8F80275BAFA80840E959ed35482C07d"; // ← Replace!

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress, {
    id: "ProxyAdmin",
  });

  const proxy = m.contractAt("TransparentUpgradeableProxy", proxyAddress);

  const escrowV2 = m.contract("EscrowV2", [], {
    id: "EscrowV2_Implementation",
  });

  // ────────────────────────────────────────────────
  // Correct call: use upgradeAndCall + empty data (for simple upgrade)
  // No new initializer → data = "0x"
  // No msg.value needed → no payable
  // ────────────────────────────────────────────────
  m.call(proxyAdmin, "upgradeAndCall", [proxyAddress, escrowV2, "0x"], {
    id: "upgradeToV2",
    from: "0x2aC98FbaA8F80275BAFA80840E959ed35482C07d", // ← this is correct (owner)
  });

  const upgradedEscrow = m.contractAt("EscrowV2", proxyAddress, {
    id: "EscrowProxy_V2",
  });

  return {
    proxyAdmin,
    proxy,
    newImplementation: escrowV2,
    escrowProxy: upgradedEscrow,
  };
});