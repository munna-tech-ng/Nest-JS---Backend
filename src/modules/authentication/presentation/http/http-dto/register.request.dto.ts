import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuthMethodType } from "src/modules/authentication/domain/types/auth-method-type";
import { DeviceDto } from "./device.dto";

export class RegisterRequestDto {
    @ApiProperty({
        description: "Authentication method type",
        enum: ["email", "firebase", "code", "guest"],
        example: "email",
    })
    method: AuthMethodType;

    @ApiProperty({
        description: "Authentication payload (varies by method)",
        examples: {
            email: {
                value: {
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
        },
    })
    payload: any;

    @ApiPropertyOptional({
        description: "Device information for tracking and security",
        type: DeviceDto,
    })
    device?: DeviceDto;
}
