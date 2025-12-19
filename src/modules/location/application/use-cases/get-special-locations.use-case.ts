import { Inject, Injectable } from "@nestjs/common";
import { SpecialLocationRepositoryPort, SPECIAL_LOCATION_REPO } from "../../domain/contracts/special-location-repository.port";
import { PaginationDto } from "../dto/pagination.dto";

@Injectable()
export class GetSpecialLocationsUseCase {
  constructor(
    @Inject(SPECIAL_LOCATION_REPO)
    private readonly specialLocationRepository: SpecialLocationRepositoryPort,
  ) {}

  async execute(input: PaginationDto & { locationId?: number }) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 2;

    return await this.specialLocationRepository.findAll({
      page,
      limit,
      locationId: input.locationId,
    });
  }
}

