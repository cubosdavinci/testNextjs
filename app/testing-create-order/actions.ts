'use server';

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { normalizeOrderEscrow } from './normalizeOrderEscrow';
import {EscrowOrderEIP712_Types } from "./types/eip712Types"
import { domain } from "./types/AmoyEscrowContract"


// Canonical type definition

export async function createOrderAction(
  productId: string,
  licenseId: string,
) {
  // 1. uint128 orderId
  const orderId = BigInt(
    ethers.hexlify(ethers.randomBytes(16))
  );

  // 2. Load fake order data
  const jsonPath = path.join(
    process.cwd(),
    'app/testing-create-order/fake-orders.json'
  );

  const orderData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // 3. Server wallet (signer / platform key)
  if (!process.env.TRUSTED_PRIVATE_KEY) {
  throw new Error("Missing Private Key to Sign Order Metadata");
  }
  const serverWallet = new ethers.Wallet(process.env.TRUST_SERVER_PRIVATE_KEY!);

  // 4. Build canonical order
  const escrowOrder = normalizeOrderEscrow(orderData);

  console.log("ESCROW ORDER DEBUG:");
  for (const [key, value] of Object.entries(escrowOrder)) {
    console.log(
      `${key}:`,
      value,
      value === undefined || value === null ? "❌ MISSING" : "✅ OK"
    );
  }
    // 5. Sign EIP-712 typed data
  const signature = await serverWallet.signTypedData(
    domain,
    EscrowOrderEIP712_Types,
    escrowOrder
  );

  // 6. Return to client
  return {
    order: escrowOrder,
    signature,
    method: 'createEscrow'
  };
}
