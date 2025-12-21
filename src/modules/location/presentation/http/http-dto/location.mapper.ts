import { Location } from "../../../domain/entities/location.entity";
import { LocationResponseDto } from "./location.response.dto";

export class LocationMapper {
  static toDto(location: Location, path?: string): LocationResponseDto {
    return {
      id: location.id,
      name: location.name,
      code: location.code,
      lat: location.lat,
      lng: location.lng,
      flag: path ? path + "/" + location.flag : location.flag,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    };
  }

  static toDtoList(locations: Location[], path?: string): LocationResponseDto[] {
    const fileManagerUrl = this.getFileManagerUrl(path);
    return locations.map((location) => this.toDto(location, fileManagerUrl));
  }

  private static getFileManagerUrl(path?: string): string {
    return path ?? process.env.APP_URL ?? "";
  }
}

