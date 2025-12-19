import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

export class DeleteMultipleServerRequestDto {
  @ApiProperty({ description: "Array of server IDs to delete", example: [1, 2, 3], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}

