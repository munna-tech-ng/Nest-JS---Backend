import { ApiProperty } from "@nestjs/swagger";

export class UploadFileResponseDto {
  @ApiProperty({ example: "abc123-def456-ghi789.jpg" })
  filename: string;

  @ApiProperty({ example: "uploads/flags/abc123-def456-ghi789.jpg" })
  path: string;

  @ApiProperty({ example: false, required: false })
  queued?: boolean;
}

