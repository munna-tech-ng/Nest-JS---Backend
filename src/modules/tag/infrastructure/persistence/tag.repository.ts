import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and, inArray, sql, asc, desc } from "drizzle-orm";
import { TagRepositoryPort } from "../../domain/contracts/tag-repository.port";
import { Tag } from "../../domain/entities/tag.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import * as schema from "src/infra/db/schema";

@Injectable()
export class TagRepository implements TagRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: { name: string; description?: string }): Promise<Tag> {
    const [result] = await this.db
      .insert(schema.tag)
      .values({
        name: data.name,
        description: data.description ?? "",
      })
      .returning();

    return Tag.fromSchema(result);
  }

  async update(id: number, data: { name?: string; description?: string }): Promise<Tag> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    updateData.updatedAt = new Date();

    const [result] = await this.db
      .update(schema.tag)
      .set(updateData)
      .where(eq(schema.tag.id, id))
      .returning();

    if (!result) {
      throw new Error("Tag not found");
    }

    return Tag.fromSchema(result);
  }

  async findById(id: number, includeDeleted: boolean = false): Promise<Tag | null> {
    const conditions = includeDeleted
      ? eq(schema.tag.id, id)
      : and(eq(schema.tag.id, id), eq(schema.tag.is_deleted, false));

    const result = await this.db.query.tag.findFirst({
      where: conditions,
    });

    return result ? Tag.fromSchema(result) : null;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
    isPaginate?: boolean;
    orderBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ items: Tag[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const isPaginate = options.isPaginate ?? true;
    const includeDeleted = options.includeDeleted ?? false;
    const orderBy = options.orderBy ?? "createdAt";
    const sortOrder = options.sortOrder ?? "desc";

    const conditions = includeDeleted ? undefined : eq(schema.tag.is_deleted, false);

    const orderFn = sortOrder === "asc" ? asc : desc;
    let orderByClause: any[];
    switch (orderBy) {
      case "name":
        orderByClause = [orderFn(schema.tag.name)];
        break;
      case "createdAt":
        orderByClause = [orderFn(schema.tag.createdAt)];
        break;
      case "updatedAt":
        orderByClause = [orderFn(schema.tag.updatedAt)];
        break;
      default:
        orderByClause = [orderFn(schema.tag.createdAt)];
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
      this.db.query.tag.findMany(queryOptions),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.tag)
        .where(conditions ?? sql`1=1`),
    ]);

    return {
      items: items.map((item) => Tag.fromSchema(item)),
      total: Number(totalResult[0]?.count ?? 0),
      page: isPaginate ? page : 1,
      limit: isPaginate ? limit : items.length,
    };
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(schema.tag)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(eq(schema.tag.id, id));
  }

  async deleteMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(schema.tag)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(inArray(schema.tag.id, ids));
  }

  async restore(id: number): Promise<void> {
    await this.db
      .update(schema.tag)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(eq(schema.tag.id, id));
  }

  async restoreMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .update(schema.tag)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(inArray(schema.tag.id, ids));
  }

  async deletePermanent(id: number): Promise<void> {
    await this.db.delete(schema.tag).where(eq(schema.tag.id, id));
  }

  async deletePermanentMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db.delete(schema.tag).where(inArray(schema.tag.id, ids));
  }
}

