import { Location as LocationSchema } from "src/infra/db/schema/location/location";

export class Location {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly code: string,
    public readonly lat: string,
    public readonly lng: string,
    public readonly flag: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromSchema(schema: LocationSchema): Location {
    return new Location(
      schema.id,
      schema.name,
      schema.code,
      schema.lat ?? "",
      schema.lng ?? "",
      schema.flag ?? "",
      schema.createdAt,
      schema.updatedAt,
    );
  }
}

