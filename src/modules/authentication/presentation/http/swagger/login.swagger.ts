import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { LoginRequestDto } from "../http-dto/login.request.dto";

export function LoginApiDocs() {
    return applyDecorators(
        ApiOperation({
            summary: "User Login",
            description: `Authenticate user using one of the available methods:
        
**Available Authentication Methods:**

1. **Email Authentication** (method: "email")
   - Payload: { email: string, password: string }
   - Example: { method: "email", payload: { email: "user@example.com", password: "securePassword123" } }

2. **Firebase Authentication** (method: "firebase")
   - Payload: { idToken: string }
   - Example: { method: "firebase", payload: { idToken: "firebase-id-token" } }

3. **Premium Code Authentication** (method: "code")
   - Payload: { code: string }
   - Example: { method: "code", payload: { code: "PREMIUM-CODE-12345" } }

4. **Guest Authentication** (method: "guest")
   - Payload: { isGuest: boolean }
   - Example: { method: "guest", payload: { isGuest: true } }

5. **Phone Authentication** (method: "phone")
   - Payload: { phone: string, otp: string, password: string }
   - Example: { method: "phone", payload: { phone: "1234567890", otp: "123456", password: "securePassword123" } }

**Optional:** Include device information for tracking and security.`,
        }),
        ApiBody({
            type: LoginRequestDto,
            examples: {
                email: {
                    summary: "Email Login",
                    description: "Login with email and password",
                    value: {
                        method: "email",
                        payload: {
                            email: "user@example.com",
                            password: "securePassword123",
                        },
                        device: {
                            id: "device-uuid-12345",
                            platform: "ios",
                        },
                    },
                },
                firebase: {
                    summary: "Firebase Login",
                    description: "Login with Firebase ID token",
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
                code: {
                    summary: "Premium Code Login",
                    description: "Login with activation/premium code",
                    value: {
                        method: "code",
                        payload: {
                            code: "PREMIUM-CODE-12345",
                        },
                        device: {
                            id: "device-uuid-12345",
                            platform: "web",
                        },
                    },
                },
                guest: {
                    summary: "Guest Login",
                    description: "Login as guest user",
                    value: {
                        method: "guest",
                        payload: {
                            isGuest: true,
                        },
                        device: {
                            id: "device-uuid-12345",
                            platform: "web",
                        },
                    },
                },
                phone: {
                    summary: "Phone Login",
                    description: "Login with phone and password or otp",
                    value: {
                        method: "phone",
                        type: "password",
                        payload: { phone: "1234567890", otp: "123456", password: "securePassword123" },
                        device: {
                            id: "device-uuid-12345",
                            platform: "ios",
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: 200,
            description: "Login successful",
            schema: {
                example: {
                    title: "Login Success",
                    message: "Your login has been successful",
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
        ApiResponse({ status: 401, description: "Invalid credentials" }),
        ApiResponse({ status: 404, description: "User not found" }),
    );
}

