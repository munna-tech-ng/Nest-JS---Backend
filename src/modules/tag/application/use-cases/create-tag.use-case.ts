import { Inject, Injectable } from "@nestjs/common";
import { TagRepositoryPort, TAG_REPO } from "../../domain/contracts/tag-repository.port";
import { CreateTagDto } from "../dto/create-tag.dto";
import { Tag } from "../../domain/entities/tag.entity";
import { TagAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject(TAG_REPO)
    private readonly tagRepository: TagRepositoryPort,
  ) {}

  async execute(input: CreateTagDto): Promise<Tag> {
    const existing = await this.tagRepository.findAll({ 
      page: 1, 
      limit: 1000, 
      includeDeleted: true 
    });
    const nameExists = existing.items.some(tag => tag.name.toLowerCase() === input.name.toLowerCase());
    
    if (nameExists) {
      throw new TagAlreadyExistsException(input.name);
    }

    return await this.tagRepository.create({
      name: input.name,
      description: input.description,
    });
  }
}

