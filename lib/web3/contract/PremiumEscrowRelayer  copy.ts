import { ethers } from "ethers"
import EscrowProxy_V2 from "@/ignition/deployments/chain-80002/artifacts/UpgradeEscrowToV2#EscrowProxy_V2.json"

export class PremiumEscrowRelayer {
  private provider: ethers.JsonRpcProvider
  private signer: ethers.Wallet
  private contract: ethers.Contract

  constructor(rpcUrl: string, privateKey: string, contractAddress: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
    this.signer = new ethers.Wallet(privateKey, this.provider)
    this.contract = new ethers.Contract(
      contractAddress,
      EscrowProxy_V2.abi,
      this.signer
    )
  }

  getAddress() {
    return this.signer.address
  }

  async getBlockNumber() {
    return this.provider.getBlockNumber()
  }

  /**
   * Register an escrow using a **user-signed permit**
   */
  async registerEscrowFromPermit({
    tokenAddress,
    owner,
    spender,
    value,
    deadline,
    permit,      // { v, r, s }
    escrowData   // any extra escrow info
  }: {
    tokenAddress: string
    owner: string
    spender: string
    value: string | number | bigint
    deadline: number
    permit: { v: number; r: string; s: string }
    escrowData: any
  }) {
    // Submit escrow transaction as relayer
    const tx = await this.contract.registerEscrowWithPermit(
      owner,
      tokenAddress,
      value,
      deadline,
      permit.v,
      permit.r,
      permit.s,
      escrowData
    )

    return await tx.wait()
  }
}
