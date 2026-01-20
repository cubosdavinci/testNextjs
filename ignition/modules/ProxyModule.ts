import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProxyModule", (m) => {
  // 1️⃣ Admin account for the proxy
  const proxyAdminOwner = m.getAccount(0);

  // 2️⃣ Deploy EscrowV1 implementation
  const escrowv1 = m.contract("EscrowV1");

  // 3️⃣ Deploy proxy pointing to implementation
  const proxy = m.contract("TransparentUpgradeableProxy", [
    escrowv1,
    proxyAdminOwner,
    "0x", // empty data → no initializer via constructor
  ]);

  // 4️⃣ Get ProxyAdmin address from AdminChanged event
  const proxyAdminAddress = m.readEventArgument(proxy, "AdminChanged", "newAdmin");
  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress, { id: "ProxyAdmin" });

  // 5️⃣ Attach EscrowV1 ABI to proxy address — must have unique id!
  const escrowProxy = m.contractAt("EscrowV1", proxy, { id: "EscrowProxy" });

  // 6️⃣ Initialize proxy storage safely
  m.call(escrowProxy, "initialize", [
    "0x68021B74eA6322C745c5CaF0aB062aACE4a5d000", // serverSigner
    "0x6F57fFB102a44EA9E2Ce2A302Ecb3cD2C4b9fb4D", // platformTaxTreasury
    "0x6197B80eE72A4FbcfBE80904d45082C7300d3206", // platformFeeTreasury
    60 // releaseDelay in seconds (1 min here, replace with 259200 for 3 days)
  ]);

  // 7️⃣ Return all handles
  return {
    implementation: escrowv1,
    proxyAdmin,
    proxy,
    escrow: escrowProxy, // typed proxy, for calling methods in tests or other modules
  };
});
