import hre from "hardhat";

async function main() {
    const { ethers } = await hre.network.connect({
        network: "amoy",
    });

    const [currentAccount] = await ethers.getSigners();
    console.log("Current account:", currentAccount.address);

    const proxy = "<INSERT_YOUR_PROXY_ADDRESS_HERE>";
    const proxyAdmin = "<INSERT_YOUR_PROXY_ADMIN_ADDRESS_HERE>";
    const v2Implementation = "<INSERT_YOUR_V2_IMPLEMENTATION_ADDRESS_HERE>";

    const proxyAdminContract = await ethers.getContractAt("ProxyAdmin", proxyAdmin);
    const v2 = await ethers.getContractAt("V2", v2Implementation);

    const encodedFunctionCall = v2.interface.encodeFunctionData("decrease");

    console.log("Upgrading to V2...");
    const upgradeTx = await proxyAdminContract.connect(currentAccount).upgradeAndCall(proxy, v2Implementation, encodedFunctionCall);
    await upgradeTx.wait();
    console.log("Upgraded to V2");

    const v2Proxy = await ethers.getContractAt("V2", proxy);
    const currentValue = await v2Proxy.number();
    console.log("Current value after upgrade and call:", currentValue.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});