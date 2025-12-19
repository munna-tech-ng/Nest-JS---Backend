import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsOptional } from "class-validator";

export class UpdateSpecialLocationRequestDto {
  @ApiProperty({ description: "Location ID", example: 1, required: false })
  @IsNumber()
  @IsOptional()
  locationId?: number;

  @ApiProperty({ description: "Special location type", example: "premium", required: false })
  @IsString()
  @IsOptional()
  type?: string;
}

