import { Inject, Injectable } from "@nestjs/common";
import { LocationRepositoryPort, LOCATION_REPO } from "../../domain/contracts/location-repository.port";
import { UpdateLocationDto } from "../dto/update-location.dto";
import { Location } from "../../domain/entities/location.entity";
import { LocationNotFoundException, LocationAlreadyExistsException } from "../../domain/exceptions";

@Injectable()
export class UpdateLocationUseCase {
  constructor(
    @Inject(LOCATION_REPO)
    private readonly locationRepository: LocationRepositoryPort,
  ) {}

  async execute(id: number, input: UpdateLocationDto): Promise<Location> {
    const existing = await this.locationRepository.findById(id);
    if (!existing) {
      throw new LocationNotFoundException(id);
    }

    // Check if name or code is being changed and if new value already exists
    if (input.name || input.code) {
      const allLocations = await this.locationRepository.findAll({ page: 1, limit: 1000 });
      
      if (input.name && input.name !== existing.name) {
        const newName = input.name;
        const nameExists = allLocations.items.some(
          loc => loc.id !== id && loc.name.toLowerCase() === newName.toLowerCase()
        );
        if (nameExists) {
          throw new LocationAlreadyExistsException("name", newName);
        }
      }

      if (input.code && input.code !== existing.code) {
        const newCode = input.code;
        const codeExists = allLocations.items.some(
          loc => loc.id !== id && loc.code.toLowerCase() === newCode.toLowerCase()
        );
        if (codeExists) {
          throw new LocationAlreadyExistsException("code", newCode);
        }
      }
    }

    return await this.locationRepository.update(id, input);
  }
}

