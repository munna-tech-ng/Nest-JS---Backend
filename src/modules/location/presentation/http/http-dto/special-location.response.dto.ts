import { ApiProperty } from "@nestjs/swagger";

export class SpecialLocationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  locationId: number;

  @ApiProperty({ example: "premium" })
  type: string;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date;
}

