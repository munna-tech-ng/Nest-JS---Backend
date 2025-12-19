import { Os } from "../../../domain/entities/os.entity";
import { OsResponseDto } from "./os.response.dto";

export class OsMapper {
  static toDto(os: Os): OsResponseDto {
    return {
      id: os.id,
      name: os.name,
      code: os.code,
      description: os.description,
      isDeleted: os.isDeleted,
      createdAt: os.createdAt,
      updatedAt: os.updatedAt,
    };
  }

  static toDtoList(oses: Os[]): OsResponseDto[] {
    return oses.map((os) => this.toDto(os));
  }
}

