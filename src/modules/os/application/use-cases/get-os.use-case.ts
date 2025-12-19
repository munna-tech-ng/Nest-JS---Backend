import { Inject, Injectable } from "@nestjs/common";
import { OsRepositoryPort, OS_REPO } from "../../domain/contracts/os-repository.port";
import { Os } from "../../domain/entities/os.entity";
import { OsNotFoundException } from "../../domain/exceptions";

@Injectable()
export class GetOsUseCase {
  constructor(
    @Inject(OS_REPO)
    private readonly osRepository: OsRepositoryPort,
  ) {}

  async execute(id: number, includeDeleted?: boolean): Promise<Os> {
    const os = await this.osRepository.findById(id, includeDeleted);
    if (!os) {
      throw new OsNotFoundException(id);
    }

    return os;
  }
}

