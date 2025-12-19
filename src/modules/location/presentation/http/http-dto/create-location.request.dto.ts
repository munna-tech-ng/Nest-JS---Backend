import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateLocationRequestDto {
  @ApiProperty({ description: "Location name", example: "United States" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Location code", example: "US" })
  @IsString()
  @IsNotEmpty()
  code: string;

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

