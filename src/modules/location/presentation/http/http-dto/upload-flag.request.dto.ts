import { ApiProperty } from "@nestjs/swagger";

export class UploadFlagRequestDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Flag image file (JPEG, PNG, GIF, WebP, SVG)",
    required: true,
  })
  flag: any;
}

