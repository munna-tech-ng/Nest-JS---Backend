export class AuthUserResponseDto {
    id: string;
    email: string | null;
    isGuest: boolean;
    provider: string;
}

export class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    user: AuthUserResponseDto;
}
