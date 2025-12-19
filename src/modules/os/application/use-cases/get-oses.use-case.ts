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
    return await this.osRepository.findAll({
      page: input.page,
      limit: input.limit,
      includeDeleted: input.includeDeleted,
      isPaginate: input.isPaginate,
      orderBy: input.orderBy,
      sortOrder: input.sortOrder,
    });
  }
}

