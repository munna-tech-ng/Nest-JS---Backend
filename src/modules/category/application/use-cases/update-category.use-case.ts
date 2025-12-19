import { Inject, Injectable } from "@nestjs/common";
import { CategoryRepositoryPort, CATEGORY_REPO } from "../../domain/contracts/category-repository.port";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { Category } from "../../domain/entities/category.entity";
import { CategoryNotFoundException, CategoryAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPO)
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(id: number, input: UpdateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new CategoryNotFoundException(id);
    }

    // Check if name is being changed and if new name already exists
    if (input.name && input.name !== existing.name) {
      const allCategories = await this.categoryRepository.findAll({ 
        page: 1, 
        limit: 1000, 
        includeDeleted: false 
      });
      const newName = input.name;
      const nameExists = allCategories.items.some(
        cat => cat.id !== id && cat.name.toLowerCase() === newName.toLowerCase()
      );
      
      if (nameExists) {
        throw new CategoryAlreadyExistsException(newName);
      }
    }

    return await this.categoryRepository.update(id, input);
  }
}

