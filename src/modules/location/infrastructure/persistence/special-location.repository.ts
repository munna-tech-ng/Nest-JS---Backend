import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, inArray, sql } from "drizzle-orm";
import { SpecialLocationRepositoryPort } from "../../domain/contracts/special-location-repository.port";
import { SpecialLocation } from "../../domain/entities/special-location.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import * as schema from "src/infra/db/schema";

@Injectable()
export class SpecialLocationRepository implements SpecialLocationRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: { locationId: number; type: string }): Promise<SpecialLocation> {
    const [result] = await this.db
      .insert(schema.special_location)
      .values({
        location_id: data.locationId,
        type: data.type,
      })
      .returning();

    return SpecialLocation.fromSchema(result);
  }

  async update(id: number, data: { locationId?: number; type?: string }): Promise<SpecialLocation> {
    const updateData: any = {};
    if (data.locationId !== undefined) updateData.location_id = data.locationId;
    if (data.type !== undefined) updateData.type = data.type;
    updateData.updatedAt = new Date();

    const [result] = await this.db
      .update(schema.special_location)
      .set(updateData)
      .where(eq(schema.special_location.id, id))
      .returning();

    if (!result) {
      throw new Error("Special location not found");
    }

    return SpecialLocation.fromSchema(result);
  }

  async findById(id: number): Promise<SpecialLocation | null> {
    const result = await this.db.query.special_location.findFirst({
      where: eq(schema.special_location.id, id),
    });

    return result ? SpecialLocation.fromSchema(result) : null;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    locationId?: number;
  }): Promise<{ items: SpecialLocation[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 2;
    const offset = (page - 1) * limit;

    const conditions = options.locationId
      ? eq(schema.special_location.location_id, options.locationId)
      : undefined;

    const [items, totalResult] = await Promise.all([
      this.db.query.special_location.findMany({
        where: conditions,
        limit,
        offset,
        orderBy: (specialLocation, { desc }) => [desc(specialLocation.createdAt)],
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.special_location)
        .where(conditions ?? sql`1=1`),
    ]);

    return {
      items: items.map((item) => SpecialLocation.fromSchema(item)),
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    };
  }

  async delete(id: number): Promise<void> {
    // Since special_location doesn't have is_deleted, we'll do permanent delete
    await this.deletePermanent(id);
  }

  async deleteMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.deletePermanentMultiple(ids);
  }

  async restore(id: number): Promise<void> {
    // Special location doesn't have soft delete, so restore is a no-op
    const specialLocation = await this.findById(id);
    if (!specialLocation) {
      throw new Error("Special location not found");
    }
  }

  async restoreMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    for (const id of ids) {
      await this.restore(id);
    }
  }

  async deletePermanent(id: number): Promise<void> {
    await this.db.delete(schema.special_location).where(eq(schema.special_location.id, id));
  }

  async deletePermanentMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db.delete(schema.special_location).where(inArray(schema.special_location.id, ids));
  }
}

