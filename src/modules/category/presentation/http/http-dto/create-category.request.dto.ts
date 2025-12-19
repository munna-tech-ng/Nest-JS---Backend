import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCategoryRequestDto {
  @ApiProperty({
    description: "Category name",
    example: "Gaming Servers",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Category description",
    example: "Servers for gaming purposes",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

