import { ethers } from "ethers";
import { ReleaseFundsType } from "./types/eip712/ReleaseFundsType";
import { OrderIdSchema } from "@/lib/zod/OrderIdSchema";

export class ReleaseFundsMessage {
  data: { message: string; orderId: string; signatureDateTime: string };
  signature: string | null;

  constructor(orderId: string, walletProvider: ethers.JsonRpcSigner | ethers.Wallet) {
    // Validate input
    const parsed = OrderIdSchema.parse( orderId );
    console.log("Parsed", parsed)
    // Prepare data for the message
    this.data = {
      message: "Approve the release of your order funds — this action is free.",
      orderId: parsed,
      signatureDateTime: new Date(Date.now()).toISOString(),
    };

    // Initialize signature as null
    this.signature = null;

    // Immediately sign the message if the wallet provider is valid
    if (this.isSigner(walletProvider)) {
      // Sign the message asynchronously, store the signature once signed
      this.sign(walletProvider).then((signature) => {
        this.signature = signature;
      }).catch((error) => {
        console.error("Error signing message:", error);
      });
    } else {
      throw new Error("Invalid wallet provider. It must be a valid signer.");
    }
  }

  // Check if the provider is a valid signer
  isSigner(provider: any): provider is ethers.JsonRpcSigner | ethers.Wallet {
    return provider && typeof provider.getAddress === "function";
  }

  // Sign the message using the Ethers v6 signer (wallet provider)
  async sign(signer: ethers.JsonRpcSigner | ethers.Wallet): Promise<string> {
    try {
      const domain = {}; // Define your EIP-712 domain here

      // Sign the data using the wallet provider
      const signature = await signer.signTypedData(
        domain,
        ReleaseFundsType,
        this.data
      );

      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  }
}
