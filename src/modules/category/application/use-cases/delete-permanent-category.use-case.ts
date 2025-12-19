import { Inject, Injectable } from "@nestjs/common";
import { CategoryRepositoryPort, CATEGORY_REPO } from "../../domain/contracts/category-repository.port";
import { CategoryNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeletePermanentCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPO)
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(id: number): Promise<void> {
    const category = await this.categoryRepository.findById(id, true);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    await this.categoryRepository.deletePermanent(id);
  }
}

