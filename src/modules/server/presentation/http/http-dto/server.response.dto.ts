import { ApiProperty } from "@nestjs/swagger";
import { LocationResponseDto } from "src/modules/location/presentation/http/http-dto/location.response.dto";

export class ServerResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Gaming Server 1" })
  name: string;

  @ApiProperty({ example: "192.168.1.100" })
  ip: string;

  @ApiProperty({ example: 3500 })
  port: number;

  @ApiProperty({ example: "online" })
  status: string;

  @ApiProperty({ example: false })
  isPremium: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  isDeleted: boolean;

  @ApiProperty({ example: 0 })
  ccu: number;

  @ApiProperty({ example: 100 })
  maxCcu: number;

  @ApiProperty({ example: 0 })
  bandwidth: number;

  @ApiProperty({ example: 0 })
  speed: number;

  @ApiProperty({ example: 0 })
  priority: number;

  @ApiProperty({ example: "🇺🇸" })
  flag: string;

  @ApiProperty({ example: 1 })
  locationId: number;

  @ApiProperty({ example: { id: 1, name: "Location 1", code: "LOC1", flag: "🇺🇸" }, description: "Simplified location data (id, name, code, flag only)" })
  location?: Pick<LocationResponseDto, 'id' | 'name' | 'code' | 'flag'>;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  updatedAt: Date;

  @ApiProperty({ example: "High performance gaming server" })
  description: string;
}

