import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateFlagRequestDto {
  @ApiProperty({ 
    description: "Flag path or URL (for JSON requests) or file upload (for multipart requests)", 
    example: "uploads/flags/abc123.jpg",
    required: false 
  })
  @IsString()
  @IsOptional()
  flag?: string;
}

