import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, inArray, sql, asc, desc } from "drizzle-orm";
import { LocationRepositoryPort } from "../../domain/contracts/location-repository.port";
import { Location } from "../../domain/entities/location.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import * as schema from "src/infra/db/schema";

@Injectable()
export class LocationRepository implements LocationRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: { name: string; code: string; lat?: string; lng?: string; flag?: string }): Promise<Location> {
    // Ensure flag is always a string (path), not binary data or Buffer
    const flagValue = typeof data.flag === 'string' ? data.flag : (data.flag ? String(data.flag) : '');
    
    const [result] = await this.db
      .insert(schema.location)
      .values({
        name: data.name,
        code: data.code.toLowerCase(),
        lat: data.lat ?? "",
        lng: data.lng ?? "",
        flag: flagValue,
      })
      .returning();

    return Location.fromSchema(result);
  }

  async update(id: number, data: { name?: string; code?: string; lat?: string; lng?: string; flag?: string }): Promise<Location> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code.toLowerCase();
    if (data.lat !== undefined) updateData.lat = data.lat;
    if (data.lng !== undefined) updateData.lng = data.lng;
    if (data.flag !== undefined) updateData.flag = data.flag;
    updateData.updatedAt = new Date();

    const [result] = await this.db
      .update(schema.location)
      .set(updateData)
      .where(eq(schema.location.id, id))
      .returning();

    if (!result) {
      throw new Error("Location not found");
    }

    return Location.fromSchema(result);
  }

  async findById(id: number): Promise<Location | null> {
    const result = await this.db.query.location.findFirst({
      where: eq(schema.location.id, id),
    });

    return result ? Location.fromSchema(result) : null;
  }

  async findByName(name: string): Promise<Location | null> {
    const result = await this.db.query.location.findFirst({
      where: eq(schema.location.name, name),
    });
    return result ? Location.fromSchema(result) : null;
  }

  async findByCode(code: string): Promise<Location | null> {
    const result = await this.db.query.location.findFirst({
      where: eq(schema.location.code, code.toLowerCase()),
    });
    return result ? Location.fromSchema(result) : null;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    isPaginate?: boolean;
    orderBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ items: Location[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const isPaginate = options.isPaginate ?? true;
    const orderBy = options.orderBy ?? "createdAt";
    const sortOrder = options.sortOrder ?? "desc";

    const orderFn = sortOrder === "asc" ? asc : desc;
    let orderByClause: any[];
    switch (orderBy) {
      case "name":
        orderByClause = [orderFn(schema.location.name)];
        break;
      case "code":
        orderByClause = [orderFn(schema.location.code)];
        break;
      case "createdAt":
        orderByClause = [orderFn(schema.location.createdAt)];
        break;
      case "updatedAt":
        orderByClause = [orderFn(schema.location.updatedAt)];
        break;
      default:
        orderByClause = [orderFn(schema.location.createdAt)];
    }

    const queryOptions: any = {
      orderBy: orderByClause,
    };

    if (isPaginate) {
      queryOptions.limit = limit;
      queryOptions.offset = (page - 1) * limit;
    }

    const [items, totalResult] = await Promise.all([
      this.db.query.location.findMany(queryOptions),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.location),
    ]);

    return {
      items: items.map((item) => Location.fromSchema(item)),
      total: Number(totalResult[0]?.count ?? 0),
      page: isPaginate ? page : 1,
      limit: isPaginate ? limit : items.length,
    };
  }

  async delete(id: number): Promise<void> {
    // Since location doesn't have is_deleted, we'll do permanent delete
    await this.deletePermanent(id);
  }

  async deleteMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.deletePermanentMultiple(ids);
  }

  async restore(id: number): Promise<void> {
    // Location doesn't have soft delete, so restore is a no-op
    // But we'll check if it exists
    const location = await this.findById(id);
    if (!location) {
      throw new Error("Location not found");
    }
  }

  async restoreMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    // Location doesn't have soft delete, so restore is a no-op
    for (const id of ids) {
      await this.restore(id);
    }
  }

  async deletePermanent(id: number): Promise<void> {
    await this.db.delete(schema.location).where(eq(schema.location.id, id));
  }

  async deletePermanentMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db.delete(schema.location).where(inArray(schema.location.id, ids));
  }
}

