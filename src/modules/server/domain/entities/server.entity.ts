import { ServerSchema } from "src/infra/db/schema/servers/server";

export class Server {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly ip: string,
    public readonly port: number,
    public readonly status: string,
    public readonly isPremium: boolean,
    public readonly isActive: boolean,
    public readonly isDeleted: boolean,
    public readonly ccu: number,
    public readonly maxCcu: number,
    public readonly bandwidth: number,
    public readonly speed: number,
    public readonly priority: number,
    public readonly flag: string,
    public readonly locationId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly description: string,
  ) {}

  static fromSchema(schema: ServerSchema): Server {
    return new Server(
      schema.id,
      schema.name,
      schema.ip,
      schema.port ?? 3500,
      schema.status ?? "offline",
      schema.is_premium ?? false,
      schema.is_active ?? true,
      schema.is_deleted ?? false,
      schema.ccu ?? 0,
      schema.max_ccu ?? 100,
      schema.bandwidth ?? 0,
      schema.speed ?? 0,
      schema.priority ?? 0,
      schema.flag ?? "",
      schema.location_id ?? 0,
      schema.createdAt,
      schema.updatedAt,
      schema.description ?? "",
    );
  }
}

