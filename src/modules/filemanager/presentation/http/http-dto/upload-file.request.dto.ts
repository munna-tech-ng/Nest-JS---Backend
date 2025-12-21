import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsString } from "class-validator";

export class UploadFileRequestDto {
  @ApiPropertyOptional({
    type: "boolean",
    description: "Queue the upload for background processing",
    required: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === "true" ? true : false)
  queue?: boolean = false;
  
  @ApiPropertyOptional({
    type: "string",
    description: "Folder name (e.g., 'flags', 'images')",
    required: false,
    default: "general",
  })
  @IsString()
  folder?: string = "general";
  @ApiPropertyOptional({
    type: "string",
    description: "Subfolder name",
    required: false,
    default: "",
  })
  subfolder?: string = "";
  
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "File to upload (JPEG, PNG, GIF, WebP, SVG)",
    required: true,
  })
  file: any;
}

