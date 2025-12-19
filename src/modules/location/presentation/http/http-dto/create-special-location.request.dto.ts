import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsNotEmpty } from "class-validator";

export class CreateSpecialLocationRequestDto {
  @ApiProperty({ description: "Location ID", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  locationId: number;

  @ApiProperty({ description: "Special location type", example: "premium" })
  @IsString()
  @IsNotEmpty()
  type: string;
}

