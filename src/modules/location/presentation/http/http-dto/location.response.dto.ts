import { ApiProperty } from "@nestjs/swagger";

export class LocationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "United States" })
  name: string;

  @ApiProperty({ example: "US" })
  code: string;

  @ApiProperty({ example: "40.7128", required: false })
  lat: string;

  @ApiProperty({ example: "-74.0060", required: false })
  lng: string;

  @ApiProperty({ example: "🇺🇸", required: false })
  flag: string;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date;
}

