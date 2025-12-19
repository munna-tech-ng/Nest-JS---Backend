import { Inject, Injectable } from "@nestjs/common";
import { LocationRepositoryPort, LOCATION_REPO } from "../../domain/contracts/location-repository.port";
import { DeleteMultipleDto } from "../dto/delete-multiple.dto";
import { LocationNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeletePermanentMultipleLocationUseCase {
  constructor(
    @Inject(LOCATION_REPO)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(input: DeleteMultipleDto): Promise<void> {
    for (const id of input.ids) {
      const location = await this.locationRepository.findById(id);
      if (!location) {
        throw new LocationNotFoundException(id);
      }
    }

    await this.locationRepository.deletePermanentMultiple(input.ids);
  }
}

