import { Inject, Injectable } from "@nestjs/common";
import { CategoryRepositoryPort, CATEGORY_REPO } from "../../domain/contracts/category-repository.port";
import { DeleteMultipleDto } from "../dto/delete-multiple.dto";
import { CategoryNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeleteMultipleCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPO)
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(input: DeleteMultipleDto): Promise<void> {
    // Verify all categories exist
    for (const id of input.ids) {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new CategoryNotFoundException(id);
      }
    }

    await this.categoryRepository.deleteMultiple(input.ids);
  }
}

