import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and, inArray, sql, asc, desc } from "drizzle-orm";
import { CategoryRepositoryPort } from "../../domain/contracts/category-repository.port";
import { Category } from "../../domain/entities/category.entity";
import { DRIZZLE } from "src/infra/db/db.config";
import * as schema from "src/infra/db/schema";

@Injectable()
export class CategoryRepository implements CategoryRepositoryPort {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: { name: string; description?: string }): Promise<Category> {
    const [result] = await this.db
      .insert(schema.category)
      .values({
        name: data.name,
        description: data.description ?? "",
      })
      .returning();

    return Category.fromSchema(result);
  }

  async update(id: number, data: { name?: string; description?: string }): Promise<Category> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    updateData.updatedAt = new Date();

    const [result] = await this.db
      .update(schema.category)
      .set(updateData)
      .where(eq(schema.category.id, id))
      .returning();

    if (!result) {
      throw new Error("Category not found");
    }

    return Category.fromSchema(result);
  }

  async findById(id: number, includeDeleted: boolean = false): Promise<Category | null> {
    const conditions = includeDeleted
      ? eq(schema.category.id, id)
      : and(eq(schema.category.id, id), eq(schema.category.is_deleted, false));

    const result = await this.db.query.category.findFirst({
      where: conditions,
    });

    return result ? Category.fromSchema(result) : null;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
    isPaginate?: boolean;
    orderBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ items: Category[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const isPaginate = options.isPaginate ?? true;
    const includeDeleted = options.includeDeleted ?? false;
    const orderBy = options.orderBy ?? "createdAt";
    const sortOrder = options.sortOrder ?? "desc";

    const conditions = includeDeleted ? undefined : eq(schema.category.is_deleted, false);

    // Build orderBy clause dynamically
    const orderFn = sortOrder === "asc" ? asc : desc;
    let orderByClause: any[];
    switch (orderBy) {
      case "name":
        orderByClause = [orderFn(schema.category.name)];
        break;
      case "createdAt":
        orderByClause = [orderFn(schema.category.createdAt)];
        break;
      case "updatedAt":
        orderByClause = [orderFn(schema.category.updatedAt)];
        break;
      default:
        orderByClause = [orderFn(schema.category.createdAt)];
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
      this.db.query.category.findMany(queryOptions),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.category)
        .where(conditions ?? sql`1=1`),
    ]);

    return {
      items: items.map((item) => Category.fromSchema(item)),
      total: Number(totalResult[0]?.count ?? 0),
      page: isPaginate ? page : 1,
      limit: isPaginate ? limit : items.length,
    };
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(schema.category)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(eq(schema.category.id, id));
  }

  async deleteMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db
      .update(schema.category)
      .set({ is_deleted: true, updatedAt: new Date() })
      .where(inArray(schema.category.id, ids));
  }

  async restore(id: number): Promise<void> {
    await this.db
      .update(schema.category)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(eq(schema.category.id, id));
  }

  async restoreMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db
      .update(schema.category)
      .set({ is_deleted: false, updatedAt: new Date() })
      .where(inArray(schema.category.id, ids));
  }

  async deletePermanent(id: number): Promise<void> {
    await this.db.delete(schema.category).where(eq(schema.category.id, id));
  }

  async deletePermanentMultiple(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db.delete(schema.category).where(inArray(schema.category.id, ids));
  }
}

