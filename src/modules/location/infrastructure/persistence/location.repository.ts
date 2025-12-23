import { Inject, Injectable } from "@nestjs/common";
import { eq, inArray, sql } from "drizzle-orm";
import { LocationRepositoryPort } from "../../domain/contracts/location-repository.port";
import { Location } from "../../domain/entities/location.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import * as schema from "src/infra/db/schema";
import { Database } from "src/infra/db/db.module";

@Injectable()
export class LocationRepository implements LocationRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: Database,
  ) { }

  async create(data: { name: string; code: string; lat?: string; lng?: string; flag?: string }): Promise<Location> {
    const [result] = await this.db
      .insert(schema.location)
      .values({
        name: data.name,
        code: data.code.toLowerCase(),
        lat: data.lat ?? "",
        lng: data.lng ?? "",
        flag: data.flag ?? "",
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
    // Query API v2: where should use callback function, not SQL objects
    const result = await this.db.query.location.findFirst({
      where: (location, { eq }) => eq(location.id, id),
    });

    return result ? Location.fromSchema(result) : null;
  }

  async findByName(name: string): Promise<Location | null> {
    // Query API v2: where should use callback function, not SQL objects
    const [result] = await this.db.select().from(schema.location)
      .where(eq(schema.location.name, name))
      .limit(1);
    return result ? Location.fromSchema(result) : null;
  }

  async findByCode(code: string): Promise<Location | null> {
    // Use regular query builder for case-insensitive comparison
    // Query API v2 doesn't support calling methods on column references
    const [result] = await this.db
      .select()
      .from(schema.location)
      .where(eq(schema.location.code, code.toLowerCase()))
      .limit(1);

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

    // For query API v2: orderBy should be an object { field: "asc" | "desc" }
    let orderByForQueryAPI: Record<string, "asc" | "desc">;

    switch (orderBy) {
      case "name":
        orderByForQueryAPI = { name: sortOrder };
        break;
      case "code":
        orderByForQueryAPI = { code: sortOrder };
        break;
      case "createdAt":
        orderByForQueryAPI = { createdAt: sortOrder };
        break;
      case "updatedAt":
        orderByForQueryAPI = { updatedAt: sortOrder };
        break;
      default:
        orderByForQueryAPI = { createdAt: sortOrder };
    }

    const queryOptions: any = {
      orderBy: orderByForQueryAPI,
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

