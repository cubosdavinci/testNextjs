import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UpgradeEscrowToV2", (m) => {
  const proxyAddress = "0x63409cda1551cb49c1bfc5e7d3cb54d5e5536640";

  // ────────────────────────────────────────────────
  // Hardcode the ProxyAdmin address (from explorer / event)
  // Replace with your actual value!
  // Example: 0x1234567890abcdef1234567890abcdef12345678
  // ────────────────────────────────────────────────
  const proxyAdminAddress = "0x2aC98FbaA8F80275BAFA80840E959ed35482C07d";

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress, {
    id: "ProxyAdmin",
  });

  // Optional: typed proxy handle (for reference or tests)
  const proxy = m.contractAt("TransparentUpgradeableProxy", proxyAddress);

  // Deploy new implementation
  const escrowV2 = m.contract("EscrowV2", [], {
    id: "EscrowV2_Implementation",
  });

  // Perform the upgrade – must be signed by the ProxyAdmin owner
  m.call(proxyAdmin, "upgrade", [proxyAddress, escrowV2], {
    id: "upgradeToV2",
    from: "0x2aC98FbaA8F80275BAFA80840E959ed35482C07d",  // proxyAdminOwner
  });

  // Optional: typed V2 proxy for easier interaction in tests/other modules
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