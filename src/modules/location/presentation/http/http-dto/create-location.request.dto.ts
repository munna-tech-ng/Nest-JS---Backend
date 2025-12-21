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

  @ApiProperty({ description: "Flag emoji", required: false, type: 'string', format: 'binary' })
  // binary type because it can be a string or a file
  @IsOptional()
  flag?: any; // any type because it can be a string or a file
}

