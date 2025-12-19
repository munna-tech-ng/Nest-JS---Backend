import { Os as OsSchema } from "src/infra/db/schema/system/os";

export class Os {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly code: string,
    public readonly description: string,
    public readonly isDeleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromSchema(schema: OsSchema): Os {
    return new Os(
      schema.id,
      schema.name,
      schema.code,
      schema.description ?? "",
      schema.is_deleted ?? false,
      schema.createdAt,
      schema.updatedAt,
    );
  }
}

