import { Location } from "../../../domain/entities/location.entity";
import { LocationResponseDto } from "./location.response.dto";

export class LocationMapper {
  static toDto(location: Location): LocationResponseDto {
    return {
      id: location.id,
      name: location.name,
      code: location.code,
      lat: location.lat,
      lng: location.lng,
      flag: location.flag,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    };
  }

  static toDtoList(locations: Location[]): LocationResponseDto[] {
    return locations.map((location) => this.toDto(location));
  }
}

