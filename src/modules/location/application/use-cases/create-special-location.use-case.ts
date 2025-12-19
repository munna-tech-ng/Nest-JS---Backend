import { Inject, Injectable } from "@nestjs/common";
import { SpecialLocationRepositoryPort, SPECIAL_LOCATION_REPO } from "../../domain/contracts/special-location-repository.port";
import { CreateSpecialLocationDto } from "../dto/create-special-location.dto";
import { SpecialLocation } from "../../domain/entities/special-location.entity";
import { LOCATION_REPO, LocationRepositoryPort } from "../../domain/contracts/location-repository.port";
import { LocationNotFoundException } from "../../domain/exceptions";

@Injectable()
export class CreateSpecialLocationUseCase {
  constructor(
    @Inject(SPECIAL_LOCATION_REPO)
    private readonly specialLocationRepository: SpecialLocationRepositoryPort,
    @Inject(LOCATION_REPO)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(input: CreateSpecialLocationDto): Promise<SpecialLocation> {
    // Verify location exists
    const location = await this.locationRepository.findById(input.locationId);
    if (!location) {
      throw new LocationNotFoundException(input.locationId);
    }

    return await this.specialLocationRepository.create({
      locationId: input.locationId,
      type: input.type,
    });
  }
}

