import { Inject, Injectable } from "@nestjs/common";
import { ServerRepositoryPort, SERVER_REPO } from "../../domain/contracts/server-repository.port";
import { ServerNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeleteServerUseCase {
  constructor(
    @Inject(SERVER_REPO)
    private readonly serverRepository: ServerRepositoryPort,
  ) {}

  async execute(id: number): Promise<void> {
    const server = await this.serverRepository.findById(id);
    if (!server) {
      throw new ServerNotFoundException(id);
    }

    await this.serverRepository.delete(id);
  }
}

