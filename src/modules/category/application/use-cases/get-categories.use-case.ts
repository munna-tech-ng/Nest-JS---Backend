import { Inject, Injectable } from "@nestjs/common";
import { CategoryRepositoryPort, CATEGORY_REPO } from "../../domain/contracts/category-repository.port";
import { PaginationDto } from "../dto/pagination.dto";

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPO)
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(input: PaginationDto) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 2;
    const includeDeleted = input.includeDeleted ?? false;

    return await this.categoryRepository.findAll({
      page,
      limit,
      includeDeleted,
    });
  }
}

