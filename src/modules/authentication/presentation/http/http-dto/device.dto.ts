import { ApiProperty } from "@nestjs/swagger";

export class DeviceDto {
    @ApiProperty({
        description: "Unique device identifier",
        example: "device-uuid-12345",
    })
    id: string;

    @ApiProperty({
        description: "Device platform",
        enum: ["android", "ios", "macOS", "windows", "tv", "linux", "web"],
        example: "ios",
    })
    platform: "android" | "ios" | "macOS" | "windows" | "tv" | "linux" | "web";
}

