import { Inject, Injectable } from "@nestjs/common";
import { SpecialLocationRepositoryPort, SPECIAL_LOCATION_REPO } from "../../domain/contracts/special-location-repository.port";
import { DeleteMultipleDto } from "../dto/delete-multiple.dto";
import { SpecialLocationNotFoundException } from "../../domain/exceptions";

@Injectable()
export class RestoreMultipleSpecialLocationUseCase {
  constructor(
    @Inject(SPECIAL_LOCATION_REPO)
    private readonly specialLocationRepository: SpecialLocationRepositoryPort,
  ) {}

  async execute(input: DeleteMultipleDto): Promise<void> {
    for (const id of input.ids) {
      const specialLocation = await this.specialLocationRepository.findById(id);
      if (!specialLocation) {
        throw new SpecialLocationNotFoundException(id);
      }
    }

    await this.specialLocationRepository.restoreMultiple(input.ids);
  }
}

