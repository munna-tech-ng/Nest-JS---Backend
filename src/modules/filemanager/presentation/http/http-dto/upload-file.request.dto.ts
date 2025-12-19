import { ApiProperty } from "@nestjs/swagger";

export class UploadFileRequestDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "File to upload (JPEG, PNG, GIF, WebP, SVG)",
    required: true,
  })
  file: any;
}

