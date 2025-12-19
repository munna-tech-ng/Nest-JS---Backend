import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateOsRequestDto {
  @ApiProperty({ description: "OS name", example: "Windows 11", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "OS code", example: "WIN11", required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: "OS description", example: "Windows 11 operating system", required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

