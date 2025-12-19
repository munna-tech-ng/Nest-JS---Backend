import { Inject, Injectable } from "@nestjs/common";
import { OsRepositoryPort, OS_REPO } from "../../domain/contracts/os-repository.port";
import { OsNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeletePermanentOsUseCase {
  constructor(
    @Inject(OS_REPO)
    private readonly osRepository: OsRepositoryPort,
  ) {}

  async execute(id: number): Promise<void> {
    const os = await this.osRepository.findById(id, true);
    if (!os) {
      throw new OsNotFoundException(id);
    }

    await this.osRepository.deletePermanent(id);
  }
}

