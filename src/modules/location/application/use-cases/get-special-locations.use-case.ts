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
    return await this.specialLocationRepository.findAll({
      page: input.page,
      limit: input.limit,
      locationId: input.locationId,
      isPaginate: input.isPaginate,
      orderBy: input.orderBy,
      sortOrder: input.sortOrder,
    });
  }
}

