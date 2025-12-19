import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

export class DeleteMultipleCategoryRequestDto {
  @ApiProperty({
    description: "Array of category IDs to delete",
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}

