import { Inject, Injectable } from "@nestjs/common";
import { LocationRepositoryPort, LOCATION_REPO } from "../../domain/contracts/location-repository.port";
import { CreateLocationDto } from "../dto/create-location.dto";
import { Location } from "../../domain/entities/location.entity";
import { LocationAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class CreateLocationUseCase {
  constructor(
    @Inject(LOCATION_REPO)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(input: CreateLocationDto): Promise<Location> {
    // Validate required fields
    const existing = await this.locationRepository.findByCode(input.code.toLowerCase());
    if (existing) {
      throw new LocationAlreadyExistsException("code", input.code);
    }

    return await this.locationRepository.create({
      name: input.name,
      code: input.code.toLowerCase(),
      lat: input.lat,
      lng: input.lng,
      flag: input.flag,
    });
  }
}

