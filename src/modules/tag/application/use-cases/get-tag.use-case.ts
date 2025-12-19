import { Inject, Injectable } from "@nestjs/common";
import { TagRepositoryPort, TAG_REPO } from "../../domain/contracts/tag-repository.port";
import { Tag } from "../../domain/entities/tag.entity";
import { TagNotFoundException } from "../../domain/exceptions";

@Injectable()
export class GetTagUseCase {
  constructor(
    @Inject(TAG_REPO)
    private readonly tagRepository: TagRepositoryPort,
  ) {}

  async execute(id: number, includeDeleted?: boolean): Promise<Tag> {
    const tag = await this.tagRepository.findById(id, includeDeleted);
    if (!tag) {
      throw new TagNotFoundException(id);
    }

    return tag;
  }
}

