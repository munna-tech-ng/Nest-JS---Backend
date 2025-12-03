import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuthMethodType } from "src/modules/authentication/domain/types/auth-method-type";
import { DeviceDto } from "./device.dto";

export class LoginRequestDto {
    @ApiProperty({
        description: "Authentication method type. Available methods: email, firebase, code, guest",
        enum: ["email", "firebase", "code", "guest"],
        example: "email",
    })
    method: AuthMethodType;

    @ApiProperty({
        description: `Authentication payload (varies by method):
        - email: { email: string, password: string }
        - firebase: { idToken: string }
        - code: { code: string }
        - guest: { isGuest: boolean }`,
        examples: {
            email: {
                summary: "Email Authentication",
                description: "Login with email and password",
                value: {
                    method: "email",
                    payload: {
                        email: "user@example.com",
                        password: "securePassword123",
                    },
                },
            },
            firebase: {
                summary: "Firebase Authentication",
                description: "Login with Firebase ID token",
                value: {
                    method: "firebase",
                    payload: {
                        idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAifQ...",
                    },
                },
            },
            code: {
                summary: "Premium Code Authentication",
                description: "Login with activation/premium code",
                value: {
                    method: "code",
                    payload: {
                        code: "PREMIUM-CODE-12345",
                    },
                },
            },
            guest: {
                summary: "Guest Authentication",
                description: "Login as guest user",
                value: {
                    method: "guest",
                    payload: {
                        isGuest: true,
                    },
                },
            },
        },
    })
    payload: any;

    @ApiPropertyOptional({
        description: "Device information for tracking and security",
        type: DeviceDto,
    })
    device?: DeviceDto;
}
