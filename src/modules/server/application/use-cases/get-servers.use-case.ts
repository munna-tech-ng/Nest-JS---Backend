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
    return await this.serverRepository.findAll({
      page: input.page,
      limit: input.limit,
      includeDeleted: input.includeDeleted,
      isPaginate: input.isPaginate,
      orderBy: input.orderBy,
      sortOrder: input.sortOrder,
    });
  }
}

