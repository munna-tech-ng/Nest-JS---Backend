import { ApiProperty } from "@nestjs/swagger";
export class AuthUserResponseDto {
    @ApiProperty({
        description: "User name",
        example: "John Doe",
        nullable: true,
    })
    name: string | null;

    @ApiProperty({
        description: "User email address",
        example: "user@example.com",
        nullable: true,
    })
    email: string | null;

    @ApiProperty({
        description: "Whether the user is a guest user",
        example: false,
    })
    isGuest: boolean;

    @ApiProperty({
        description: "Authentication provider used",
        enum: ["email", "firebase", "code", "guest"],
        example: "email",
    })
    provider: string;

    @ApiProperty({
        description: "User activation code",
        example: "12DS-DS89-SDLS-KD12",
    })
    code?: string | null;
}

export class AuthResponseDto {
    @ApiProperty({
        description: "JWT access token for API authentication",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    })
    accessToken: string;

    @ApiProperty({
        description: "JWT refresh token for obtaining new access tokens",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    })
    refreshToken: string;

    @ApiProperty({
        description: "Access token expiration timestamp",
        example: "2024-12-31T23:59:59.000Z",
    })
    accessTokenExpiresAt: Date;

    @ApiProperty({
        description: "Refresh token expiration timestamp",
        example: "2025-12-31T23:59:59.000Z",
    })
    refreshTokenExpiresAt: Date;

    @ApiProperty({
        description: "Authenticated user information",
        type: AuthUserResponseDto,
    })
    user: AuthUserResponseDto;
}
