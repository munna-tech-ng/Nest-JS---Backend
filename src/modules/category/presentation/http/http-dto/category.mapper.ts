import { Category } from "../../../domain/entities/category.entity";
import { CategoryResponseDto } from "./category.response.dto";

export class CategoryMapper {
  static toDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      isDeleted: category.isDeleted,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toDtoList(categories: Category[]): CategoryResponseDto[] {
    return categories.map((category) => this.toDto(category));
  }
}

