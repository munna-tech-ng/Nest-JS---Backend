import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

export class DeleteMultipleLocationRequestDto {
  @ApiProperty({ description: "Array of location IDs to delete", example: [1, 2, 3], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}

export class DeleteMultipleSpecialLocationRequestDto {
  @ApiProperty({ description: "Array of special location IDs to delete", example: [1, 2, 3], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}

