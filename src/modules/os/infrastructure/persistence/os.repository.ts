import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and, inArray, sql } from "drizzle-orm";
import { OsRepositoryPort } from "../../domain/contracts/os-repository.port";
import { Os } from "../../domain/entities/os.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import * as schema from "src/infra/db/schema";

@Injectable()
export class OsRepository implements OsRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: { name: string; code: string; description?: string }): Promise<Os> {
    const [result] = await this.db
      .insert(schema.os)
      .values({
        name: data.name,
        code: data.code,
        description: data.description ?? "",
      })
      .returning();

    return Os.fromSchema(result);
  }

  async update(id: number, data: { name?: string; code?: string; description?: string }): Promise<Os> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    updateData.updatedAt = new Date();

    const [result] = await this.db
      .update(schema.os)
      .set(updateData)
      .where(eq(schema.os.id, id))
      .returning();

    if (!result) {
      throw new Error("OS not found");
    }

    return Os.fromSchema(result);
  }

  async findById(id: number, includeDeleted: boolean = false): Promise<Os | null> {
    const conditions = includeDeleted
      ? eq(schema.os.id, id)
      : and(eq(schema.os.id, id), eq(schema.os.is_deleted, false));

    const result = await this.db.query.os.findFirst({
      where: conditions,
    });

    return result ? Os.fromSchema(result) : null;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
  }): Promise<{ items: Os[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 2;
    const offset = (page - 1) * limit;
    const includeDeleted = options.includeDeleted ?? false;

    const conditions = includeDeleted ? undefined : eq(schema.os.is_deleted, false);

    const [items, totalResult] = await Promise.all([
      this.db.query.os.findMany({
        where: conditions,
        limit,
        offset,
        orderBy: (os, { desc }) => [desc(os.createdAt)],
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.os)
        .where(conditions ?? sql`1=1`),
    ]);

    return {
      items: items.map((item) => Os.fromSchema(item)),
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    };
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(schema.os)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(eq(schema.os.id, id));
  }

  async deleteMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(schema.os)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(inArray(schema.os.id, ids));
  }

  async restore(id: number): Promise<void> {
    await this.db
      .update(schema.os)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(eq(schema.os.id, id));
  }

  async restoreMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(schema.os)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(inArray(schema.os.id, ids));
  }

  async deletePermanent(id: number): Promise<void> {
    await this.db.delete(schema.os).where(eq(schema.os.id, id));
  }

  async deletePermanentMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db.delete(schema.os).where(inArray(schema.os.id, ids));
  }
}

