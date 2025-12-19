import { Inject, Injectable } from "@nestjs/common";
import { CategoryRepositoryPort, CATEGORY_REPO } from "../../domain/contracts/category-repository.port";
import { CategoryNotFoundException } from "../../domain/exceptions";

@Injectable()
export class RestoreCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPO)
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(id: number): Promise<void> {
    const category = await this.categoryRepository.findById(id, true);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    if (!category.isDeleted) {
      return; // Already restored
    }

    await this.categoryRepository.restore(id);
  }
}

