import { Inject, Injectable } from "@nestjs/common";
import { ServerRepositoryPort, SERVER_REPO } from "../../domain/contracts/server-repository.port";
import { CreateServerDto } from "../dto/create-server.dto";
import { Server } from "../../domain/entities/server.entity";
import { ServerAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class CreateServerUseCase {
  constructor(
    @Inject(SERVER_REPO)
    private readonly serverRepository: ServerRepositoryPort,
  ) {}

  async execute(input: CreateServerDto): Promise<Server> {
    const existing = await this.serverRepository.findByIp(input.ip);
    if (existing) {
      throw new ServerAlreadyExistsException("ip", input.ip);
    }

    return await this.serverRepository.create({
      name: input.name,
      ip: input.ip,
      port: input.port,
      status: input.status,
      isPremium: input.isPremium,
      isActive: input.isActive,
      ccu: input.ccu,
      maxCcu: input.maxCcu,
      bandwidth: input.bandwidth,
      speed: input.speed,
      priority: input.priority,
      flag: input.flag,
      locationId: input.locationId,
      description: input.description,
      categoryIds: input.categoryIds,
      tagIds: input.tagIds,
    });
  }
}

