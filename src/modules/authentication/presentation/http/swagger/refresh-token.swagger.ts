import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { RefreshTokenRequestDto } from "../http-dto/refresh-token.request.dto";

export function RefreshTokenApiDocs() {
    return applyDecorators(
        ApiOperation({
            summary: "Refresh Access Token",
            description: `Refresh the access token using a valid refresh token.
            
**Refresh Token Sources (checked in order):**
1. HTTP-only cookie: \`sso_refresh_token\` (for web clients)
2. Header: \`refresh-token\` (alternative method)
3. Request body: \`refreshToken\` field (for API clients)

**Note:** After successful refresh, new tokens are returned in the response body and cookies are updated (if using web client).`,
        }),
        ApiBody({
            type: RefreshTokenRequestDto,
            description: "Optional - refresh token can be provided in cookie or header instead",
            examples: {
                body: {
                    summary: "Refresh Token in Body",
                    description: "Provide refresh token in request body",
                    value: {
                        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                },
                cookie: {
                    summary: "Refresh Token in Cookie",
                    description: "Refresh token automatically read from sso_refresh_token cookie",
                    value: {},
                },
                header: {
                    summary: "Refresh Token in Header",
                    description: "Provide refresh token in refresh-token header",
                    value: {},
                },
            },
        }),
        ApiResponse({
            status: 200,
            description: "Token refresh successful",
            schema: {
                example: {
                    title: "Token Refreshed",
                    message: "Your tokens have been successfully refreshed",
                    error: false,
                    statusCode: 200,
                    data: {
                        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        accessTokenExpiresAt: "2024-12-31T23:59:59.000Z",
                        refreshTokenExpiresAt: "2025-12-31T23:59:59.000Z",
                        user: {
                            id: "123",
                            email: "user@example.com",
                            isGuest: false,
                            provider: "email",
                        },
                    },
                },
            },
        }),
        ApiResponse({ status: 401, description: "Invalid or expired refresh token" }),
    );
}

