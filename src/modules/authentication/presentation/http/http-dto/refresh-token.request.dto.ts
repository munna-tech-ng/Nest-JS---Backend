import { ApiPropertyOptional } from "@nestjs/swagger";

export class RefreshTokenRequestDto {
    @ApiPropertyOptional({
        description: "Refresh token (optional if provided in cookie or header)",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    })
    refreshToken?: string;
}

