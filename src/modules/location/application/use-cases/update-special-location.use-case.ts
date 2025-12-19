import { Inject, Injectable } from "@nestjs/common";
import { SpecialLocationRepositoryPort, SPECIAL_LOCATION_REPO } from "../../domain/contracts/special-location-repository.port";
import { UpdateSpecialLocationDto } from "../dto/update-special-location.dto";
import { SpecialLocation } from "../../domain/entities/special-location.entity";
import { SpecialLocationNotFoundException } from "../../domain/exceptions";
import { LOCATION_REPO, LocationRepositoryPort } from "../../domain/contracts/location-repository.port";
import { LocationNotFoundException } from "../../domain/exceptions";

@Injectable()
export class UpdateSpecialLocationUseCase {
  constructor(
    @Inject(SPECIAL_LOCATION_REPO)
    private readonly specialLocationRepository: SpecialLocationRepositoryPort,
    @Inject(LOCATION_REPO)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(id: number, input: UpdateSpecialLocationDto): Promise<SpecialLocation> {
    const existing = await this.specialLocationRepository.findById(id);
    if (!existing) {
      throw new SpecialLocationNotFoundException(id);
    }

    // Verify location exists if locationId is being updated
    if (input.locationId) {
      const location = await this.locationRepository.findById(input.locationId);
      if (!location) {
        throw new LocationNotFoundException(input.locationId);
      }
    }

    return await this.specialLocationRepository.update(id, input);
  }
}

