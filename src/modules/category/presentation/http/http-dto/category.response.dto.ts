import { ApiProperty } from "@nestjs/swagger";

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Gaming Servers" })
  name: string;

  @ApiProperty({ example: "Servers for gaming purposes", required: false })
  description: string;

  @ApiProperty({ example: false })
  isDeleted: boolean;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date;
}

