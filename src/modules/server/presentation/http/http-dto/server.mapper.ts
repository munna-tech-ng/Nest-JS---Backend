import { Server } from "../../../domain/entities/server.entity";
import { ServerResponseDto } from "./server.response.dto";
import { LocationMapper } from "src/modules/location/presentation/http/http-dto/location.mapper";

export type ServerSimpleDto = {
  id: number;
  name: string;
  ip: string;
  isPremium: boolean;
  locationId: number;
  isUnlocked: boolean;
  status: string;
}

export class ServerMapper {
  static toDto(server: Server, filePath?: string): ServerResponseDto {
    return {
      id: server.id,
      name: server.name,
      ip: server.ip,
      port: server.port,
      status: server.status,
      isPremium: server.isPremium,
      isActive: server.isActive,
      isDeleted: server.isDeleted,
      ccu: server.ccu,
      maxCcu: server.maxCcu,
      bandwidth: server.bandwidth,
      speed: server.speed,
      priority: server.priority,
      flag: server.flag,
      locationId: server.locationId,
      // Use simplified location DTO for server API (only id, name, code, flag)
      location: server.location ? LocationMapper.toSimpleDto(server.location, filePath) : undefined,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      description: server.description,
    };
  }

  static toDtoList(servers: Server[], filePath?: string): ServerResponseDto[] {
    return servers.map((server) => this.toDto(server, filePath));
  }

  static toSimpleDto(server: Server): ServerSimpleDto {
    return {
      id: server.id,
      name: server.name,
      ip: server.ip,
      isPremium: server.isPremium,
      locationId: server.locationId,
      isUnlocked: server.isPremium ? true : false,
      status: server.status
    } as ServerSimpleDto;
  }

  static toSimpleDtoList(servers: Server[]): ServerSimpleDto[] {
    return servers.map((server) => this.toSimpleDto(server));
  }
}

