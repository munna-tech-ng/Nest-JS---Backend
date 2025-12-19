import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateTagRequestDto {
  @ApiProperty({ description: "Tag name", example: "Gaming", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "Tag description", example: "Gaming related tag", required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

