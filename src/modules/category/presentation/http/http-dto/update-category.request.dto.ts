import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateCategoryRequestDto {
  @ApiProperty({
    description: "Category name",
    example: "Gaming Servers",
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "Category description",
    example: "Servers for gaming purposes",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

