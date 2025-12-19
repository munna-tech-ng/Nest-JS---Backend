import { Inject, Injectable } from "@nestjs/common";
import { LocationRepositoryPort, LOCATION_REPO } from "../../domain/contracts/location-repository.port";
import { Location } from "../../domain/entities/location.entity";
import { LocationNotFoundException } from "../../domain/exceptions";

@Injectable()
export class GetLocationUseCase {
  constructor(
    @Inject(LOCATION_REPO)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(id: number): Promise<Location> {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new LocationNotFoundException(id);
    }

    return location;
  }
}

