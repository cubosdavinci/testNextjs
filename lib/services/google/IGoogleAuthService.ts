import { GoogleLinkedAccount } from './GoogleAuthServiceTypes';

export interface IGoogleAuthService {
  getLinkedAccounts(userId: string): Promise<GoogleLinkedAccount[]>;
}