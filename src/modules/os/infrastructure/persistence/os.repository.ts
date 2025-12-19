import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and, inArray, sql, asc, desc } from "drizzle-orm";
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
    isPaginate?: boolean;
    orderBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ items: Os[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const isPaginate = options.isPaginate ?? true;
    const includeDeleted = options.includeDeleted ?? false;
    const orderBy = options.orderBy ?? "createdAt";
    const sortOrder = options.sortOrder ?? "desc";

    const conditions = includeDeleted ? undefined : eq(schema.os.is_deleted, false);

    const orderFn = sortOrder === "asc" ? asc : desc;
    let orderByClause: any[];
    switch (orderBy) {
      case "name":
        orderByClause = [orderFn(schema.os.name)];
        break;
      case "code":
        orderByClause = [orderFn(schema.os.code)];
        break;
      case "createdAt":
        orderByClause = [orderFn(schema.os.createdAt)];
        break;
      case "updatedAt":
        orderByClause = [orderFn(schema.os.updatedAt)];
        break;
      default:
        orderByClause = [orderFn(schema.os.createdAt)];
    }

    const queryOptions: any = {
      where: conditions,
      orderBy: orderByClause,
    };

    if (isPaginate) {
      queryOptions.limit = limit;
      queryOptions.offset = (page - 1) * limit;
    }

    const [items, totalResult] = await Promise.all([
      this.db.query.os.findMany(queryOptions),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.os)
        .where(conditions ?? sql`1=1`),
    ]);

    return {
      items: items.map((item) => Os.fromSchema(item)),
      total: Number(totalResult[0]?.count ?? 0),
      page: isPaginate ? page : 1,
      limit: isPaginate ? limit : items.length,
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

