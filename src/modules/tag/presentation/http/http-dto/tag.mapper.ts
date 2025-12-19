import { Tag } from "../../../domain/entities/tag.entity";
import { TagResponseDto } from "./tag.response.dto";

export class TagMapper {
  static toDto(tag: Tag): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      description: tag.description,
      isDeleted: tag.isDeleted,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }

  static toDtoList(tags: Tag[]): TagResponseDto[] {
    return tags.map((tag) => this.toDto(tag));
  }
}

