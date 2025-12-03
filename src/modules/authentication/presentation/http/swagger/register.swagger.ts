import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { RegisterRequestDto } from "../http-dto/register.request.dto";

export function RegisterApiDocs() {
    return applyDecorators(
        ApiOperation({
            summary: "User Registration",
            description: `Register a new user using one of the available methods:
        
**Available Registration Methods:**

1. **Email Registration** (method: "email")
   - Payload: { email: string, password: string, name: string }
   - Example: { method: "email", payload: { email: "user@example.com", password: "securePassword123", name: "John Doe" } }

2. **Firebase Registration** (method: "firebase")
   - Payload: { idToken: string }
   - Example: { method: "firebase", payload: { idToken: "firebase-id-token" } }

**Note:** After successful registration, the user will be automatically logged in and receive authentication tokens.

**Optional:** Include device information for tracking and security.`,
        }),
        ApiBody({
            type: RegisterRequestDto,
            examples: {
                email: {
                    summary: "Email Registration",
                    description: "Register with email, password, and name",
                    value: {
                        method: "email",
                        payload: {
                            email: "user@example.com",
                            password: "securePassword123",
                            name: "John Doe",
                        },
                        device: {
                            id: "device-uuid-12345",
                            platform: "ios",
                        },
                    },
                },
                firebase: {
                    summary: "Firebase Registration",
                    description: "Register with Firebase ID token",
                    value: {
                        method: "firebase",
                        payload: {
                            idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAifQ...",
                        },
                        device: {
                            id: "device-uuid-12345",
                            platform: "android",
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: 200,
            description: "Registration successful and user logged in",
            schema: {
                example: {
                    title: "Registration Complete",
                    message: "Your registration has been successful",
                    error: false,
                    statusCode: 200,
                    data: {
                        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        accessTokenExpiresAt: "2024-12-31T23:59:59.000Z",
                        refreshTokenExpiresAt: "2025-12-31T23:59:59.000Z",
                        user: {
                            email: "user@example.com",
                            isGuest: false,
                            provider: "email",
                        },
                    },
                },
            },
        }),
        ApiResponse({ status: 400, description: "Bad request - Invalid payload or unsupported method" }),
        ApiResponse({ status: 409, description: "Conflict - User with this email already exists" }),
    );
}

