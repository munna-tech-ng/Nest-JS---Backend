import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from "class-validator";

export class UpdateServerRequestDto {
  @ApiProperty({ description: "Server name", example: "Gaming Server 1", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "Server IP address", example: "192.168.1.100", required: false })
  @IsString()
  @IsOptional()
  ip?: string;

  @ApiProperty({ description: "Server port", example: 3500, required: false })
  @IsNumber()
  @IsOptional()
  port?: number;

  @ApiProperty({ description: "Server status", example: "online", required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: "Is premium server", example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @ApiProperty({ description: "Is active server", example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: "Current concurrent users", example: 0, required: false })
  @IsNumber()
  @IsOptional()
  ccu?: number;

  @ApiProperty({ description: "Maximum concurrent users", example: 100, required: false })
  @IsNumber()
  @IsOptional()
  maxCcu?: number;

  @ApiProperty({ description: "Bandwidth", example: 0, required: false })
  @IsNumber()
  @IsOptional()
  bandwidth?: number;

  @ApiProperty({ description: "Speed", example: 0, required: false })
  @IsNumber()
  @IsOptional()
  speed?: number;

  @ApiProperty({ description: "Priority", example: 0, required: false })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty({ description: "Flag emoji", example: "🇺🇸", required: false })
  @IsString()
  @IsOptional()
  flag?: string;

  @ApiProperty({ description: "Location ID", example: 1, required: false })
  @IsNumber()
  @IsOptional()
  locationId?: number;

  @ApiProperty({ description: "Server description", example: "High performance gaming server", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "Category IDs", example: [1, 2], type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  categoryIds?: number[];

  @ApiProperty({ description: "Tag IDs", example: [1, 2], type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds?: number[];
}

