import { Inject, Injectable } from "@nestjs/common";
import { TagRepositoryPort, TAG_REPO } from "../../domain/contracts/tag-repository.port";
import { TagNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject(TAG_REPO)
    private readonly tagRepository: TagRepositoryPort,
  ) {}

  async execute(id: number): Promise<void> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new TagNotFoundException(id);
    }

    await this.tagRepository.delete(id);
  }
}

