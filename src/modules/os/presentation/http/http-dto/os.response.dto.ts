import { ApiProperty } from "@nestjs/swagger";

export class OsResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Windows 11" })
  name: string;

  @ApiProperty({ example: "WIN11" })
  code: string;

  @ApiProperty({ example: "Windows 11 operating system", required: false })
  description: string;

  @ApiProperty({ example: false })
  isDeleted: boolean;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date;
}

