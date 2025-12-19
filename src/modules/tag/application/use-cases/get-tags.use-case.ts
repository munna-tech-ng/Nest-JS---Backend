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
    const page = input.page ?? 1;
    const limit = input.limit ?? 2;
    const includeDeleted = input.includeDeleted ?? false;

    return await this.tagRepository.findAll({
      page,
      limit,
      includeDeleted,
    });
  }
}

