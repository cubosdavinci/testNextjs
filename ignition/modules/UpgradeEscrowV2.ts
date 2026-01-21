import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("UpgradeEscrowV2", (m) => {
  // 1️⃣ Get admin account
  const proxyAdminOwner = m.getAccount(0);

  // 2️⃣ Deploy EscrowV1 implementation
  const escrowv1 = m.contract("EscrowV2");

  // 2️⃣ Get deployed EscrowProxy and ProxyAdmin
  const escrowProxy = m.contractAt("EscrowV1", "0xYourProxyAddressHere", { id: "EscrowProxy" });
  const proxyAdminAddress = m.readEventArgument(escrowProxy, "AdminChanged", "newAdmin");
  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress, { id: "ProxyAdmin" });

  // 3️⃣ Deploy new implementation: EscrowV2
  const escrowV2 = m.contract("EscrowV2");

  // 4️⃣ Upgrade proxy to new implementation
  m.call(proxyAdmin, "upgrade", [escrowProxy, escrowV2]);

  // 5️⃣ Optional: call new initializer for V2 if it exists
  // m.call(escrowProxy, "initializeV2", [
  //   "0xNewParam1",
  //   "0xNewParam2",
  //   123
  // ]);

  // 6️⃣ Return handles
  return {
    oldImplementation: escrowProxy,
    newImplementation: escrowV2,
    proxyAdmin,
    escrow: m.contractAt("EscrowV2", escrowProxy, { id: "EscrowProxy" }), // attach new ABI
  };
});
