// actions/createOrder.ts
'use server';

import { AMOY_DOMAIN as domain} from '../types/AmoyDomain';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { EscrowOrderEIP712Serializable, EscrowOrderPayloadTypesEIP712 } from "../types/EscrowOrderPayloadEIP712Types";
import { normalizeOrderEscrow } from '../normalizeOrderEscrow';

export type CreateOrderState = {
    order?: EscrowOrderEIP712Serializable;
    signature?: string;
    errors?: { message: string };
};

// -----------------------------------------------------------------------------
// 1️⃣ Register / retrieve raw order
export async function registerOrder(productId: string, licenseId: string) {
  try {
    const jsonPath = path.join(
      process.cwd(),
      'app/testing-create-order/fake-orders.json'
    );

    const orderData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // In future: filter by productId / licenseId
    return { rawOrder: orderData };
  } catch (err) {
    console.log(err);
    return { errors: { message: 'Failed to read order data' } };
  }
}

// -----------------------------------------------------------------------------
// 2️⃣ Parse, validate, and sign order payload
export async function signOrderPayload(rawOrder: any) {
  try {
    const serverPK = process.env.TRUSTED_SERVER_PRIVATE_KEY!
    console.log("Server Provate Key: ", serverPK)
    if (!serverPK) {

      throw new Error("Missing Private Key to Sign Order Metadata");
    }

    // Build canonical order
    const escrowOrderPayload: EscrowOrderEIP712Serializable = normalizeOrderEscrow(rawOrder, true);

    // Validate required fields
    for (const [key, value] of Object.entries(escrowOrderPayload)) {
      if (value === undefined || value === null) {
        throw new Error(`Missing required field: ${key}`);
      }
    }

    // Server wallet (signer)
    const serverWallet = new ethers.Wallet(process.env.TRUSTED_SERVER_PRIVATE_KEY!);

    // Sign EIP-712 typed data
    const signature = await serverWallet.signTypedData(
      domain,
      EscrowOrderPayloadTypesEIP712,
      escrowOrderPayload
    );

    return { order: escrowOrderPayload, signature };
  } catch (err: any) {
    console.log(err);
    return { errors: { message: err.message || 'Failed to sign order payload' } };
  }
}

// -----------------------------------------------------------------------------
// 3️⃣ Wrapper action: register + sign
export async function createOrderAction(
  state: CreateOrderState,
  form: FormData
): Promise<CreateOrderState> {

  // Placeholder for productId / licenseId extraction from form
  const productId = form.get('productId')?.toString() || 'prod_default';
  const licenseId = form.get('licenseId')?.toString() || 'lic_default';

  // 1️⃣ Retrieve raw order
  const { rawOrder, errors } = await registerOrder(productId, licenseId);
  if (errors) return { errors };

  // 2️⃣ Sign payload
  const result = await signOrderPayload(rawOrder);
  return result;
}
