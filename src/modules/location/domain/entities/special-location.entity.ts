import { special_location } from "src/infra/db/schema/location/special_location";

type SpecialLocationSchema = typeof special_location.$inferSelect;

export class SpecialLocation {
  constructor(
    public readonly id: number,
    public readonly locationId: number,
    public readonly type: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromSchema(schema: SpecialLocationSchema): SpecialLocation {
    return new SpecialLocation(
      schema.id,
      schema.location_id,
      schema.type,
      schema.createdAt,
      schema.updatedAt,
    );
  }
}

