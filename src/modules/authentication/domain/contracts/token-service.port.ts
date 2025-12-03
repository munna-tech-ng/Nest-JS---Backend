import { AuthUser } from "../entities/auth-user.entity";

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
}

export interface TokenServicePort {
    generate(user: AuthUser): Promise<TokenPair>;
    verify(accessToken: string): Promise<{ userId: string }>;
}

export const TOKEN_SERVICE = "TOKEN_SERVICE_PORT";