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
    return await this.categoryRepository.findAll({
      page: input.page,
      limit: input.limit,
      includeDeleted: input.includeDeleted,
      isPaginate: input.isPaginate,
      orderBy: input.orderBy,
      sortOrder: input.sortOrder,
    });
  }
}

