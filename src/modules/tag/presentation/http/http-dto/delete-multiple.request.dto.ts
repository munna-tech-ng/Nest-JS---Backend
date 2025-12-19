import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

export class DeleteMultipleTagRequestDto {
  @ApiProperty({ description: "Array of tag IDs to delete", example: [1, 2, 3], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}

