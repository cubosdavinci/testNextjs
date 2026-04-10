import { GoogleLinkedAccount, NewAccessToken } from './GoogleAuthServiceTypes';

export interface IGoogleAuthService {
  getLinkedAccounts(userId: string): Promise<GoogleLinkedAccount[]>;
  refreshAccessToken( refreshToken: string, id: string): Promise<GoogleLinkedAccount | NewAccessToken>
}


