import { Inject, Injectable } from "@nestjs/common";
import { ServerRepositoryPort, SERVER_REPO } from "../../domain/contracts/server-repository.port";
import { Server } from "../../domain/entities/server.entity";
import { ServerNotFoundException } from "../../domain/exceptions";

@Injectable()
export class GetServerUseCase {
  constructor(
    @Inject(SERVER_REPO)
    private readonly serverRepository: ServerRepositoryPort,
  ) {}

  async execute(id: number, includeDeleted?: boolean, withLocation?: boolean): Promise<Server> {
    const server = await this.serverRepository.findById(id, includeDeleted, withLocation);
    if (!server) {
      throw new ServerNotFoundException(id);
    }

    return server;
  }
}

