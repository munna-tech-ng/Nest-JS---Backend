import { Tag as TagSchema } from "src/infra/db/schema/servers/tag";

export class Tag {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly isDeleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromSchema(schema: TagSchema): Tag {
    return new Tag(
      schema.id,
      schema.name,
      schema.description ?? "",
      schema.is_deleted ?? false,
      schema.createdAt,
      schema.updatedAt,
    );
  }
}

