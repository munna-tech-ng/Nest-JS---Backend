import { Inject, Injectable } from "@nestjs/common";
import { TagRepositoryPort, TAG_REPO } from "../../domain/contracts/tag-repository.port";
import { PaginationDto } from "../dto/pagination.dto";

@Injectable()
export class GetTagsUseCase {
  constructor(
    @Inject(TAG_REPO)
    private readonly tagRepository: TagRepositoryPort,
  ) {}

  async execute(input: PaginationDto) {
    return await this.tagRepository.findAll({
      page: input.page,
      limit: input.limit,
      includeDeleted: input.includeDeleted,
      isPaginate: input.isPaginate,
      orderBy: input.orderBy,
      sortOrder: input.sortOrder,
    });
  }
}

