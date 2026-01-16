import { expect } from "chai";
import { network } from "hardhat";
const { ethers } = await network.connect();
import type { Signer } from "ethers";
import type { EscrowV1 } from "../typechain/EscrowV1.js";

describe("EscrowV1", function () {
  let escrow: EscrowV1;
  let owner: Signer;
  let buyer: Signer;
  let seller: Signer;
  let platformTreasury: Signer;

  let buyerAddress: string;
  let sellerAddress: string;
  let platformTreasuryAddress: string;

  const feeBps = 100; // 1%
  const releaseDelay = 60 * 60 * 24; // 1 day

  beforeEach(async function () {
    [owner, buyer, seller, , platformTreasury] = await ethers.getSigners();

    buyerAddress = await buyer.getAddress();
    sellerAddress = await seller.getAddress();
    platformTreasuryAddress = await platformTreasury.getAddress();

    escrow = await ethers.deployContract("EscrowV1");
    await escrow.initialize(platformTreasuryAddress, feeBps, releaseDelay);
  });

  /**
   * Full Escrow Flow Test
   *
   * Simulates:
   * 1. Buyer creates escrow (total amount sent via msg.value)
   * 2. Buyer confirms delivery → seller receives payout minus platform fee
   * 3. Buyer opens dispute → order goes to Disputed state
   * 4. Owner resolves dispute in favor of buyer → buyer refunded
   * 5. Owner resolves dispute in favor of seller → seller receives funds
   */
  it("Full escrow flow: create, release, dispute, resolve", async function () {
    const orderId = ethers.id("7c9e6679-7425-40de-944b-e07fc1f90ae7");
    const price = ethers.parseEther("1"); // used only for calculation
    const taxBps = 1000; // 10%
    const totalPaid = price + (price * BigInt(taxBps)) / 10_000n;
    const tx = new ethers.Transaction()
    
    tx.value = totalPaid
    // === Create Escrow ===
    await expect(
      escrow.connect(buyer).createEscrow(orderId, sellerAddress, taxBps, { value: totalPaid })
    ).to.emit(escrow, "EscrowCreated")
     .withArgs(orderId, buyerAddress, sellerAddress, totalPaid, taxBps);

    let order = await escrow.orders(orderId);
    expect(order.state).to.equal(1); // Created

    // === Confirm Delivery / Release ===
    const fee = (totalPaid * BigInt(feeBps)) / 10_000n;
    const sellerAmount = totalPaid - fee;

    await expect(
      escrow.connect(buyer).confirmDelivery(orderId)
    ).to.changeEtherBalance(ethers, seller, sellerAmount)
     .and.to.changeEtherBalance(ethers, platformTreasury, fee);

    order = await escrow.orders(orderId);
    expect(order.state).to.equal(2); // Released

    // === Open Dispute ===
    const disputeOrderId = ethers.id("orderDispute");
    await escrow.connect(buyer).createEscrow(disputeOrderId, sellerAddress, taxBps, { value: totalPaid });

    await expect(
      escrow.connect(buyer).openDispute(disputeOrderId)
    ).to.emit(escrow, "OrderDisputed");

    order = await escrow.orders(disputeOrderId);
    expect(order.state).to.equal(3); // Disputed

    // === Resolve Dispute: refund buyer ===
    await expect(
      escrow.resolveDispute(disputeOrderId, true)
    ).to.changeEtherBalance(ethers, buyer, totalPaid);

    order = await escrow.orders(disputeOrderId);
    expect(order.state).to.equal(4); // Refunded

    // === Resolve Dispute: pay seller ===
    const disputeOrderId2 = ethers.id("orderDispute2");
    await escrow.connect(buyer).createEscrow(disputeOrderId2, sellerAddress, taxBps, { value: totalPaid });
    await escrow.connect(buyer).openDispute(disputeOrderId2);

    await expect(
      escrow.resolveDispute(disputeOrderId2, false)
    ).to.changeEtherBalance(ethers, seller, sellerAmount)
     .and.to.changeEtherBalance(ethers, platformTreasury, fee);

    order = await escrow.orders(disputeOrderId2);
    expect(order.state).to.equal(2); // Released
  });
});
