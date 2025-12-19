import { Inject, Injectable } from "@nestjs/common";
import { SpecialLocationRepositoryPort, SPECIAL_LOCATION_REPO } from "../../domain/contracts/special-location-repository.port";
import { SpecialLocationNotFoundException } from "../../domain/exceptions";

@Injectable()
export class RestoreSpecialLocationUseCase {
  constructor(
    @Inject(SPECIAL_LOCATION_REPO)
    private readonly specialLocationRepository: SpecialLocationRepositoryPort,
  ) {}

  async execute(id: number): Promise<void> {
    const specialLocation = await this.specialLocationRepository.findById(id);
    if (!specialLocation) {
      throw new SpecialLocationNotFoundException(id);
    }

    await this.specialLocationRepository.restore(id);
  }
}

