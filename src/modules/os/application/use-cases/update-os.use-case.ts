import { Inject, Injectable } from "@nestjs/common";
import { OsRepositoryPort, OS_REPO } from "../../domain/contracts/os-repository.port";
import { UpdateOsDto } from "../dto/update-os.dto";
import { Os } from "../../domain/entities/os.entity";
import { OsNotFoundException, OsAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class UpdateOsUseCase {
  constructor(
    @Inject(OS_REPO)
    private readonly osRepository: OsRepositoryPort,
  ) {}

  async execute(id: number, input: UpdateOsDto): Promise<Os> {
    const existing = await this.osRepository.findById(id);
    if (!existing) {
      throw new OsNotFoundException(id);
    }

    if (input.name || input.code) {
      const allOs = await this.osRepository.findAll({ 
        page: 1, 
        limit: 1000, 
        includeDeleted: false 
      });
      
      if (input.name && input.name !== existing.name) {
        const newName = input.name;
        const nameExists = allOs.items.some(
          os => os.id !== id && os.name.toLowerCase() === newName.toLowerCase()
        );
        if (nameExists) {
          throw new OsAlreadyExistsException("name", newName);
        }
      }

      if (input.code && input.code !== existing.code) {
        const newCode = input.code;
        const codeExists = allOs.items.some(
          os => os.id !== id && os.code.toLowerCase() === newCode.toLowerCase()
        );
        if (codeExists) {
          throw new OsAlreadyExistsException("code", newCode);
        }
      }
    }

    return await this.osRepository.update(id, input);
  }
}

