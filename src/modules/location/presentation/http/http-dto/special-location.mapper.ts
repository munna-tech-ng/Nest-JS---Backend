import { SpecialLocation } from "../../../domain/entities/special-location.entity";
import { SpecialLocationResponseDto } from "./special-location.response.dto";

export class SpecialLocationMapper {
  static toDto(specialLocation: SpecialLocation): SpecialLocationResponseDto {
    return {
      id: specialLocation.id,
      locationId: specialLocation.locationId,
      type: specialLocation.type,
      createdAt: specialLocation.createdAt,
      updatedAt: specialLocation.updatedAt,
    };
  }

  static toDtoList(specialLocations: SpecialLocation[]): SpecialLocationResponseDto[] {
    return specialLocations.map((specialLocation) => this.toDto(specialLocation));
  }
}

