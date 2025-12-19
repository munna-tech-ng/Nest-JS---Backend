import { Inject, Injectable } from "@nestjs/common";
import { OsRepositoryPort, OS_REPO } from "../../domain/contracts/os-repository.port";
import { DeleteMultipleDto } from "../dto/delete-multiple.dto";
import { OsNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeletePermanentMultipleOsUseCase {
  constructor(
    @Inject(OS_REPO)
    private readonly osRepository: OsRepositoryPort,
  ) {}

  async execute(input: DeleteMultipleDto): Promise<void> {
    for (const id of input.ids) {
      const os = await this.osRepository.findById(id, true);
      if (!os) {
        throw new OsNotFoundException(id);
      }
    }

    await this.osRepository.deletePermanentMultiple(input.ids);
  }
}

