export interface PermitMessage {
  owner: string;
  spender: string;
  value: string;    // wei
  nonce: string;    // uint256 as decimal string
  deadline: string; // uint256 as decimal string
}

export interface PermitSignature extends PermitMessage {
  v: number;
  r: string;
  s: string;
}