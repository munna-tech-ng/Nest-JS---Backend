import { Inject, Injectable } from "@nestjs/common";
import { LocationRepositoryPort, LOCATION_REPO } from "../../domain/contracts/location-repository.port";
import { PaginationDto } from "../dto/pagination.dto";

@Injectable()
export class GetLocationsUseCase {
  constructor(
    @Inject(LOCATION_REPO)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(input: PaginationDto) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 2;

    return await this.locationRepository.findAll({
      page,
      limit,
    });
  }
}

