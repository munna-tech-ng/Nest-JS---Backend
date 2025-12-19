import { Inject, Injectable } from "@nestjs/common";
import { ServerRepositoryPort, SERVER_REPO } from "../../domain/contracts/server-repository.port";
import { ServerNotFoundException } from "../../domain/exceptions";

@Injectable()
export class RestoreServerUseCase {
  constructor(
    @Inject(SERVER_REPO)
    private readonly serverRepository: ServerRepositoryPort,
  ) {}

  async execute(id: number): Promise<void> {
    const server = await this.serverRepository.findById(id, true);
    if (!server) {
      throw new ServerNotFoundException(id);
    }

    if (!server.isDeleted) {
      return;
    }

    await this.serverRepository.restore(id);
  }
}

