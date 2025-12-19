import { Inject, Injectable } from "@nestjs/common";
import { OsRepositoryPort, OS_REPO } from "../../domain/contracts/os-repository.port";
import { CreateOsDto } from "../dto/create-os.dto";
import { Os } from "../../domain/entities/os.entity";
import { OsAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class CreateOsUseCase {
  constructor(
    @Inject(OS_REPO)
    private readonly osRepository: OsRepositoryPort,
  ) {}

  async execute(input: CreateOsDto): Promise<Os> {
    const existing = await this.osRepository.findAll({ 
      page: 1, 
      limit: 1000, 
      includeDeleted: true 
    });
    const nameExists = existing.items.some(os => os.name.toLowerCase() === input.name.toLowerCase());
    const codeExists = existing.items.some(os => os.code.toLowerCase() === input.code.toLowerCase());
    
    if (nameExists) {
      throw new OsAlreadyExistsException("name", input.name);
    }
    if (codeExists) {
      throw new OsAlreadyExistsException("code", input.code);
    }

    return await this.osRepository.create({
      name: input.name,
      code: input.code,
      description: input.description,
    });
  }
}

