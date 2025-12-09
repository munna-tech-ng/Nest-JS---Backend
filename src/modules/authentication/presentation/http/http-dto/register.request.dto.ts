import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuthMethodType } from "src/modules/authentication/domain/types/auth-method-type";
import { DeviceDto } from "./device.dto";

export class RegisterRequestDto {
    @ApiProperty({
        description: "Authentication method type",
        enum: ["email", "firebase", "code", "guest", "phone"],
        example: "email",
    })
    method: AuthMethodType;

    @ApiProperty({
        description: "Authentication payload (varies by method)",
        examples: {
            email: {
                value: {
                    name: "John Doe",
                    email: "user@example.com",
                    password: "securePassword123",
                },
            },
            firebase: {
                value: {
                    idToken: "firebase-id-token-string",
                },
            },
            code: {
                value: {
                    code: "premium-code-12345",
                },
            },
            phone: {
                value: {
                    name: "John Doe",
                    type: "otp",
                    phone: "1234567890",
                    password: "securePassword123",
                    otp: "123456",
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

    @ApiPropertyOptional({
        description: "Remember me option - extends cookie expiration time",
        example: false,
        default: false,
    })
    rememberMe?: boolean;
}
