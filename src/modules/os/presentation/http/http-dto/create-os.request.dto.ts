import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateOsRequestDto {
  @ApiProperty({ description: "OS name", example: "Windows 11" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "OS code", example: "WIN11" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: "OS description", example: "Windows 11 operating system", required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

