import { Inject, Injectable } from "@nestjs/common";
import { TagRepositoryPort, TAG_REPO } from "../../domain/contracts/tag-repository.port";
import { UpdateTagDto } from "../dto/update-tag.dto";
import { Tag } from "../../domain/entities/tag.entity";
import { TagNotFoundException, TagAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class UpdateTagUseCase {
  constructor(
    @Inject(TAG_REPO)
    private readonly tagRepository: TagRepositoryPort,
  ) {}

  async execute(id: number, input: UpdateTagDto): Promise<Tag> {
    const existing = await this.tagRepository.findById(id);
    if (!existing) {
      throw new TagNotFoundException(id);
    }

    if (input.name && input.name !== existing.name) {
      const allTags = await this.tagRepository.findAll({ 
        page: 1, 
        limit: 1000, 
        includeDeleted: false 
      });
      const newName = input.name;
      const nameExists = allTags.items.some(
        tag => tag.id !== id && tag.name.toLowerCase() === newName.toLowerCase()
      );
      
      if (nameExists) {
        throw new TagAlreadyExistsException(newName);
      }
    }

    return await this.tagRepository.update(id, input);
  }
}

