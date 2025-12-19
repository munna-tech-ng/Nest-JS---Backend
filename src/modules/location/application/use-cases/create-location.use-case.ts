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
    // Check if location with same name or code exists
    const existing = await this.locationRepository.findAll({ page: 1, limit: 1000 });
    const nameExists = existing.items.some(loc => loc.name.toLowerCase() === input.name.toLowerCase());
    const codeExists = existing.items.some(loc => loc.code.toLowerCase() === input.code.toLowerCase());
    
    if (nameExists) {
      throw new LocationAlreadyExistsException("name", input.name);
    }
    if (codeExists) {
      throw new LocationAlreadyExistsException("code", input.code);
    }

    return await this.locationRepository.create({
      name: input.name,
      code: input.code,
      lat: input.lat,
      lng: input.lng,
      flag: input.flag,
    });
  }
}

