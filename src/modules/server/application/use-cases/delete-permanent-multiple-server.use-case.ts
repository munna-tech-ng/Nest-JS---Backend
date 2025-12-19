import { Inject, Injectable } from "@nestjs/common";
import { ServerRepositoryPort, SERVER_REPO } from "../../domain/contracts/server-repository.port";
import { DeleteMultipleDto } from "../dto/delete-multiple.dto";
import { ServerNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeletePermanentMultipleServerUseCase {
  constructor(
    @Inject(SERVER_REPO)
    private readonly serverRepository: ServerRepositoryPort,
  ) {}

  async execute(input: DeleteMultipleDto): Promise<void> {
    for (const id of input.ids) {
      const server = await this.serverRepository.findById(id, true);
      if (!server) {
        throw new ServerNotFoundException(id);
      }
    }

    await this.serverRepository.deletePermanentMultiple(input.ids);
  }
}

