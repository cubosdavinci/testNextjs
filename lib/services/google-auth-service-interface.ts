import { GoogleLinkedAccount } from './google-auth-service-types';

export interface IGoogleAuthService {
  getLinkedAccounts(userId: string): Promise<GoogleLinkedAccount[]>;
}