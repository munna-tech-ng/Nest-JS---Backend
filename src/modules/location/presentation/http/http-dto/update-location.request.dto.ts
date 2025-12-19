import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateLocationRequestDto {
  @ApiProperty({ description: "Location name", example: "United States", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "Location code", example: "US", required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: "Latitude", example: "40.7128", required: false })
  @IsString()
  @IsOptional()
  lat?: string;

  @ApiProperty({ description: "Longitude", example: "-74.0060", required: false })
  @IsString()
  @IsOptional()
  lng?: string;

  @ApiProperty({ description: "Flag emoji", example: "🇺🇸", required: false })
  @IsString()
  @IsOptional()
  flag?: string;
}

