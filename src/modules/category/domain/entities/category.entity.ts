import { Category as CategorySchema } from "src/infra/db/schema/servers/category";

export class Category {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly isDeleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromSchema(schema: CategorySchema): Category {
    return new Category(
      schema.id,
      schema.name,
      schema.description ?? "",
      schema.is_deleted ?? false,
      schema.createdAt,
      schema.updatedAt,
    );
  }
}

