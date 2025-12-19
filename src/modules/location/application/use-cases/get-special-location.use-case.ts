import { Inject, Injectable } from "@nestjs/common";
import { SpecialLocationRepositoryPort, SPECIAL_LOCATION_REPO } from "../../domain/contracts/special-location-repository.port";
import { SpecialLocation } from "../../domain/entities/special-location.entity";
import { SpecialLocationNotFoundException } from "../../domain/exceptions";

@Injectable()
export class GetSpecialLocationUseCase {
  constructor(
    @Inject(SPECIAL_LOCATION_REPO)
    private readonly specialLocationRepository: SpecialLocationRepositoryPort,
  ) {}

  async execute(id: number): Promise<SpecialLocation> {
    const specialLocation = await this.specialLocationRepository.findById(id);
    if (!specialLocation) {
      throw new SpecialLocationNotFoundException(id);
    }

    return specialLocation;
  }
}

