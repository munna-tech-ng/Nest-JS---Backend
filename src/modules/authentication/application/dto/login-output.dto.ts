import { AuthUser } from "../../domain/entities/auth-user.entity";

export interface LoginOutputDto {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
}