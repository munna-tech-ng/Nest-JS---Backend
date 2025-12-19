import { Inject, Injectable } from "@nestjs/common";
import { ServerRepositoryPort, SERVER_REPO } from "../../domain/contracts/server-repository.port";
import { PaginationDto } from "../dto/pagination.dto";

@Injectable()
export class GetServersUseCase {
  constructor(
    @Inject(SERVER_REPO)
    private readonly serverRepository: ServerRepositoryPort,
  ) {}

  async execute(input: PaginationDto) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 2;
    const includeDeleted = input.includeDeleted ?? false;

    return await this.serverRepository.findAll({
      page,
      limit,
      includeDeleted,
    });
  }
}

