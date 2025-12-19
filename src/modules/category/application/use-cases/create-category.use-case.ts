import { Inject, Injectable } from "@nestjs/common";
import { CategoryRepositoryPort, CATEGORY_REPO } from "../../domain/contracts/category-repository.port";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { Category } from "../../domain/entities/category.entity";
import { CategoryAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPO)
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(input: CreateCategoryDto): Promise<Category> {
    // Check if category with same name exists
    const existing = await this.categoryRepository.findAll({ 
      page: 1, 
      limit: 1, 
      includeDeleted: true 
    });
    const nameExists = existing.items.some(cat => cat.name.toLowerCase() === input.name.toLowerCase());
    
    if (nameExists) {
      throw new CategoryAlreadyExistsException(input.name);
    }

    return await this.categoryRepository.create({
      name: input.name,
      description: input.description,
    });
  }
}

