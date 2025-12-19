import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateTagRequestDto {
  @ApiProperty({ description: "Tag name", example: "Gaming" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Tag description", example: "Gaming related tag", required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

