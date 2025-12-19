import { Inject, Injectable } from "@nestjs/common";
import { CategoryRepositoryPort, CATEGORY_REPO } from "../../domain/contracts/category-repository.port";
import { Category } from "../../domain/entities/category.entity";
import { CategoryNotFoundException } from "../../domain/exceptions";

@Injectable()
export class GetCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPO)
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(id: number, includeDeleted?: boolean): Promise<Category> {
    const category = await this.categoryRepository.findById(id, includeDeleted);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    return category;
  }
}

