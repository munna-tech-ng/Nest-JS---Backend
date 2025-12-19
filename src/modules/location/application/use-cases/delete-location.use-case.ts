import { Inject, Injectable } from "@nestjs/common";
import { LocationRepositoryPort, LOCATION_REPO } from "../../domain/contracts/location-repository.port";
import { LocationNotFoundException } from "../../domain/exceptions";

@Injectable()
export class DeleteLocationUseCase {
  constructor(
    @Inject(LOCATION_REPO)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(id: number): Promise<void> {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new LocationNotFoundException(id);
    }

    await this.locationRepository.delete(id);
  }
}

