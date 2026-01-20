const { deployProxy } = require('@openzeppelin/upgrades-plugins');
const EscrowV1 = artifacts.require('EscrowV1');

async function deploy() {
    const myCollectible = await deployProxy(EscrowV1, ['EscrowV1', 'MCO'], {
        initializer: 'initialize' // Ensures the 'initialize' function is called
    });
    console.log('MyCollectible deployed to:', myCollectible.address);
}
deploy();