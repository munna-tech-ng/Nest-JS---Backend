import { Server } from "../../../domain/entities/server.entity";
import { ServerResponseDto } from "./server.response.dto";

export class ServerMapper {
  static toDto(server: Server): ServerResponseDto {
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
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      description: server.description,
    };
  }

  static toDtoList(servers: Server[]): ServerResponseDto[] {
    return servers.map((server) => this.toDto(server));
  }
}

