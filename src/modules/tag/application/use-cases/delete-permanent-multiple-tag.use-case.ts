import { Inject, Injectable } from "@nestjs/common";
import { TagRepositoryPort, TAG_REPO } from "../../domain/contracts/tag-repository.port";
import { DeleteMultipleDto } from "../dto/delete-multiple.dto";
import { TagNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeletePermanentMultipleTagUseCase {
  constructor(
    @Inject(TAG_REPO)
    private readonly tagRepository: TagRepositoryPort,
  ) {}

  async execute(input: DeleteMultipleDto): Promise<void> {
    for (const id of input.ids) {
      const tag = await this.tagRepository.findById(id, true);
      if (!tag) {
        throw new TagNotFoundException(id);
      }
    }

    await this.tagRepository.deletePermanentMultiple(input.ids);
  }
}

