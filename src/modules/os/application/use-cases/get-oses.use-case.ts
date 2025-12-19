import { Inject, Injectable } from "@nestjs/common";
import { OsRepositoryPort, OS_REPO } from "../../domain/contracts/os-repository.port";
import { PaginationDto } from "../dto/pagination.dto";

@Injectable()
export class GetOsesUseCase {
  constructor(
    @Inject(OS_REPO)
    private readonly osRepository: OsRepositoryPort,
  ) {}

  async execute(input: PaginationDto) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 2;
    const includeDeleted = input.includeDeleted ?? false;

    return await this.osRepository.findAll({
      page,
      limit,
      includeDeleted,
    });
  }
}

